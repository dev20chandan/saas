'use client';

import { useState } from 'react';

export interface AdminInfoData {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDesignation: string;
  adminPass: string;
  adminConfirmPass: string;
}

interface RegisterAdminInfoProps {
  data: AdminInfoData;
  onChange: (field: keyof AdminInfoData, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function RegisterAdminInfo({
  data,
  onChange,
  onBack,
  onNext,
}: RegisterAdminInfoProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const reqMinLength = data.adminPass.length >= 8;
  const reqNumber = /\d/.test(data.adminPass);
  const reqUppercase = /[A-Z]/.test(data.adminPass);
  const reqSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.adminPass);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !data.adminName ||
      !data.adminEmail ||
      !data.adminPhone ||
      !data.adminDesignation ||
      !data.adminPass ||
      !data.adminConfirmPass
    ) {
      alert('Kripya sabhi fields bharein.');
      return;
    }
    if (data.adminPass !== data.adminConfirmPass) {
      alert('Passwords aapas me match nahi ho rahe.');
      return;
    }
    if (!reqMinLength || !reqNumber || !reqUppercase || !reqSpecialChar) {
      alert('Password requirements poori nahi hain.');
      return;
    }
    onNext();
  }

  function renderCheckItem(label: string, met: boolean) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        {met ? (
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className={met ? 'text-green-700 font-medium' : 'text-slate-400'}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Admin Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter administrator details</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Input fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.adminName}
              onChange={(e) => onChange('adminName', e.target.value)}
              placeholder="Enter full name"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={data.adminEmail}
              onChange={(e) => onChange('adminEmail', e.target.value)}
              placeholder="Enter email address"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </span>
              <input
                type="tel"
                required
                value={data.adminPhone}
                onChange={(e) => onChange('adminPhone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full h-10 pl-9 pr-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.adminDesignation}
              onChange={(e) => onChange('adminDesignation', e.target.value)}
              placeholder="e.g. Principal, Director"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* Create Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={data.adminPass}
                onChange={(e) => onChange('adminPass', e.target.value)}
                placeholder="Enter password"
                className="w-full h-10 pl-3 pr-10 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                value={data.adminConfirmPass}
                onChange={(e) => onChange('adminConfirmPass', e.target.value)}
                placeholder="Confirm password"
                className="w-full h-10 pl-3 pr-10 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showConfirmPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Strength Validator panel */}
        <div className="mt-6 border border-slate-100 rounded-xl bg-slate-50/50 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">Password must contain:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {renderCheckItem('At least 8 characters', reqMinLength)}
            {renderCheckItem('One number', reqNumber)}
            {renderCheckItem('One uppercase', reqUppercase)}
            {renderCheckItem('One special character', reqSpecialChar)}
          </div>
        </div>

      </div>

      {/* Button Rows */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-10 border border-slate-200 hover:border-slate-300 text-slate-650 hover:bg-slate-50 rounded-lg px-6 text-xs font-bold transition-all duration-200 flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="h-10 bg-blue-600 hover:bg-blue-750 text-white rounded-lg px-6 text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 shadow-md shadow-blue-500/10"
        >
          <span>Next: Subscription Plan</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
