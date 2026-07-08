'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegisterSchoolInfo, { type SchoolInfoData } from '@/components/auth/RegisterSchoolInfo';
import RegisterAdminInfo, { type AdminInfoData } from '@/components/auth/RegisterAdminInfo';
import RegisterPlans, { type PlansData } from '@/components/auth/RegisterPlans';
import RegisterReview from '@/components/auth/RegisterReview';
import RegisterSuccess from '@/components/auth/RegisterSuccess';

type RegStep = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { id: 1, label: 'School Information' },
  { id: 2, label: 'Admin Information' },
  { id: 3, label: 'Subscription Plan' },
  { id: 4, label: 'Review & Confirm' },
];

export default function RegisterPage() {
  const [step, setStep] = useState<RegStep>(1);
  const [submitting, setSubmitting] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfoData>({
    schoolName: '',
    schoolCode: '',
    schoolType: '',
    establishedYear: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    phoneNumber: '',
    website: '',
  });

  const [adminInfo, setAdminInfo] = useState<AdminInfoData>({
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminDesignation: '',
    adminPass: '',
    adminConfirmPass: '',
  });

  const [plansData, setPlansData] = useState<PlansData>({
    selectedPlan: '',
    billingCycle: 'monthly',
  });

  function handleSchoolInfoChange(field: keyof SchoolInfoData, value: string) {
    setSchoolInfo((prev) => ({ ...prev, [field]: value }));
  }

  function handleAdminInfoChange(field: keyof AdminInfoData, value: string) {
    setAdminInfo((prev) => ({ ...prev, [field]: value }));
  }

  function handlePlansChange(field: keyof PlansData, value: string) {
    setPlansData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    try {
      // Mock submit delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStep(5);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans">

      {/* TOP NAVBAR */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              ERP
            </div>
            <div className="leading-tight">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">SchoolSaaS</span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium">ERP Platform</span>
            </div>
          </div>

          {step !== 5 && (
            <Link
              href="/login"
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Need help? Contact Support</span>
            </Link>
          )}
        </div>
      </header>

      {step !== 5 ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page Title */}
          <div className="text-center mb-8">
            <button
              onClick={() => step > 1 && setStep((s) => (s - 1) as RegStep)}
              className={`text-slate-400 hover:text-blue-600 mb-4 flex items-center space-x-1 text-xs font-medium transition-colors mx-auto ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              <span>←</span>
            </button>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Register Your School
            </h1>
            <p className="text-xs text-slate-500 mt-1">Create your school account in 4 simple steps</p>
            <p className="text-xs text-slate-500 mt-2">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex items-start justify-center mb-10 overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {STEPS.map((s, idx) => {
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                          done
                            ? 'bg-green-500 text-white shadow-sm shadow-green-300'
                            : active
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-300'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {done ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s.id
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold mt-1.5 text-center max-w-[80px] leading-tight transition-colors ${
                          active ? 'text-blue-700' : done ? 'text-green-700' : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`w-16 sm:w-24 h-0.5 mx-1 mb-5 rounded-full transition-all duration-300 ${
                          done ? 'bg-green-400' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div>
            {step === 1 && (
              <RegisterSchoolInfo
                data={schoolInfo}
                onChange={handleSchoolInfoChange}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <RegisterAdminInfo
                data={adminInfo}
                onChange={handleAdminInfoChange}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <RegisterPlans
                data={plansData}
                onChange={handlePlansChange}
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <RegisterReview
                schoolInfo={schoolInfo}
                adminInfo={adminInfo}
                plansData={plansData}
                onBack={() => setStep(3)}
                onSubmit={handleFinalSubmit}
                submitting={submitting}
              />
            )}
          </div>
        </div>
      ) : (
        /* Success Screen */
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-b from-green-50 to-white px-6 pt-12 pb-8">
              <RegisterSuccess
                schoolName={schoolInfo.schoolName}
                schoolCode={schoolInfo.schoolCode}
                adminEmail={adminInfo.adminEmail}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
