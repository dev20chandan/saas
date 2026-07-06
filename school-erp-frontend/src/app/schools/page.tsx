'use client';

import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { canPerform } from '@/lib/auth';
import { api } from '@/lib/api';
import { useSchools } from '@/hooks/useSchools';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'Active' | 'Trial' | 'Expired' | 'Suspended';
type Plan   = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';

interface School {
  id:         string;
  name:       string;
  code:       string;
  type:       string;
  city:       string;
  state:      string;
  plan:       Plan;
  status:     Status;
  students:   number;
  teachers:   number;
  joined:     string;
  email:      string;
  phone:      string;
  operator:   string;
}

// No mock data needed, we use real API

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Active:    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  Trial:     'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
  Expired:   'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  Suspended: 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400',
};

const PLAN_STYLE: Record<Plan, string> = {
  Basic:      'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
  Standard:   'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  Premium:    'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  Enterprise: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
};

const PAGE_SIZE = 8;

// ── Plan definitions ───────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'Basic' as Plan,
    name: 'Basic',
    price: '₹4,999',
    period: '/month',
    description: 'Perfect for small schools just getting started',
    gradient: 'from-slate-400 to-slate-600',
    features: ['Up to 500 students', '30 teacher accounts', 'Basic reports', 'Email support', 'Mobile app access'],
    popular: false,
  },
  {
    id: 'Standard' as Plan,
    name: 'Standard',
    price: '₹9,999',
    period: '/month',
    description: 'Great for growing schools with more needs',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Up to 2,000 students', '100 teacher accounts', 'Advanced reports', 'Priority support', 'Mobile app access', 'Parent portal'],
    popular: false,
  },
  {
    id: 'Premium' as Plan,
    name: 'Premium',
    price: '₹19,999',
    period: '/month',
    description: 'For established schools that need full power',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Up to 5,000 students', '250 teacher accounts', 'Full analytics', 'Phone & email support', 'Custom branding', 'API access'],
    popular: true,
  },
  {
    id: 'Enterprise' as Plan,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large institutions and school groups',
    gradient: 'from-indigo-500 to-violet-600',
    features: ['Unlimited students', 'Unlimited teachers', 'Full analytics', '24/7 dedicated support', 'Custom branding', 'API access', 'Dedicated manager'],
    popular: false,
  },
];

const BOARD_TYPES = ['CBSE', 'ICSE', 'IB', 'State Board', 'IGCSE', 'Other'];

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `h-10 px-3 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-[#1a1d27] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 transition-all w-full ${
    hasError
      ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
      : 'border-slate-200 dark:border-[#2a2d3a] focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-600'
  }`;
}

// ── Registration Form type ─────────────────────────────────────────────────────
interface RegForm {
  name: string; code: string; type: string; email: string;
  phone: string; city: string; state: string; address: string; principal: string;
}
const BLANK: RegForm = { name: '', code: '', type: 'CBSE', email: '', phone: '', city: '', state: '', address: '', principal: '' };

