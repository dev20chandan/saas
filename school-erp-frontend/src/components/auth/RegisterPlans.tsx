'use client';

import { useState } from 'react';

export type BillingCycle = 'monthly' | 'yearly';

export interface PlansData {
  selectedPlan: 'Basic' | 'Standard' | 'Premium' | '';
  billingCycle: BillingCycle;
}

interface RegisterPlansProps {
  data: PlansData;
  onChange: (field: keyof PlansData, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const plans = [
  {
    name: 'Basic',
    tagline: 'Perfect for small schools',
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    students: 'Up to 500 Students',
    teachers: 'Up to 50 Teachers',
    features: ['Basic Modules', 'Email Support'],
    popular: false,
    color: 'slate',
  },
  {
    name: 'Standard',
    tagline: 'Ideal for growing schools',
    monthlyPrice: 2999,
    yearlyPrice: 2399,
    students: 'Up to 2,500 Students',
    teachers: 'Up to 120 Teachers',
    features: ['All Core Modules', 'Priority Support'],
    popular: true,
    color: 'blue',
  },
  {
    name: 'Premium',
    tagline: 'Advanced for large institutions',
    monthlyPrice: 5999,
    yearlyPrice: 4799,
    students: 'Up to 10,000 Students',
    teachers: 'Up to 500 Teachers',
    features: ['All Modules & Features', '24/7 Premium Support'],
    popular: false,
    color: 'slate',
  },
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

export default function RegisterPlans({ data, onChange, onBack, onNext }: RegisterPlansProps) {
  const isYearly = data.billingCycle === 'yearly';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.selectedPlan) {
      alert('Ek plan select karein.');
      return;
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-800">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Choose Your Plan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select the best plan for your school</p>
          </div>

          {/* Monthly / Yearly toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 w-max self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChange('billingCycle', 'monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onChange('billingCycle', 'yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = data.selectedPlan === plan.name;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                onClick={() => onChange('selectedPlan', plan.name)}
                className={`relative border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                  plan.popular
                    ? isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/50'
                      : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
                    : isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Selection indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 mt-1">{plan.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{plan.tagline}</p>

                <div className="mt-4 mb-4">
                  <span className="text-xs text-slate-500 font-medium">₹</span>
                  <span className="text-3xl font-extrabold text-slate-900 mx-0.5">
                    {price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>

                <ul className="space-y-2 text-[11px] text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckIcon />
                    {plan.students}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckIcon />
                    {plan.teachers}
                  </li>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onChange('selectedPlan', plan.name)}
                  className={`mt-5 w-full h-9 rounded-xl text-xs font-bold transition-all ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-10 border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg px-6 text-xs font-bold transition-all flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-500/10"
        >
          <span>Next: Review & Confirm</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
