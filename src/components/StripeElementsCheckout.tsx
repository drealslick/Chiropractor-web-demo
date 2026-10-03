import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { isExplicitDemo } from '../lib/mode';
import { notifyDemoAction } from '../lib/data-provider';
import { Lock, ShieldCheck, RefreshCw, AlertCircle, CreditCard, RotateCcw } from 'lucide-react';

interface StripeElementsCheckoutProps {
  clinicId: string;
  appointmentId: string;
  amount: number;
  currencySymbol: string;
  paymentChoice: 'deposit' | 'full' | 'card_hold' | 'pay_at_clinic';
  patientEmail: string;
  patientName: string;
  serviceTitle: string;
  onSuccess: (details: {
    paymentIntentId: string;
    status: string;
    amount: number;
    last4?: string;
    brand?: string;
  }) => void;
  onFallbackToDemo?: (reason?: string) => void;
}

// Inner Form component that utilizes useStripe and useElements hooks
const CheckoutForm: React.FC<{
  amount: number;
  currencySymbol: string;
  paymentChoice: string;
  isSetupIntent?: boolean;
  patientName: string;
  patientEmail: string;
  onSuccess: StripeElementsCheckoutProps['onSuccess'];
}> = ({ amount, currencySymbol, paymentChoice, isSetupIntent, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCardOnFile = isSetupIntent || paymentChoice === 'card_hold' || paymentChoice === 'card_on_file' || paymentChoice === 'setup_only';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (isCardOnFile) {
        // Zero-charge Card-on-File Setup confirmation
        const result = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
        });

        if (result.error) {
          setErrorMessage(result.error.message || 'Card authorization failed. Please check your card details.');
          setIsProcessing(false);
        } else if (result.setupIntent && result.setupIntent.status === 'succeeded') {
          onSuccess({
            paymentIntentId: result.setupIntent.id,
            status: 'card_saved',
            amount: 0,
            last4: '••••',
            brand: 'Verified Card on File',
          });
        } else {
          setErrorMessage(
            `Card authorization status: ${result.setupIntent?.status || 'unknown'}. Please retry or contact clinic reception.`
          );
          setIsProcessing(false);
        }
      } else {
        // Direct PaymentIntent confirmation
        const result = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (result.error) {
          setErrorMessage(result.error.message || 'Payment processing failed. Please check your card details.');
          setIsProcessing(false);
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          const pi = result.paymentIntent;
          onSuccess({
            paymentIntentId: pi.id,
            status: pi.status,
            amount: (pi.amount || 0) / 100,
            last4: '••••',
            brand: 'Verified Card',
          });
        } else if (result.paymentIntent && result.paymentIntent.status === 'processing') {
          onSuccess({
            paymentIntentId: result.paymentIntent.id,
            status: 'processing',
            amount: amount / 100,
            last4: '••••',
            brand: 'Processing',
          });
        } else {
          // Do NOT synthesize a successful transaction if status is not verified
          setErrorMessage(
            `Payment could not be confirmed (Status: ${result.paymentIntent?.status || 'unknown'}). Please retry or contact clinic reception.`
          );
          setIsProcessing(false);
        }
      }
    } catch (err: any) {
      console.error('Stripe confirmation error:', err);
      setErrorMessage(err.message || 'Unexpected payment error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>{isCardOnFile ? 'Save Card on File' : 'Secure Stripe Elements'}</span>
          </div>
          <span className="text-stone-400 text-[11px]">
            {isCardOnFile ? (
              <strong className="text-emerald-400 font-bold">Zero Charge Today (£0.00)</strong>
            ) : (
              <>
                Amount Due: <strong className="text-white font-bold">{currencySymbol || '£'}{(amount / 100).toFixed(2)}</strong>
              </>
            )}
          </span>
        </div>

        {isCardOnFile && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 leading-relaxed">
            Your card details are securely stored on file per the clinic’s appointment cancellation policy. You will not be charged today; your fee is payable upon attendance.
          </div>
        )}

        <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-100">Payment Error</p>
            <p className="text-[11px] text-rose-300">{errorMessage}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{isCardOnFile ? 'Saving Card on File...' : 'Processing Card Authorization...'}</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>
              {isCardOnFile
                ? 'Save Card on File (Zero Charge Today)'
                : `Confirm & Pay ${currencySymbol || '£'}${(amount / 100).toFixed(2)}`}
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-[10px] text-stone-500 pt-1">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-Bit TLS Encryption</span>
        </div>
        <span>•</span>
        <span>PCI-DSS Level 1 Compliant</span>
      </div>
    </form>
  );
};