// ── Registration Modal ─────────────────────────────────────────────────────────
function RegistrationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (s: School) => void }) {
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [form, setForm]               = useState<RegForm>(BLANK);
  const [errors, setErrors]           = useState<Partial<RegForm>>({});
  const [selectedPlan, setSelected]   = useState<Plan | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const overlayRef                    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  function handleOverlay(e: React.MouseEvent) { if (e.target === overlayRef.current) onClose(); }

  function set(f: keyof RegForm, v: string) {
    setForm(prev => ({ ...prev, [f]: v }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: '' }));
  }

  function validate() {
    const e: Partial<RegForm> = {};
    if (!form.name.trim())      e.name      = 'School name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())     e.phone     = 'Phone is required';
    if (!form.city.trim())      e.city      = 'City is required';
    if (!form.state.trim())     e.state     = 'State is required';
    if (!form.principal.trim()) e.principal = 'Principal name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() { if (validate()) setStep(2); }
  function choosePlan(p: Plan) { setSelected(p); setStep(3); }
  function skipPlan()          { setSelected(null); setStep(3); }

  async function submit() {
    setSubmitting(true);
    try {
      const response = await api.post('/schools', {
        ...form,
        plan: selectedPlan ?? 'Basic',
      });
      const school: School = {
        id: response._id,
        name: response.name,
        code: response.code,
        type: response.type || 'CBSE',
        city: response.city,
        state: response.state,
        plan: response.plan ?? 'Basic',
        status: response.status ?? 'Trial',
        students: response.students || 0,
        teachers: response.teachers || 0,
        joined: new Date(response.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        email: response.email,
        phone: response.phone,
        operator: response.operator || form.principal,
      };
      setSubmitting(false);
      onSuccess(school);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred while registering school');
      setSubmitting(false);
    }
  }

  const STEPS = ['School Details', 'Choose Plan', 'Confirm'];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#13151f] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#2a2d3a] flex-shrink-0">
          {/* Step pills */}
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done   = step > n;
              const active = step === n;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all
                      ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-[#2a2d3a] text-slate-400'}`}>
                      {done ? <Icon d={ICONS.check} className="w-3 h-3" /> : n}
                    </div>
                    <span className={`text-[11px] font-bold hidden sm:block ${active ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-8 sm:w-12 rounded-full ${done ? 'bg-green-400' : 'bg-slate-200 dark:bg-[#2a2d3a]'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {step === 1 ? '🏫 Register Your School' : step === 2 ? '📋 Choose Your Plan' : '✅ Confirm Registration'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {step === 1 ? 'Fill in your school information to get started'
               : step === 2 ? 'Select the best plan — you can always upgrade later'
               : 'Review your details before submitting'}
            </p>
          </div>
          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#2a2d3a] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center transition-colors">
            <Icon d="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="School Name *" error={errors.name}>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Greenfield International School" className={inputCls(!!errors.name)} />
                </Field>
                <Field label="School Code">
                  <input value={form.code} onChange={e => set('code', e.target.value)}
                    placeholder="Auto-generated if empty" className={inputCls(false)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Principal / Head *" error={errors.principal}>
                  <input value={form.principal} onChange={e => set('principal', e.target.value)}
                    placeholder="Full name" className={inputCls(!!errors.principal)} />
                </Field>
                <Field label="Board / Curriculum">
                  <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls(false)}>
                    {BOARD_TYPES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address *" error={errors.email}>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="admin@yourschool.edu.in" className={inputCls(!!errors.email)} />
                </Field>
                <Field label="Phone Number *" error={errors.phone}>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+91 98765 43210" className={inputCls(!!errors.phone)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City *" error={errors.city}>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="e.g. New Delhi" className={inputCls(!!errors.city)} />
                </Field>
                <Field label="State *" error={errors.state}>
                  <input value={form.state} onChange={e => set('state', e.target.value)}
                    placeholder="e.g. Delhi" className={inputCls(!!errors.state)} />
                </Field>
              </div>
              <Field label="Full Address">
                <input value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Street, Area, PIN code" className={inputCls(false)} />
              </Field>
            </div>
          )}

          {/* ── Step 2: Choose Plan ── */}
          {step === 2 && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {PLANS.map(plan => (
                  <button key={plan.id} onClick={() => choosePlan(plan.id)}
                    className={`relative text-left rounded-2xl border-2 p-5 transition-all group hover:shadow-lg focus:outline-none
                      ${plan.popular
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/20 hover:shadow-purple-500/20'
                        : 'border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-500/10'}`}>
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                        ⭐ Most Popular
                      </span>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                          <Icon d={ICONS.shield} className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">{plan.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{plan.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                        {plan.period && <span className="text-[10px] text-slate-400 block">{plan.period}</span>}
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {plan.features.slice(0, 5).map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                            <Icon d={ICONS.check} className="w-2 h-2 text-green-600 dark:text-green-400" />
                          </span>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`flex items-center justify-center gap-1 text-[11px] font-bold py-2 rounded-xl transition-colors
                      ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                        : 'bg-slate-100 dark:bg-[#2a2d3a] text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      Select {plan.name}
                      <Icon d={ICONS.chevronRight} className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Skip divider ── */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-slate-200 dark:bg-[#2a2d3a]" />
                <span className="text-[11px] text-slate-400 font-medium">or</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-[#2a2d3a]" />
              </div>

              {/* ── Skip button ── */}
              <button onClick={skipPlan}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#2a2d3a] text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                <Icon d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                Skip for now — I&apos;ll choose a plan later
              </button>
              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                School will default to the <strong>Basic</strong> plan. You can upgrade anytime from the school profile.
              </p>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div className="p-6 space-y-4">
              {/* Banner */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0 text-2xl">
                  🏫
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{form.name || 'Your School'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{form.email} · {form.city}, {form.state}</p>
                </div>
              </div>

              {/* Summary grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Board',     value: form.type },
                  { label: 'Phone',     value: form.phone || '—' },
                  { label: 'Principal', value: form.principal || '—' },
                  { label: 'Status',    value: 'Trial (14 days free)' },
                  { label: 'Plan',      value: selectedPlan ?? 'Basic (default)', highlight: !!selectedPlan },
                  { label: 'Location',  value: `${form.city}, ${form.state}` },
                ].map(d => (
                  <div key={d.label} className="bg-slate-50 dark:bg-[#1a1d27] rounded-xl p-3 border border-slate-100 dark:border-[#2a2d3a]">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{d.label}</p>
                    <p className={`text-xs font-bold mt-0.5 ${d.highlight ? 'text-purple-600 dark:text-purple-400' : 'text-slate-800 dark:text-slate-200'}`}>{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl px-4 py-3">
                <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">⚡</span>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  A <strong>14-day free trial</strong> starts on registration. A welcome email will be sent to <strong>{form.email || 'the admin'}</strong>.
                  {!selectedPlan && ' You can assign a plan from the school profile anytime.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between gap-3">
          <div>
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)} disabled={submitting}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 transition-colors">
                <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5 rotate-90" />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={submitting}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-colors">
              Cancel
            </button>
            {step === 1 && (
              <button onClick={goNext}
                className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors">
                Next: Choose Plan
                <Icon d={ICONS.chevronRight} className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 3 && (
              <button onClick={submit} disabled={submitting}
                className="h-9 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60">
                {submitting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registering…
                  </>
                ) : (
                  <>
                    <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                    Register School
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success Toast ──────────────────────────────────────────────────────────────
function SuccessToast({ name, onClose }: { name: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-[#1a1d27] border border-green-200 dark:border-green-800/50 rounded-2xl px-5 py-4 shadow-2xl shadow-green-500/10">
      <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
        <Icon d={ICONS.check} className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">School Registered! 🎉</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{name} has been added successfully.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        <Icon d="M6 18L18 6M6 6l12 12" className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SchoolsPage() {
  const { permissions } = useAuth();
  const canDeleteSchools = canPerform(permissions, 'schools', 'delete');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<Status | 'All'>('All');
  const [planFilter, setPlan]       = useState<Plan | 'All'>('All');
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [sortCol, setSortCol]       = useState<keyof School>('name');
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const { schools: rawSchools, isLoading, mutate } = useSchools();

  const mappedSchools: School[] = useMemo(() => {
    return (rawSchools || []).map((s: any) => ({
      id: s._id || s.id,
      name: s.name,
      code: s.code,
      type: s.type || 'CBSE',
      city: s.city || 'Unknown',
      state: s.state || 'Unknown',
      plan: s.plan || 'Basic',
      status: s.status || 'Trial',
      students: s.students || 0,
      teachers: s.teachers || 0,
      joined: new Date(s.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      email: s.email || '',
      phone: s.phone || '',
      operator: s.operator || s.principal || '—',
    }));
  }, [rawSchools]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this school?')) return;
    try {
      await api.delete(`/schools/${id}`);
      mutate();
      setToast('School deleted successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to delete school');
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     mappedSchools.length,
    active:    mappedSchools.filter(s => s.status === 'Active').length,
    trial:     mappedSchools.filter(s => s.status === 'Trial').length,
    expired:   mappedSchools.filter(s => s.status === 'Expired').length,
    suspended: mappedSchools.filter(s => s.status === 'Suspended').length,
  }), [mappedSchools]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...mappedSchools];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(s =>
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') rows = rows.filter(s => s.status === statusFilter);
    if (planFilter   !== 'All') rows = rows.filter(s => s.plan   === planFilter);
    rows.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, planFilter, sortCol, sortDir, mappedSchools]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(col: keyof School) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  }

  function toggleAll() {
    const ids = paginated.map(s => s.id);
    const all = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (all) {
        ids.forEach(id => n.delete(id));
      } else {
        ids.forEach(id => n.add(id));
      }
      return n;
    });
  }

  function toggleRow(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  }

  function handleRegistered(school: School) {
    mutate();
    setShowModal(false);
    setToast(school.name);
  }

  function SortIcon({ col }: { col: keyof School }) {
    if (sortCol !== col) return <Icon d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" className="w-3 h-3 text-slate-300 dark:text-slate-600" />;
    return <Icon d={sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown} className="w-3 h-3 text-blue-500" />;
  }

  return (
    <DashboardLayout title="Schools" subtitle="Manage all registered schools on the platform">
      <div className="p-4 sm:p-6 space-y-5">

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Schools', value: stats.total,     color: 'text-slate-900 dark:text-white',           dot: 'bg-slate-400' },
            { label: 'Active',        value: stats.active,    color: 'text-green-700 dark:text-green-400',        dot: 'bg-green-500' },
            { label: 'Trial',         value: stats.trial,     color: 'text-orange-600 dark:text-orange-400',      dot: 'bg-orange-400' },
            { label: 'Expired',       value: stats.expired,   color: 'text-red-600 dark:text-red-400',            dot: 'bg-red-500' },
            { label: 'Suspended',     value: stats.suspended, color: 'text-slate-500 dark:text-slate-400',        dot: 'bg-slate-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              <div>
                <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[#2a2d3a]">
            <div className="flex items-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#2a2d3a] rounded-xl px-3 h-9 gap-2 flex-1 max-w-xs">
              <Icon d={ICONS.search} className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Search schools…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 flex-1 min-w-0" />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Icon d="M6 18L18 6M6 6l12 12" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={statusFilter} onChange={e => { setStatus(e.target.value as Status | 'All'); setPage(1); }}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['All', 'Active', 'Trial', 'Expired', 'Suspended'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={planFilter} onChange={e => { setPlan(e.target.value as Plan | 'All'); setPage(1); }}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['All', 'Basic', 'Standard', 'Premium', 'Enterprise'].map(p => <option key={p}>{p}</option>)}
              </select>
              {selected.size > 0 && (
                <button className="h-9 px-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                  Delete ({selected.size})
                </button>
              )}
              <button onClick={() => setShowModal(true)}
                className="ml-auto h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors flex-shrink-0">
                <Icon d="M12 4v16m8-8H4" className="w-4 h-4" />
                Add School
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="px-5 py-2 border-b border-slate-50 dark:border-[#2a2d3a] flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Showing <span className="font-bold text-slate-700 dark:text-slate-300">{paginated.length}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span> schools
            </p>
            {selected.size > 0 && <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{selected.size} selected</p>}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[#2a2d3a]">
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox"
                      checked={paginated.length > 0 && paginated.every(s => selected.has(s.id))}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer" />
                  </th>
                  {([
                    ['name', 'School Name'], ['code', 'Code'], ['type', 'Board'],
                    ['city', 'City'], ['plan', 'Plan'], ['status', 'Status'],
                    ['students', 'Students'], ['teachers', 'Teachers'], ['joined', 'Joined'],
                  ] as [keyof School, string][]).map(([col, label]) => (
                    <th key={col} onClick={() => toggleSort(col)}
                      className="px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 select-none whitespace-nowrap">
                      <div className="flex items-center gap-1.5">{label}<SortIcon col={col} /></div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-[#2a2d3a]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <Icon d={ICONS.schools} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">No schools found</p>
                      <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : paginated.map(school => (
                  <Fragment key={school.id}>
                    <tr key={school.id}
                      className={`group hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${selected.has(school.id) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => setExpandedId(expandedId === school.id ? null : school.id)}>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(school.id)} onChange={() => toggleRow(school.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer" />
                      </td>
                      <td className="px-3 py-3.5 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-[10px] flex-shrink-0 shadow-sm">
                            {school.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{school.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{school.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-lg">{school.code}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{school.type}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{school.city}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{school.state}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${PLAN_STYLE[school.plan]}`}>{school.plan}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${school.status === 'Active' ? 'bg-green-500' : school.status === 'Trial' ? 'bg-orange-400' : school.status === 'Expired' ? 'bg-red-500' : 'bg-slate-400'}`} />
                          <span className={`text-[10px] font-extrabold ${STATUS_STYLE[school.status].split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>{school.status}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{school.students.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{school.teachers}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{school.joined}</span>
                      </td>
                      <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="View" className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center transition-colors">
                            <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-3.5 h-3.5" />
                          </button>
                          <button title="Edit" className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          {canDeleteSchools && (
                            <button
                              title="Delete"
                              onClick={() => handleDelete(school.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                            >
                              <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === school.id && (
                      <tr key={`${school.id}-detail`} className="bg-blue-50/30 dark:bg-blue-950/10">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { label: 'School ID', value: school.id },
                              { label: 'Operated By', value: school.operator },
                              { label: 'Phone', value: school.phone },
                              { label: 'Email', value: school.email },
                              { label: 'Full Address', value: `${school.city}, ${school.state}` },
                            ].map(d => (
                              <div key={d.label}>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{d.label}</p>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{d.value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 rounded-2xl border border-slate-200 dark:border-[#2a2d3a] bg-white/70 dark:bg-[#13151f]/60 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Linked users</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{school.name}</p>
                              </div>
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                {school.operator}
                              </span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3">
                              {([{ name: school.operator, role: 'School Admin', status: 'Active' }]).map((member) => (
                                <div key={`${school.id}-${member.name}`} className="rounded-xl border border-slate-100 dark:border-[#2a2d3a] bg-slate-50/80 dark:bg-white/[0.03] px-3 py-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                      member.status === 'Active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                        : member.status === 'Trial'
                                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                                    }`}>
                                      {member.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{member.role}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">View Full Profile</button>
                            <button className="h-8 px-4 border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-bold transition-colors">Send Email</button>
                            <button className={`h-8 px-4 rounded-lg text-xs font-bold transition-colors ${school.status === 'Active'
                              ? 'border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50'
                              : 'border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50'}`}>
                              {school.status === 'Active' ? 'Suspend School' : 'Activate School'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[11px] text-slate-500 font-medium">
              Page <span className="font-bold text-slate-700 dark:text-slate-300">{page}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{Math.max(1, totalPages)}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5 rotate-90" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                <Icon d={ICONS.chevronDown} className="w-3.5 h-3.5 -rotate-90" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <RegistrationModal
          onClose={() => setShowModal(false)}
          onSuccess={handleRegistered}
        />
      )}

      {/* Success Toast */}
      {toast && <SuccessToast name={toast} onClose={() => setToast(null)} />}
    </DashboardLayout>
  );
}
