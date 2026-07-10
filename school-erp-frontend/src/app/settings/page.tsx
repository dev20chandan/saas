'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

// ── Settings Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', label: 'General', icon: ICONS.settings },
  { id: 'profile', label: 'Profile', icon: ICONS.user },
  { id: 'security', label: 'Security', icon: ICONS.shield },
  { id: 'notifications', label: 'Notifications', icon: ICONS.bell },
  { id: 'billing', label: 'Billing', icon: ICONS.credit },
  { id: 'integrations', label: 'Integrations', icon: ICONS.globe },
];

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none cursor-pointer
        ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out
        ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SettingCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a]">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, id, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
      <input
        id={id}
        {...rest}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] dark:[&:-webkit-autofill]:[transition:background-color_9999999s_ease-in-out_0s]"
      />
    </div>
  );
}

// ── Select field ──────────────────────────────────────────────────────────────
function SelectField({ label, id, options, value, onChange }: { label: string; id: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ id, label, description, checked, onChange }: { id: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-bold transition-all
          ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15'}`}
      >
        {saved ? (
          <><Icon d={ICONS.check} className="w-4 h-4" /> Saved!</>
        ) : (
          <><Icon d={ICONS.save} className="w-4 h-4" /> Save Changes</>
        )}
      </button>
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
// ── GENERAL TAB ───────────────────────────────────────────────────────────────
function GeneralTab() {
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [lang, setLang] = useState('English');
  const [currency, setCurrency] = useState('INR (₹)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [maintenance, setMaintenance] = useState(false);
  const [debug, setDebug] = useState(false);

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="space-y-5">
      <SettingCard title="Platform Settings" description="Global configuration for the SchoolSaaS platform">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="platform-name" label="Platform Name" defaultValue="SchoolSaaS" />
          <Field id="platform-url" label="Platform URL" defaultValue="https://schoolsaas.in" />
          <Field id="support-email" label="Support Email" defaultValue="support@schoolsaas.in" type="email" />
          <Field id="support-phone" label="Support Phone" defaultValue="+91 98765 43210" type="tel" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField id="timezone" label="Timezone" value={timezone} onChange={setTimezone}
            options={['Asia/Kolkata (IST)', 'UTC', 'America/New_York', 'Europe/London', 'Asia/Singapore']} />
          <SelectField id="language" label="Language" value={lang} onChange={setLang}
            options={['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi']} />
          <SelectField id="currency" label="Currency" value={currency} onChange={setCurrency}
            options={['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)']} />
          <SelectField id="date-format" label="Date Format" value={dateFormat} onChange={setDateFormat}
            options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
        </div>
        <SaveBtn onClick={save} saved={saved} />
      </SettingCard>

      <SettingCard title="Maintenance Mode" description="Temporarily disable access to the platform">
        <ToggleRow id="maintenance" label="Enable Maintenance Mode" description="When enabled, users will see a maintenance page" checked={maintenance} onChange={setMaintenance} />
        <ToggleRow id="debug" label="Debug Mode" description="Show detailed error messages to administrators" checked={debug} onChange={setDebug} />
      </SettingCard>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const [saved, setSaved] = useState(false);
  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return (
    <div className="space-y-5">
      <SettingCard title="Admin Profile" description="Update your personal information">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0 shadow-lg shadow-blue-200">
            SA
          </div>
          <div>
            <button className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 rounded-xl px-4 h-9 transition-colors">
              <Icon d={ICONS.upload} className="w-4 h-4" /> Upload Photo
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5">JPG, PNG or GIF · max 2 MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="first-name" label="First Name" defaultValue="Super" />
          <Field id="last-name" label="Last Name" defaultValue="Admin" />
          <Field id="email" label="Email Address" defaultValue="platform@schools.in" type="email" />
          <Field id="phone" label="Phone Number" defaultValue="+91 98765 43210" type="tel" />
          <Field id="designation" label="Designation" defaultValue="Platform Administrator" />
          <SelectField id="role" label="Role" value="owner" onChange={() => { }}
            options={['owner', 'Admin', 'Manager']} />
        </div>
        <SaveBtn onClick={save} saved={saved} />
      </SettingCard>
    </div>
  );
}

// ── SECURITY TAB ──────────────────────────────────────────────────────────────
function SecurityTab() {
  const { type: userType } = useAuth();
  const [passSaved, setPassSaved] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [userId, setUserId] = useState('');

  // Password fields
  const [currentVal, setCurrentVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [confirmVal, setConfirmVal] = useState('');

  useEffect(() => {
    async function loadSecurity() {
      try {
        const me = await api.get('/auth/me');
        if (me && me.id) {
          setUserId(me.id);
          const endpoint = userType === 'admin' ? 'admins' : 'users';
          const user = await api.get(`/${endpoint}/${me.id}`);
          if (user && user.settings) {
            setTwoFA(user.settings.twoFA !== false);
            setSessionTimeout(user.settings.sessionTimeout !== false);
            setLoginAlerts(user.settings.loginAlerts !== false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSecurity();
  }, [userType]);

  async function updatePreference(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    if (!userId) return;
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const currentSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...currentSettings,
          [key]: val
        }
      });
    } catch (err) {
      console.error(`Failed to save security option ${key}:`, err);
    }
  }

  async function handlePasswordSave() {
    if (!userId) return;
    if (!newVal || newVal !== confirmVal) {
      alert('Passwords do not match or are empty');
      return;
    }
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      await api.put(`/${endpoint}/${userId}`, {
        password: newVal
      });
      setPassSaved(true);
      setTimeout(() => setPassSaved(false), 2000);
      setCurrentVal('');
      setNewVal('');
      setConfirmVal('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update password');
    }
  }

  return (
    <div className="space-y-5">
      <SettingCard title="Change Password" description="Update your admin account password">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Field id="current-pass" label="Current Password" type="password" placeholder="••••••••" value={currentVal} onChange={e => setCurrentVal(e.target.value)} />
          <div /> {/* spacer */}
          <Field id="new-pass" label="New Password" type="password" placeholder="••••••••" value={newVal} onChange={e => setNewVal(e.target.value)} />
          <Field id="confirm-pass" label="Confirm New Password" type="password" placeholder="••••••••" value={confirmVal} onChange={e => setConfirmVal(e.target.value)} />
        </div>

        {/* Password strength */}
        <div className="max-w-xs space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">Password Strength</p>
          <div className="flex gap-1">
            {['bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-yellow-400', 'bg-slate-200'].map((c, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full ${c}`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400">Strong — includes uppercase, numbers & symbols</p>
        </div>
        <SaveBtn onClick={handlePasswordSave} saved={passSaved} />
      </SettingCard>

      <SettingCard title="Security Preferences">
        <ToggleRow id="2fa" label="Two-Factor Authentication" description="Require OTP on every login for enhanced security" checked={twoFA} onChange={v => updatePreference('twoFA', v, setTwoFA)} />
        <div className="border-t border-slate-100" />
        <ToggleRow id="session" label="Auto Session Timeout" description="Automatically log out after 30 minutes of inactivity" checked={sessionTimeout} onChange={v => updatePreference('sessionTimeout', v, setSessionTimeout)} />
        <div className="border-t border-slate-100" />
        <ToggleRow id="alerts" label="Login Alerts" description="Send email alert whenever a new device logs in" checked={loginAlerts} onChange={v => updatePreference('loginAlerts', v, setLoginAlerts)} />
      </SettingCard>

      <SettingCard title="Active Sessions" description="Devices currently logged into your account">
        {[
          { device: 'MacBook Pro', location: 'Mumbai, India', time: 'Now (current)', current: true },
          { device: 'iPhone 15 Pro', location: 'Delhi, India', time: '2 hours ago', current: false },
          { device: 'Chrome – Windows', location: 'Bangalore, India', time: 'Yesterday', current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-[#2a2d3a] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#2a2d3a] flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                <Icon d={ICONS.shield} className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.device}</p>
                <p className="text-[10px] text-slate-400">{s.location} · {s.time}</p>
              </div>
            </div>
            {s.current ? (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">Current</span>
            ) : (
              <button className="text-[10px] font-bold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg px-3 py-1 transition-colors">
                Revoke
              </button>
            )}
          </div>
        ))}
      </SettingCard>
    </div>
  );
}

// ── NOTIFICATIONS TAB ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const { type: userType } = useAuth();
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [push, setPush] = useState(true);
  const [newSchool, setNewSchool] = useState(true);
  const [payment, setPayment] = useState(true);
  const [support, setSupport] = useState(true);
  const [expiry, setExpiry] = useState(true);
  const [report, setReport] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const me = await api.get('/auth/me');
        if (me && me.id) {
          setUserId(me.id);
          const endpoint = userType === 'admin' ? 'admins' : 'users';
          const user = await api.get(`/${endpoint}/${me.id}`);
          if (user && user.settings) {
            setEmail(user.settings.notif_email !== false);
            setSms(user.settings.notif_sms === true);
            setPush(user.settings.notif_push !== false);
            setNewSchool(user.settings.notif_newSchool !== false);
            setPayment(user.settings.notif_payment !== false);
            setSupport(user.settings.notif_support !== false);
            setExpiry(user.settings.notif_expiry !== false);
            setReport(user.settings.notif_report === true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadNotifications();
  }, [userType]);

  async function updateNotifOption(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    if (!userId) return;
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const currentSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...currentSettings,
          [key]: val
        }
      });
    } catch (err) {
      console.error(`Failed to save notification option ${key}:`, err);
    }
  }

  return (
    <div className="space-y-5">
      <SettingCard title="Notification Channels" description="Choose how you want to receive notifications">
        <ToggleRow id="email-notif" label="Email Notifications" description="Receive updates via your registered email" checked={email} onChange={v => updateNotifOption('notif_email', v, setEmail)} />
        <div className="border-t border-slate-100 dark:border-[#2a2d3a]" />
        <ToggleRow id="sms-notif" label="SMS Notifications" description="Receive critical alerts via SMS" checked={sms} onChange={v => updateNotifOption('notif_sms', v, setSms)} />
        <div className="border-t border-slate-100 dark:border-[#2a2d3a]" />
        <ToggleRow id="push-notif" label="Push Notifications" description="Browser push notifications for real-time updates" checked={push} onChange={v => updateNotifOption('notif_push', v, setPush)} />
      </SettingCard>

      <SettingCard title="Notification Events" description="Choose which events trigger notifications">
        {[
          { id: 'new-school', label: 'New School Registration', description: 'When a new school signs up on the platform', v: newSchool, s: (v: boolean) => updateNotifOption('notif_newSchool', v, setNewSchool) },
          { id: 'payment-recv', label: 'Payment Received', description: 'When a school makes a subscription payment', v: payment, s: (v: boolean) => updateNotifOption('notif_payment', v, setPayment) },
          { id: 'support-ticket', label: 'Support Ticket', description: 'When a new support ticket is created or updated', v: support, s: (v: boolean) => updateNotifOption('notif_support', v, setSupport) },
          { id: 'subscription-expiry', label: 'Subscription Expiry', description: 'When a school subscription is about to expire', v: expiry, s: (v: boolean) => updateNotifOption('notif_expiry', v, setExpiry) },
          { id: 'weekly-report', label: 'Weekly Report', description: 'Receive weekly platform analytics summary', v: report, s: (v: boolean) => updateNotifOption('notif_report', v, setReport) },
        ].map((n, i, arr) => (
          <div key={n.id}>
            <ToggleRow id={n.id} label={n.label} description={n.description} checked={n.v} onChange={n.s} />
            {i < arr.length - 1 && <div className="border-t border-slate-100 dark:border-[#2a2d3a] mt-4" />}
          </div>
        ))}
      </SettingCard>
    </div>
  );
}

// ── BILLING TAB ───────────────────────────────────────────────────────────────
function BillingTab() {
  return (
    <div className="space-y-5">
      <SettingCard title="Current Plan" description="Your platform's billing plan">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Enterprise Plan</span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Active</span>
            </div>
            <p className="text-xs text-slate-500">Unlimited schools · Priority Support · Custom domain</p>
            <p className="text-xs text-slate-400 mt-1">Renews on <strong className="text-slate-700 dark:text-slate-200">June 30, 2026</strong></p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹99,999<span className="text-sm text-slate-400 font-medium">/yr</span></p>
            <button className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline border border-blue-200 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg px-3 py-1.5 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {[
            { label: 'Schools Limit', value: 'Unlimited' },
            { label: 'Storage', value: '10 TB' },
            { label: 'Support', value: '24/7 Priority' },
          ].map(m => (
            <div key={m.label} className="text-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{m.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="Payment Method" description="Manage your payment methods">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-[#2a2d3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-blue-700 rounded-md flex items-center justify-center">
              <span className="text-white font-extrabold text-[10px] tracking-wider">VISA</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">•••• •••• •••• 4242</p>
              <p className="text-[10px] text-slate-400">Expires 12/27</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">Default</span>
            <button className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-[#2a2d3a] rounded-lg px-2 py-1 transition-colors">Edit</button>
          </div>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-2">
          <Icon d={ICONS.credit} className="w-4 h-4" /> Add Payment Method
        </button>
      </SettingCard>

      <SettingCard title="Invoice History">
        <div className="space-y-2">
          {[
            { id: 'INV-2025-06', date: 'Jun 1, 2025', amount: '₹99,999', status: 'Paid' },
            { id: 'INV-2024-06', date: 'Jun 1, 2024', amount: '₹79,999', status: 'Paid' },
            { id: 'INV-2023-06', date: 'Jun 1, 2023', amount: '₹59,999', status: 'Paid' },
          ].map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-[#2a2d3a] last:border-0">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{inv.id}</p>
                <p className="text-[10px] text-slate-400">{inv.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inv.amount}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">{inv.status}</span>
                <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">Download</button>
              </div>
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  );
}

// ── INTEGRATIONS TAB ──────────────────────────────────────────────────────────
function IntegrationsTab() {
  const { type: userType } = useAuth();
  const [razorpay, setRazorpay] = useState(true);
  const [smtp, setSmtp] = useState(true);
  const [google, setGoogle] = useState(false);
  const [slack, setSlack] = useState(false);
  const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: string }[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const me = await api.get('/auth/me');
        if (me && me.id) {
          setUserId(me.id);
          const endpoint = userType === 'admin' ? 'admins' : 'users';
          const user = await api.get(`/${endpoint}/${me.id}`);
          if (user && user.settings) {
            setRazorpay(user.settings.integration_razorpay !== false);
            setSmtp(user.settings.integration_smtp !== false);
            setGoogle(user.settings.integration_google === true);
            setSlack(user.settings.integration_slack === true);
            setKeys(user.settings.apiKeys || [
              { id: '1', name: 'Production Key', key: process.env.NEXT_PUBLIC_PROD_API_KEY, created: 'Jan 15, 2025' },
              { id: '2', name: 'Test Key', key: process.env.NEXT_PUBLIC_TEST_API_KEY, created: 'Mar 02, 2025' },
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadIntegrations();
  }, [userType]);

  async function updateVal(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    if (!userId) return;
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const currentSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...currentSettings,
          [key]: val
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function generateNewKey() {
    if (!userId) return;
    const name = prompt('Enter a name for the new API Key:', 'New API Key');
    if (!name) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rand = '';
    for (let i = 0; i < 24; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    const newKeyStr = 'sk_live_' + rand;
    const newKeyObj = {
      id: Date.now().toString(),
      name,
      key: newKeyStr,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    const newKeys = [...keys, newKeyObj];
    setKeys(newKeys);

    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const currentSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...currentSettings,
          apiKeys: newKeys
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function revokeKey(id: string) {
    if (!userId) return;
    if (!confirm('Are you sure you want to revoke this API Key?')) return;
    const newKeys = keys.filter(k => k.id !== id);
    setKeys(newKeys);

    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const currentSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...currentSettings,
          apiKeys: newKeys
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    alert('Copied to clipboard!');
  }

  const integrations = [
    { id: 'razorpay', name: 'Razorpay', description: 'Payment gateway for school fee collection', connected: razorpay, toggle: (v: boolean) => updateVal('integration_razorpay', v, setRazorpay), color: 'bg-blue-600', letter: 'R' },
    { id: 'smtp', name: 'SMTP / Email', description: 'Custom SMTP server for transactional emails', connected: smtp, toggle: (v: boolean) => updateVal('integration_smtp', v, setSmtp), color: 'bg-green-600', letter: 'S' },
    { id: 'google', name: 'Google Workspace', description: 'SSO and Google Drive integration', connected: google, toggle: (v: boolean) => updateVal('integration_google', v, setGoogle), color: 'bg-red-500', letter: 'G' },
    { id: 'slack', name: 'Slack', description: 'Team notifications and alerts to Slack channels', connected: slack, toggle: (v: boolean) => updateVal('integration_slack', v, setSlack), color: 'bg-purple-600', letter: 'S' },
  ];

  return (
    <div className="space-y-5">
      <SettingCard title="Connected Integrations" description="Manage third-party integrations and API connections">
        <div className="space-y-4">
          {integrations.map((item, i) => (
            <div key={item.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0`}>
                    {item.letter}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.connected ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-[#2a2d3a] dark:text-slate-400'}`}>
                    {item.connected ? 'Connected' : 'Disconnected'}
                  </span>
                  <Toggle id={item.id} checked={item.connected} onChange={item.toggle} />
                </div>
              </div>
              {i < integrations.length - 1 && <div className="border-t border-slate-100 dark:border-[#2a2d3a] mt-4" />}
            </div>
          ))}
        </div>
      </SettingCard>

      <SettingCard title="API Keys" description="Manage your API keys for external access">
        <div className="space-y-3">
          {keys.map(k => {
            const maskedKey = k.key.substring(0, 8) + '••••••••••••••••••••' + k.key.substring(k.key.length - 4);
            return (
              <div key={k.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-[#2a2d3a]">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{k.name}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">{maskedKey}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Created {k.created}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleCopy(k.key)} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg px-3 py-1.5 transition-colors">Copy</button>
                  <button onClick={() => revokeKey(k.id)} className="text-[10px] font-bold text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors">Revoke</button>
                </div>
              </div>
            );
          })}
          <button onClick={generateNewKey} className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1">
            <Icon d={ICONS.key} className="w-4 h-4" /> Generate New API Key
          </button>
        </div>
      </SettingCard>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralTab />;
      case 'profile': return <ProfileTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      case 'billing': return <BillingTab />;
      case 'integrations': return <IntegrationsTab />;
      default: return <GeneralTab />;
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your platform preferences and configuration">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Tab list (sidebar) ── */}
          <aside className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-2 lg:sticky lg:top-20">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all mb-0.5
                    ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                >
                  <Icon d={tab.icon} className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* ── Tab content ── */}
          <div className="flex-1 min-w-0">
            {renderTab()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
