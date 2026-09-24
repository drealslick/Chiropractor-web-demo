import { PricingFeeItem, FinancingOption } from '../types';

export const defaultPricingFees: PricingFeeItem[] = [
  {
    id: 'new-patient',
    title: 'New Patient',
    price: '£49',
    description: 'Book directly. No GP referral required. Complete consultation and personalized care plan.',
    badge: 'Recommended First Step',
    icon: 'user',
    popular: true,
    features: [
      'Full biomechanical history',
      'Postural & movement assessment',
      'Report of findings',
      'Your first gentle adjustment',
    ],
  },
  {
    id: 'follow-up',
    title: 'Follow-up',
    price: '£50',
    description: 'No packages you have to buy today. Treatment frequency is based solely on your exam findings.',
    badge: 'Standard Visit',
    icon: 'refresh',
    popular: false,
    features: [
      'Targeted spinal adjustment',
      'Soft tissue release',
      'Rehab exercise progression',
    ],
  },
];

export const defaultFinancingOption: FinancingOption = {
  enabled: true,
  provider: 'Klarna & 0% Care Financing',
  badge: '0% Interest Available',
  headline: 'Flexible Payment & Care Financing Plans',
  description:
    'We believe financial stress should never stand between you and a healthy, pain-free spine. Spread treatment costs over 3 to 12 months.',
  terms: 'Simple 60-second digital application. Soft credit check with no impact on your credit score.',
  features: [
    'Pay in 3 interest-free installments via Klarna or debit card',
    '0% APR patient financing for multi-visit corrective plans',
    'Direct insurance claim receipts provided for health cash plans',
    'No pre-payment penalties or hidden processing fees',
  ],
  ctaText: 'Inquire About Payment Plans',
};
