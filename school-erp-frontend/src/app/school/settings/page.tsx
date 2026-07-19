'use client';

import { useState, useEffect } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const TABS = [
  { id: 'profile', label: 'School Profile', icon: ICONS.schools },
  { id: 'security', label: 'Security', icon: ICONS.shield },
  { id: 'notifications', label: 'Notifications', icon: ICONS.bell },
];

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

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none cursor-pointer
        ${checked ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out
        ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function Field({ label, id, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
      <input
        id={id}
        {...rest}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
      />
    </div>
  );
}

function ToggleRow({ id, label, description, checked, onChange }: { id: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-205">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-bold transition-all
          ${saved ? 'bg-green-500 text-white' : 'bg-green-655 hover:bg-green-700 text-white shadow-md shadow-green-500/15'}`}
      >
        {saved ? (
          <><Icon d={ICONS.check} className="w-4 h-4" /> Changes Saved!</>
        ) : (
          <><Icon d={ICONS.save} className="w-4 h-4" /> Save Preferences</>
        )}
      </button>
    </div>
  );
}

// ── Profile Tab ──
function SchoolProfileTab() {
  const { schoolId, setSchoolColor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Delhi Public School',
    domain: 'dps.schoolsaas.in',
    principal: 'Dr. Vivek Dev',
    email: 'contact@dps.edu.in',
    phone: '+91 99999 88888',
    city: 'Hyderabad',
    board: 'CBSE Board',
    themeColor: '#10b981',
  });

  useEffect(() => {
    async function loadSchoolData() {
      if (!schoolId) return;
      try {
        const sc = await api.get(`/schools/${schoolId}`);
        if (sc) {
          setProfile({
            name: sc.name || '',
            domain: sc.domain || '',
            principal: sc.principal || sc.contactPerson || 'Dr. K. Nair',
            email: sc.email || '',
            phone: sc.phone || '',
            city: sc.city || 'Delhi',
            board: sc.plan || 'CBSE Board',
            themeColor: sc.themeColor || '#10b981',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSchoolData();
  }, [schoolId]);

  async function handleSave() {
    try {
      if (schoolId) {
        // Attempt updates to school in DB
        await api.put(`/schools/${schoolId}`, {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          principal: profile.principal,
          city: profile.city,
          themeColor: profile.themeColor,
        });

        // Set state globally in AuthContext to update immediately across layout
        setSchoolColor(profile.themeColor);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert('Error updating profiles: ' + err.message);
    }
  }

  return (
    <SettingCard title="School Profile Information" description="Set global public profiles and communication contact channels.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">School Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-905 dark:text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">Registered Subdomain</label>
          <input
            type="text"
            disabled
            value={profile.domain}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-slate-50 dark:bg-[#11131c] text-sm text-slate-400 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">Principal Name/Head</label>
          <input
            type="text"
            value={profile.principal}
            onChange={e => setProfile({ ...profile, principal: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-905 dark:text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">Affiliation Board</label>
          <input
            type="text"
            value={profile.board}
            onChange={e => setProfile({ ...profile, board: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-905 dark:text-white"
          />
        </div>
        <div className="col-span-1 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 my-2" />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">Main Office Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-905 dark:text-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">Office Helpline Phone</label>
          <input
            type="text"
            value={profile.phone}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-905 dark:text-white"
          />
        </div>
        <div className="col-span-1 sm:col-span-2 border-t border-slate-100 dark:border-slate-800 my-2" />
        <div className="col-span-1 sm:col-span-2 space-y-3">
          <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400">School Dashboard Theme Color</label>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { name: 'Emerald', hex: '#10b981' },
              { name: 'Indigo', hex: '#4f46e5' },
              { name: 'Violet', hex: '#8b5cf6' },
              { name: 'Blue', hex: '#3b82f6' },
              { name: 'Amber', hex: '#f59e0b' },
              { name: 'Rose', hex: '#f43f5e' },
              { name: 'Slate', hex: '#64748b' },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => setProfile({ ...profile, themeColor: col.hex })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all relative
                  ${profile.themeColor.toLowerCase() === col.hex.toLowerCase() 
                    ? 'border-slate-850 scale-110 shadow-md shadow-black/10 dark:border-white' 
                    : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {profile.themeColor.toLowerCase() === col.hex.toLowerCase() && (
                  <span className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                )}
              </button>
            ))}
            
            {/* Custom Color Input */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-[#2a2d3a]">
              <span className="text-xs text-slate-500 font-medium">Custom:</span>
              <input
                type="color"
                value={profile.themeColor}
                onChange={e => setProfile({ ...profile, themeColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none"
              />
              <span className="text-xs font-mono uppercase text-slate-600 dark:text-slate-300 font-semibold">{profile.themeColor}</span>
            </div>
          </div>
        </div>
      </div>
      <SaveBtn onClick={handleSave} saved={saved} />
    </SettingCard>
  );
}

// ── Security Tab ──
function SchoolSecurityTab() {
  const { type: userType } = useAuth();
  const [passSaved, setPassSaved] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [userId, setUserId] = useState('');
  
  const [currentVal, setCurrentVal] = useState('');
  const [newVal, setNewVal] = useState('');
  const [confirmVal, setConfirmVal] = useState('');

  useEffect(() => {
    async function loadMe() {
      try {
        const me = await api.get('/auth/me');
        if (me && me.id) {
          setUserId(me.id);
          const endpoint = userType === 'admin' ? 'admins' : 'users';
          const data = await api.get(`/${endpoint}/${me.id}`);
          if (data && data.settings) {
            setTwoFA(data.settings.school_twoFA !== false);
            setLoginAlerts(data.settings.school_loginAlerts !== false);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMe();
  }, [userType]);

  async function updatePref(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    if (!userId) return;
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const curSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...curSettings,
          [key]: val,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePassUpdate() {
    if (!newVal || newVal !== confirmVal) {
      alert('New Passwords must match and cannot be empty!');
      return;
    }
    try {
      if (userId) {
        const endpoint = userType === 'admin' ? 'admins' : 'users';
        await api.put(`/${endpoint}/${userId}`, {
          password: newVal,
        });
        setPassSaved(true);
        setTimeout(() => setPassSaved(false), 2000);
        setCurrentVal('');
        setNewVal('');
        setConfirmVal('');
      }
    } catch (err: any) {
      alert('Error updating password: ' + err.message);
    }
  }

  return (
    <div className="space-y-5">
      <SettingCard title="Update Portal Password" description="Secure your administrative account login credential settings.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <Field id="curr-pw-input" label="Current Password" type="password" placeholder="••••••••" value={currentVal} onChange={e => setCurrentVal(e.target.value)} />
          <div />
          <Field id="new-pw-input" label="New Password" type="password" placeholder="••••••••" value={newVal} onChange={e => setNewVal(e.target.value)} />
          <Field id="conf-pw-input" label="Confirm Password" type="password" placeholder="••••••••" value={confirmVal} onChange={e => setConfirmVal(e.target.value)} />
        </div>
        <SaveBtn onClick={handlePassUpdate} saved={passSaved} />
      </SettingCard>

      <SettingCard title="Security Preferences">
        <ToggleRow id="school-2fa" label="Requires Double Auth" description="Prompt confirmation codes on logins" checked={twoFA} onChange={v => updatePref('school_twoFA', v, setTwoFA)} />
        <div className="border-t border-slate-105" />
        <ToggleRow id="school-alerts" label="Admin Login Alerts" description="Email staff whenever admin accounts log in" checked={loginAlerts} onChange={v => updatePref('school_loginAlerts', v, setLoginAlerts)} />
      </SettingCard>
    </div>
  );
}

// ── Notifications Tab ──
function SchoolNotificationsTab() {
  const { type: userType } = useAuth();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsAdmission, setSmsAdmission] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function loadMe() {
      try {
        const me = await api.get('/auth/me');
        if (me && me.id) {
          setUserId(me.id);
          const endpoint = userType === 'admin' ? 'admins' : 'users';
          const data = await api.get(`/${endpoint}/${me.id}`);
          if (data && data.settings) {
            setEmailNotif(data.settings.s_emailNotif !== false);
            setSmsAdmission(data.settings.s_smsAdmission !== false);
            setAttendanceAlerts(data.settings.s_attendanceAlerts === true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMe();
  }, [userType]);

  async function updateNotif(key: string, val: boolean, setter: (v: boolean) => void) {
    setter(val);
    if (!userId) return;
    try {
      const endpoint = userType === 'admin' ? 'admins' : 'users';
      const user = await api.get(`/${endpoint}/${userId}`);
      const curSettings = user?.settings || {};
      await api.put(`/${endpoint}/${userId}`, {
        settings: {
          ...curSettings,
          [key]: val,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SettingCard title="Alert Channels & Subscriptions" description="Configure when SMS or email alerts propagate.">
      <ToggleRow id="notif-e" label="Weekly Faculty Performance Reports" description="Email reports summary of attendance and logs every Saturday" checked={emailNotif} onChange={v => updateNotif('s_emailNotif', v, setEmailNotif)} />
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <ToggleRow id="notif-admissions" label="Immediate Admission SMS Alerts" description="Ping parents immediately when student accounts are defined" checked={smsAdmission} onChange={v => updateNotif('s_smsAdmission', v, setSmsAdmission)} />
      <div className="border-t border-slate-100 dark:border-slate-800" />
      <ToggleRow id="notif-attendance" label="Daily Absent Notifications" description="Dispatch automated alerts to absent students' guardians" checked={attendanceAlerts} onChange={v => updateNotif('s_attendanceAlerts', v, setAttendanceAlerts)} />
    </SettingCard>
  );
}

export default function SchoolSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <SchoolProfileTab />;
      case 'security': return <SchoolSecurityTab />;
      case 'notifications': return <SchoolNotificationsTab />;
      default: return <SchoolProfileTab />;
    }
  };

  return (
    <SchoolLayout title="Administrative Settings" subtitle="Configure school profiles, portal credentials, and parent communication channels.">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-slate-100 dark:border-[#2a2d3a] shadow-sm p-2 lg:sticky lg:top-20">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all mb-0.5
                    ${activeTab === tab.id
                      ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                    }`}
                >
                  <Icon d={tab.icon} className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-505'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {renderTab()}
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}
