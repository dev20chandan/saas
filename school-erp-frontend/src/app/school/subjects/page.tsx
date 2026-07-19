'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  type: string; // Theory / Practical / Lab
  className: string;
  teacherName: string;
}

const fetcher = (url: string) => api.get(url);

export default function SchoolSubjectsPage() {
  const { data: subjectsList, error: subjectsError, mutate: mutateSubjects } = useSWR('/subjects', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: teachersData } = useSWR('/users?role=Teacher&limit=100', fetcher, { revalidateOnFocus: false });
  const { data: classesData } = useSWR('/classes', fetcher, { revalidateOnFocus: false });

  const rawSubjects = subjectsList || [];
  const teachers = teachersData?.users || [];
  const classes = classesData || [];
  const isLoading = !subjectsList && !subjectsError;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory',
    className: '',
    teacherName: '',
  });

  // Calculate unique classes
  const classesOptions = useMemo(() => {
    const list = new Set<string>();
    classes.forEach((c: any) => {
      if (c.name) list.add(c.name);
    });
    if (list.size === 0) {
      return ['10-A', '10-B', '9-A', '9-B', '8-A', '11-Sci', '12-Comm'];
    }
    return Array.from(list);
  }, [classes]);

  // Filter subjects
  const filteredSubjects = useMemo(() => {
    return rawSubjects.filter((sub: SubjectItem) => {
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === 'All' || sub.className === selectedClass;
      const matchesType = selectedType === 'All' || sub.type === selectedType;

      return matchesSearch && matchesClass && matchesType;
    });
  }, [rawSubjects, searchQuery, selectedClass, selectedType]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = rawSubjects.length;
    const theory = rawSubjects.filter((s: SubjectItem) => s.type === 'Theory').length;
    const practical = rawSubjects.filter((s: SubjectItem) => s.type === 'Practical' || s.type === 'Lab').length;
    const uniqueClasses = new Set(rawSubjects.map((s: SubjectItem) => s.className)).size;

    return { total, theory, practical, uniqueClasses };
  }, [rawSubjects]);

  // Open modal for adding
  const handleAddOpen = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      code: `SUB${Math.floor(100 + Math.random() * 900)}`,
      type: 'Theory',
      className: classesOptions[0] || '10-A',
      teacherName: teachers[0]?.name || 'Dr. Vivek Dev',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditOpen = (sub: SubjectItem) => {
    setIsEditing(true);
    setCurrentId(sub.id);
    setFormData({
      name: sub.name,
      code: sub.code,
      type: sub.type,
      className: sub.className,
      teacherName: sub.teacherName,
    });
    setIsModalOpen(true);
  };

  // Save Subject
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        className: formData.className,
        teacherName: formData.teacherName,
      };

      if (isEditing && currentId) {
        await api.put(`/subjects/${currentId}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      mutateSubjects();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving subject parameters');
    }
  };

  // Delete Subject
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subject syllabus?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      mutateSubjects();
    } catch (err: any) {
      alert(err.message || 'Error deleting subject');
    }
  };

  // Seed Helpers
  const seedDemoSubjects = async () => {
    const demo = [
      { name: 'Mathematics', code: 'MATH101', type: 'Theory', class: '10-A', mentor: 'Dr. Vivek Dev' },
      { name: 'Physics Laboratory', code: 'PHYS102', type: 'Practical', class: '10-A', mentor: 'Dr. Vivek Dev' },
      { name: 'English Literature', code: 'ENGL203', type: 'Theory', class: '10-B', mentor: 'Meera Sen' },
      { name: 'World History', code: 'HIST204', type: 'Theory', class: '9-A', mentor: 'Aparna Nair' },
      { name: 'Computer Applications', code: 'COMP305', type: 'Lab', class: '8-A', mentor: 'Rohan Deshmukh' },
      { name: 'Chemistry Laboratory', code: 'CHEM108', type: 'Practical', class: '10-A', mentor: 'Dr. Vivek Dev' },
    ];

    try {
      for (const item of demo) {
        const exists = rawSubjects.some((s: SubjectItem) => s.code === item.code);
        if (exists) continue;

        await api.post('/subjects', {
          name: item.name,
          code: item.code,
          type: item.type,
          className: item.class,
          teacherName: item.mentor,
        });
      }
      mutateSubjects();
    } catch (err: any) {
      alert('Failed to seed subjects: ' + err.message);
    }
  };

  return (
    <SchoolLayout title="Subject Management" subtitle="Define syllabus schedules, course configurations, and teacher assignments.">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Helper Banner */}
        {rawSubjects.length === 0 && !isLoading && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Initialize School Syllabus
              </h4>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 max-w-xl">
                There are no active subject records added yet. Click the trigger below to generate standard courses and laboratory configurations for your active classes.
              </p>
            </div>
            <button
              onClick={seedDemoSubjects}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all flex-shrink-0 shadow-md"
            >
              <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-3-3m3 3l3-3" className="w-4 h-4" />
              Populate Default Subjects
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Subjects', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Theory Papers', value: stats.theory, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
            { label: 'Practicals / Labs', value: stats.practical, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Mapped Classes', value: stats.uniqueClasses, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
          ].map(it => (
            <div key={it.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 ${it.bg} ${it.color}`}>
                📚
              </span>
              <div>
                <p className={`text-lg font-extrabold ${it.color}`}>{it.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{it.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar & Table */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/70">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject title, code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Classes</option>
                {classesOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>

              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Lab">Lab</option>
              </select>
            </div>

            <button
              onClick={handleAddOpen}
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transitional-transform"
            >
              <Icon d={ICONS.dashboard} className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1c1f2e] border-b border-slate-105 dark:border-[#2b2e3b]">
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Subject Code</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Subject Title</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Academic Grade</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Paper Type</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Instructor / Mentor</th>
                  <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400">Loading syllabus directory...</td>
                  </tr>
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Icon d={ICONS.schools} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500">No subject records found</p>
                    </td>
                  </tr>
                ) : filteredSubjects.map((sub: SubjectItem) => {
                  let typeBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-805 dark:text-slate-300';
                  if (sub.type === 'Theory') typeBadge = 'bg-indigo-50 text-indigo-750 dark:bg-indigo-950/20 dark:text-indigo-400';
                  else if (sub.type === 'Practical') typeBadge = 'bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400';
                  else if (sub.type === 'Lab') typeBadge = 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-450';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-indigo-650 dark:text-indigo-400">
                        {sub.code}
                      </td>
                      <td className="px-4 py-4 text-xs font-black text-slate-900 dark:text-white">
                        {sub.name}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-650 dark:text-slate-350">
                        Class {sub.className}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${typeBadge}`}>
                          {sub.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {sub.teacherName}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit context parameters"
                            onClick={() => handleEditOpen(sub)}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Remove Course record"
                            onClick={() => handleDelete(sub.id)}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-red-650 dark:hover:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/25 flex items-center justify-center transition-all"
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

      {/* Enroll/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Modify Subject Fields' : 'Add Subject Standard'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-3">

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-550 uppercase">Subject Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mathematics, General Science"
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Subject / Syllabus Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Class Grade</label>
                  <select
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-805 dark:text-white"
                  >
                    {classesOptions.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Course Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-205 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-805 dark:text-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Assigned Instructor / Teacher</label>
                  <select
                    value={formData.teacherName}
                    onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    {teachers.map((t: any) => <option key={t.id || t._id} value={t.name}>{t.name}</option>)}
                    {teachers.length === 0 && (
                      <>
                        <option value="Dr. Vivek Dev">Dr. Vivek Dev</option>
                        <option value="Meera Sen">Meera Sen</option>
                        <option value="Sanjay Dutt">Sanjay Dutt</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-55 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10"
                >
                  Save Subject
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
