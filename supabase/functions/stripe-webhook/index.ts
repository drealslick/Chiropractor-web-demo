// Follow this setup guide to integrate the Deno runtime into your Supabase functions:
// https://deno.land/manual/examples/deploy_on_deno_deploy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

  try {
    const body = await req.text();
    let event;

    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        Stripe.createFetchHttpClient()
      );
    } else {
      event = JSON.parse(body);
    }

    // Handle payment_intent.succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const appointmentId = metadata.appointment_id;

      if (appointmentId) {
        // Automatically lock in appointment status and update payment state
        const { error } = await supabase
          .from("appointments")
          .update({
            payment_status: "paid_full",
            status: "confirmed",
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq("id", appointmentId);

        if (error) {
          console.error("Failed to update appointment on webhook:", error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
