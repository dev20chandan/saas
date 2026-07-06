'use client';

import type { SchoolInfoData } from './RegisterSchoolInfo';
import type { AdminInfoData } from './RegisterAdminInfo';
import type { PlansData } from './RegisterPlans';

interface RegisterReviewProps {
  schoolInfo: SchoolInfoData;
  adminInfo: AdminInfoData;
  plansData: PlansData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

const SectionRow = ({ label, value }: { label: string; value: string }) =>
  value ? (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
      <span className="text-xs text-slate-500 font-medium sm:w-40 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-800 font-semibold">{value}</span>
    </div>
  ) : null;

const SectionCard = ({
  icon,
  title,
  children,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) => (
  <div className="border border-slate-100 rounded-xl p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          {icon}
        </div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[11px] font-semibold text-blue-600 hover:underline border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1 transition-colors"
      >
        Edit
      </button>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

export default function RegisterReview({
  schoolInfo,
  adminInfo,
  plansData,
  onBack,
  onSubmit,
  submitting,
}: RegisterReviewProps) {
  const planPrices: Record<string, { monthly: number; yearly: number }> = {
    Basic: { monthly: 1499, yearly: 1199 },
    Standard: { monthly: 2999, yearly: 2399 },
    Premium: { monthly: 5999, yearly: 4799 },
  };

  const planPrice = plansData.selectedPlan
    ? planPrices[plansData.selectedPlan]?.[plansData.billingCycle]
    : null;

  return (
    <div className="space-y-6 text-slate-800">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Review & Confirm</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please review your details before confirming</p>
          </div>
        </div>

        {/* Summary sections */}
        <div className="space-y-4">

          {/* School Info */}
          <SectionCard
            title="School Information"
            onEdit={onBack}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <SectionRow label="School Name" value={schoolInfo.schoolName} />
              <SectionRow label="School Code" value={schoolInfo.schoolCode} />
              <SectionRow label="Type" value={schoolInfo.schoolType} />
              <SectionRow label="Established" value={schoolInfo.establishedYear} />
              <SectionRow
                label="Address"
                value={[schoolInfo.address, schoolInfo.city, schoolInfo.state, schoolInfo.country, schoolInfo.pincode]
                  .filter(Boolean)
                  .join(', ')}
              />
              <SectionRow label="Phone" value={schoolInfo.phoneNumber} />
              {schoolInfo.website && <SectionRow label="Website" value={schoolInfo.website} />}
            </div>
          </SectionCard>

          {/* Admin Info */}
          <SectionCard
            title="Admin Information"
            onEdit={onBack}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <SectionRow label="Full Name" value={adminInfo.adminName} />
              <SectionRow label="Designation" value={adminInfo.adminDesignation} />
              <SectionRow label="Email" value={adminInfo.adminEmail} />
              <SectionRow label="Phone" value={adminInfo.adminPhone} />
            </div>
          </SectionCard>

          {/* Subscription Plan */}
          <SectionCard
            title="Subscription Plan"
            onEdit={onBack}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <SectionRow label="Plan" value={`${plansData.selectedPlan} Plan`} />
              <SectionRow
                label="Billing"
                value={plansData.billingCycle === 'yearly' ? 'Yearly (Save 20%)' : 'Monthly'}
              />
              {planPrice && (
                <SectionRow
                  label="Amount"
                  value={`₹${planPrice.toLocaleString('en-IN')}/month`}
                />
              )}
            </div>
          </SectionCard>
        </div>

        {/* Terms & conditions */}
        <p className="text-[11px] text-slate-400 mt-6 text-center leading-relaxed">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:underline font-medium">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-blue-500 hover:underline font-medium">Privacy Policy</a>.
        </p>
      </div>

      {/* Button Row */}
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
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg px-6 text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-green-500/10"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Creating School…</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Confirm & Create School</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
