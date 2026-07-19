'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface Enquiry {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  address?: string;
  course: string;
  className: string;
  source: string;
  status: string;
  remarks?: string;
  followUpDate?: string;
  assignedTo?: string;
  createdAt: string;
}

const fetcher = (url: string) => api.get(url);

const STATUS_OPTIONS = ['New', 'Called', 'Interested', 'Enrolled', 'Not Interested', 'Follow-Up'];
const SOURCE_OPTIONS = ['Walk-In', 'Online', 'Referral', 'Social Media', 'Newspaper Ad', 'School Event', 'Other'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  New:            { bg: 'bg-blue-50 dark:bg-blue-950/20',   text: 'text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500' },
  Called:         { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  Interested:     { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  Enrolled:       { bg: 'bg-green-50 dark:bg-green-950/25',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500' },
  'Not Interested': { bg: 'bg-red-50 dark:bg-red-950/20',    text: 'text-red-650 dark:text-red-400',      dot: 'bg-red-500' },
  'Follow-Up':    { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const EMPTY_FORM = {
  studentName: '', parentName: '', phone: '', email: '',
  address: '', course: '', className: '', source: 'Walk-In',
  status: 'New', remarks: '', followUpDate: '', assignedTo: '',
};

export default function AdmissionEnquiryPage() {
  const { data: rawList, error, mutate } = useSWR('/enquiry', fetcher, { revalidateOnFocus: false });
  const { data: classesData } = useSWR('/classes', fetcher, { revalidateOnFocus: false });

  const enquiries: Enquiry[] = rawList || [];
  const classOptions: string[] = useMemo(() => {
    const s = new Set<string>();
    (classesData || []).forEach((c: any) => c.name && s.add(c.name));
    return s.size > 0 ? Array.from(s) : ['10-A', '10-B', '9-A', '9-B', '8-A'];
  }, [classesData]);

  const isLoading = !rawList && !error;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [viewItem, setViewItem] = useState<Enquiry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Summary stats
  const stats = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'New').length,
    interested: enquiries.filter(e => e.status === 'Interested').length,
    enrolled: enquiries.filter(e => e.status === 'Enrolled').length,
    followUp: enquiries.filter(e => e.status === 'Follow-Up' || e.status === 'Called').length,
  }), [enquiries]);

  // Filtered list
  const filtered = useMemo(() => {
    return enquiries.filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.studentName.toLowerCase().includes(q) ||
        e.parentName.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.course.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enquiries, search, statusFilter]);

  // Handlers
  const openAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ ...EMPTY_FORM, className: classOptions[0] || '10-A' });
    setIsModalOpen(true);
  };

  const openEdit = (e: Enquiry) => {
    setIsEditing(true);
    setCurrentId(e.id);
    setFormData({
      studentName: e.studentName, parentName: e.parentName, phone: e.phone,
      email: e.email || '', address: e.address || '', course: e.course,
      className: e.className, source: e.source, status: e.status,
      remarks: e.remarks || '', followUpDate: e.followUpDate || '',
      assignedTo: e.assignedTo || '',
    });
    setIsModalOpen(true);
  };

  const quickStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/enquiry/${id}`, { status: newStatus });
      mutate();
    } catch { /* silent */ }
  };

  const handleSave = async (evt: React.FormEvent) => {
    evt.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        studentName: formData.studentName, parentName: formData.parentName, phone: formData.phone,
        email: formData.email || undefined, address: formData.address || undefined,
        course: formData.course, className: formData.className, source: formData.source,
        status: formData.status, remarks: formData.remarks || undefined,
        followUpDate: formData.followUpDate || undefined, assignedTo: formData.assignedTo || undefined,
      };
      if (isEditing && currentId) {
        await api.put(`/enquiry/${currentId}`, payload);
      } else {
        await api.post('/enquiry', payload);
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving enquiry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this enquiry permanently?')) return;
    try {
      await api.delete(`/enquiry/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.message || 'Error deleting enquiry');
    }
  };

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <SchoolLayout title="Admission Enquiry" subtitle="Track prospective student inquiries, leads, follow-ups, and conversion pipeline.">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Enquiries', value: stats.total, icon: '📋', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'New Leads', value: stats.new, icon: '🆕', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Interested', value: stats.interested, icon: '⭐', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Follow-Up', value: stats.followUp, icon: '📞', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Enrolled', value: stats.enrolled, icon: '✅', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${s.bg}`}>{s.icon}</span>
              <div className="min-w-0">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col sm:flex-row items-center gap-3 bg-slate-50/40 dark:bg-[#1c1f2e]/60">
            {/* Search */}
            <div className="relative flex-1 min-w-0 w-full sm:max-w-sm">
              <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search student, parent, phone..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/15"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-xl gap-1 flex-wrap">
              {['All', 'New', 'Called', 'Interested', 'Enrolled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`h-8 px-3 rounded-lg text-[11px] font-bold transition-all ${statusFilter === s ? 'bg-white dark:bg-[#1a1d27] text-green-700 dark:text-green-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={openAdd}
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-green-500/10 transition-colors flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <Icon d={ICONS.users} className="w-4 h-4" />
              New Enquiry
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-[#1c1f2e] border-b border-slate-100 dark:border-[#2a2d3a]">
                <tr>
                  {['Student / Parent', 'Contact', 'Course & Class', 'Source', 'Status', 'Follow-Up', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr><td colSpan={7} className="py-16 text-center text-sm text-slate-400 animate-pulse">Loading enquiries...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <p className="text-3xl mb-2">📋</p>
                      <p className="text-sm font-semibold text-slate-500">No enquiries found</p>
                      <button onClick={openAdd} className="mt-3 text-xs text-green-600 font-bold hover:underline">
                        + Add first enquiry
                      </button>
                    </td>
                  </tr>
                ) : filtered.map(enq => {
                  const sc = STATUS_CONFIG[enq.status] || STATUS_CONFIG['New'];
                  const dateStr = new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-xs font-black text-slate-900 dark:text-white">{enq.studentName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">👨‍👩‍👧 {enq.parentName}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{dateStr}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{enq.phone}</p>
                        {enq.email && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">{enq.email}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{enq.course}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Class {enq.className}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {enq.source}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={enq.status}
                          onChange={e => quickStatus(enq.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer border-0 appearance-none ${sc.bg} ${sc.text}`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        {enq.followUpDate ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{enq.followUpDate}</span>
                        ) : (
                          <span className="text-[10px] text-slate-350">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewItem(enq)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 flex items-center justify-center transition-all"
                            title="View Details"
                          >
                            <Icon d={ICONS.audit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(enq)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(enq.id)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-sm">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isEditing ? '✏️ Update Enquiry Record' : '📋 New Admission Enquiry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center">
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Student Info */}
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mb-3">Student Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Student Name*</label>
                    <input required value={formData.studentName} onChange={f('studentName')} placeholder="Full name of student"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Parent / Guardian Name*</label>
                    <input required value={formData.parentName} onChange={f('parentName')} placeholder="Parent full name"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Mobile Number*</label>
                    <input required value={formData.phone} onChange={f('phone')} placeholder="+91 XXXXXXXXXX" type="tel"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Email Address</label>
                    <input value={formData.email} onChange={f('email')} placeholder="email@example.com" type="email"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Home Address</label>
                    <input value={formData.address} onChange={f('address')} placeholder="Full residential address"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mb-3">Course & Enquiry Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Course Interested In*</label>
                    <input required value={formData.course} onChange={f('course')} placeholder="e.g. JEE Prep, NEET Foundation"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Target Class / Grade*</label>
                    <select value={formData.className} onChange={f('className')}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                      {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Lead Source</label>
                    <select value={formData.source} onChange={f('source')}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                      {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Status</label>
                    <select value={formData.status} onChange={f('status')}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Follow-Up Date</label>
                    <input type="date" value={formData.followUpDate} onChange={f('followUpDate')}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Assigned Counsellor</label>
                    <input value={formData.assignedTo} onChange={f('assignedTo')} placeholder="Staff member name"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Remarks / Notes</label>
                    <textarea value={formData.remarks} onChange={f('remarks')} rows={2}
                      placeholder="Any additional follow-up notes, fee discussion, special requirements..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-green-500/10 transition-colors">
                  {isSaving ? 'Saving...' : isEditing ? 'Update Enquiry' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Enquiry Details</h3>
              <button onClick={() => setViewItem(null)} className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center">
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                  {viewItem.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{viewItem.studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Parent: {viewItem.parentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Phone', value: viewItem.phone },
                  { label: 'Email', value: viewItem.email || '—' },
                  { label: 'Course', value: viewItem.course },
                  { label: 'Class', value: `Class ${viewItem.className}` },
                  { label: 'Source', value: viewItem.source },
                  { label: 'Status', value: viewItem.status },
                  { label: 'Follow-Up', value: viewItem.followUpDate || '—' },
                  { label: 'Assigned To', value: viewItem.assignedTo || '—' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {viewItem.address && (
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{viewItem.address}</p>
                </div>
              )}

              {viewItem.remarks && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">📝 Remarks</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{viewItem.remarks}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5">
                  Edit Record
                </button>
                <button onClick={() => setViewItem(null)}
                  className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