export const StripeElementsCheckout: React.FC<StripeElementsCheckoutProps> = ({
  clinicId,
  appointmentId,
  amount,
  currencySymbol,
  paymentChoice,
  patientEmail,
  patientName,
  serviceTitle,
  onSuccess,
  onFallbackToDemo,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSetupIntent, setIsSetupIntent] = useState<boolean>(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  const isDemo = isExplicitDemo();

  const initializeIntent = async () => {
    setIsLoadingIntent(true);
    setInitError(null);

    // If explicit demo mode is on, notify and fall back to sandbox simulator
    if (isDemo) {
      notifyDemoAction(`✓ Would charge ${currencySymbol || '£'}${(amount / 100).toFixed(2)} (Demo Mode - card not charged)`);
      if (onFallbackToDemo) {
        onFallbackToDemo('Demo Mode active: Payment is simulated without live card processing.');
      }
      setIsLoadingIntent(false);
      return;
    }

    // LIVE MODE: Real Stripe Call — NEVER fabricate success on error
    try {
      const createIntentFn = httpsCallable(functions, 'createPaymentIntent');
      const currencyCode = currencySymbol === '£' ? 'gbp' : currencySymbol === '€' ? 'eur' : 'usd';

      const result: any = await createIntentFn({
        clinicId,
        appointmentId,
        amount,
        currency: currencyCode,
        paymentChoice,
        patientEmail,
        patientName,
        serviceTitle,
      });

      const data = result.data;

      if (data?.isDemoMode) {
        // In live mode, server returning isDemoMode indicates missing clinic Stripe configuration
        setInitError(data.message || 'Online card payments are not yet configured for this clinic.');
        setIsLoadingIntent(false);
        return;
      }

      if (data?.clientSecret && data?.publishableKey) {
        const stripeInstance = loadStripe(
          data.publishableKey,
          data.stripeAccountId ? { stripeAccount: data.stripeAccountId } : undefined
        );
        setStripePromise(stripeInstance);
        setClientSecret(data.clientSecret);
        setIsSetupIntent(data.isSetupIntent === true);
      } else {
        setInitError('Live Stripe public keys are not configured on this deployment.');
      }
    } catch (err: any) {
      console.error('Stripe initialization error:', err);
      // In LIVE mode, an error MUST NOT synthesize a successful transaction or secretly switch to demo!
      setInitError(err.message || 'Unable to connect to secure payment gateway.');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  useEffect(() => {
    initializeIntent();
  }, [clinicId, appointmentId, amount, currencySymbol, paymentChoice, patientEmail, patientName, serviceTitle]);

  if (isLoadingIntent) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-400">
        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
        <span className="text-xs font-medium">Connecting to Secure Stripe Terminal...</span>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs space-y-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-100 text-sm">Payment Terminal Notice</h4>
            <p className="text-stone-300 text-xs mt-1 leading-relaxed">{initError}</p>
          </div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={initializeIntent}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  if (clientSecret && stripePromise) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#10b981',
              colorBackground: '#1c1917',
              colorText: '#f5f5f4',
              colorDanger: '#f43f5e',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        }}
      >
        <CheckoutForm
          amount={amount}
          currencySymbol={currencySymbol}
          paymentChoice={paymentChoice}
          isSetupIntent={isSetupIntent}
          patientName={patientName}
          patientEmail={patientEmail}
          onSuccess={onSuccess}
        />
      </Elements>
    );
  }

  return null;
};
