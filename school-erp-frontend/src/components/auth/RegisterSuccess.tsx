'use client';

import Link from 'next/link';

interface RegisterSuccessProps {
  schoolName: string;
  schoolCode: string;
  adminEmail: string;
}

export default function RegisterSuccess({ schoolName, schoolCode, adminEmail }: RegisterSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-6 text-slate-800">

      {/* Success Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg shadow-green-200">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Decorative dots */}
        <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-yellow-300 opacity-80" />
        <span className="absolute -bottom-2 -left-4 w-3 h-3 rounded-full bg-blue-400 opacity-70" />
        <span className="absolute top-1 -left-6 w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
        <span className="absolute bottom-0 -right-6 w-2 h-2 rounded-full bg-red-400 opacity-70" />
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Congratulations!</h2>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Your school account has been created successfully.<br />
          You can now sign in and start managing your school.
        </p>
      </div>

      {/* Summary Card */}
      <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <span className="text-[11px] text-slate-500 font-medium sm:w-28 flex-shrink-0">School Name</span>
          <span className="text-xs font-extrabold text-slate-900">{schoolName || 'Delhi Public School'}</span>
        </div>
        <div className="border-t border-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">School Code</p>
            <p className="text-xs font-extrabold text-slate-900">{schoolCode || 'DPS001'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">Admin Email</p>
            <p className="text-xs font-extrabold text-slate-900 break-all">{adminEmail || 'admin@school.in'}</p>
          </div>
        </div>
      </div>

      {/* Confirmation message */}
      <p className="text-[11px] text-slate-400">
        A confirmation email has been sent to your email address.<br />
        Please check your inbox.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row w-full max-w-sm gap-3">
        <Link
          href="/dashboard"
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center transition-colors shadow-md shadow-blue-500/10"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/login"
          className="flex-1 h-11 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-xl text-xs font-extrabold flex items-center justify-center transition-colors hover:bg-blue-50/30"
        >
          Login Now
        </Link>
      </div>
    </div>
  );
}
