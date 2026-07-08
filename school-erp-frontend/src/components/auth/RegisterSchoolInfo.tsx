'use client';

import { useEffect, useState } from 'react';

export interface SchoolInfoData {
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  establishedYear: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  phoneNumber: string;
  website: string;
}

interface RegisterSchoolInfoProps {
  data: SchoolInfoData;
  onChange: (field: keyof SchoolInfoData, value: string) => void;
  onNext: () => void;
}

function generateRandomSchoolCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SCH-${suffix}`;
}

export default function RegisterSchoolInfo({
  data,
  onChange,
  onNext,
}: RegisterSchoolInfoProps) {
  const [logoName, setLogoName] = useState<string>('');

  useEffect(() => {
    if (!data.schoolCode) {
      onChange('schoolCode', generateRandomSchoolCode());
    }
  }, [data.schoolCode, onChange]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !data.schoolName ||
      !data.schoolCode ||
      !data.schoolType ||
      !data.establishedYear ||
      !data.address ||
      !data.country ||
      !data.state ||
      !data.city ||
      !data.pincode ||
      !data.phoneNumber
    ) {
      alert('Kripya sabhi mandatory fields bharein.');
      return;
    }
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">School Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter your school details</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* School Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.schoolName}
              onChange={(e) => onChange('schoolName', e.target.value)}
              placeholder="Enter school name"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* School Code */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              School Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.schoolCode}
              onChange={(e) => onChange('schoolCode', e.target.value)}
              placeholder="e.g. DPS001"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">Auto-generated on first entry. You can edit it anytime.</p>
          </div>

          {/* School Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              School Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={data.schoolType}
              onChange={(e) => onChange('schoolType', e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            >
              <option value="">Select school type</option>
              <option value="Primary">Primary (K-5)</option>
              <option value="Secondary">Secondary (6-10)</option>
              <option value="Higher Secondary">Higher Secondary (11-12)</option>
              <option value="K-12">K-12 (All Grades)</option>
            </select>
          </div>

          {/* Established Year */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Established Year <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1800"
                max="2026"
                required
                value={data.establishedYear}
                onChange={(e) => onChange('establishedYear', e.target.value)}
                placeholder="e.g. 2020"
                className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
              <span className="absolute right-3 text-slate-450 pointer-events-none">
                <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Enter complete address"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={data.country}
              onChange={(e) => onChange('country', e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            >
              <option value="">Select country</option>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              State <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={data.state}
              onChange={(e) => onChange('state', e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            >
              <option value="">Select state</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="California">California</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="Enter city"
              className="w-full h-10 px-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
            />
          </div>

          {/* Pincode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={data.pincode}
              onChange={(e) => onChange('pincode', e.target.value)}
              placeholder="Enter pincode"
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
                value={data.phoneNumber}
                onChange={(e) => onChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className="w-full h-10 pl-9 pr-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
            </div>
          </div>

          {/* Website (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Website (Optional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </span>
              <input
                type="url"
                value={data.website}
                onChange={(e) => onChange('website', e.target.value)}
                placeholder="www.yourschool.com"
                className="w-full h-10 pl-9 pr-3 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm bg-white hover:bg-slate-50/50 text-slate-900 placeholder-slate-400 transition-colors focus:outline-none"
              />
            </div>
          </div>

          {/* School Logo */}
          <div className="col-span-1 md:col-span-2 space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              School Logo (Optional)
            </label>
            <div className="border border-dashed border-slate-250 hover:border-blue-400 hover:bg-blue-50/10 rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogoName(e.target.files[0].name);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-bold text-blue-600">Upload Logo</span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {logoName ? `Selected: ${logoName}` : 'PNG, JPG up to 2MB'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Button Row */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="h-10 bg-blue-600 hover:bg-blue-750 text-white rounded-lg px-6 text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 shadow-md shadow-blue-500/10"
        >
          <span>Next: Admin Information</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
