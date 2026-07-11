'use client';

import { useState, useMemo, useEffect } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';
import { useAuth } from '@/lib/AuthContext';

interface TeacherSettings {
  employeeId: string;
  subject: string;
  qualification: string;
  doj: string;
  experienceYears: number;
  salary: number;
}

const fetcher = (url: string) => api.get(url);

export default function SchoolTeachersPage() {
  const { schoolId } = useAuth();
  const { data, error, mutate } = useSWR('/users?role=Teacher&limit=100', fetcher, {
    revalidateOnFocus: false,
  });

  const rawTeachers = data?.users || [];
  const isLoading = !data && !error;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Teacher@123',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    employeeId: '',
    subject: 'Mathematics',
    qualification: 'M.Sc B.Ed',
    doj: '2022-06-01',
    experienceYears: 5,
    salary: 45000,
  });

  // Calculate unique subjects
  const subjects = useMemo(() => {
    const list = new Set<string>();
    rawTeachers.forEach((t: any) => {
      if (t.settings?.subject) {
        list.add(t.settings.subject);
      }
    });
    // Add defaults if empty
    if (list.size === 0) {
      return ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Computer Science'];
    }
    return Array.from(list);
  }, [rawTeachers]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return rawTeachers.filter((teacher: any) => {
      const settings = teacher.settings || {};
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'All' || settings.subject === selectedSubject;
      const matchesStatus = selectedStatus === 'All' || teacher.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [rawTeachers, searchQuery, selectedSubject, selectedStatus]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = rawTeachers.length;
    const active = rawTeachers.filter((t: any) => t.status === 'Active').length;
    const avgExp = total
      ? Math.round(rawTeachers.reduce((acc: number, t: any) => acc + (t.settings?.experienceYears || 5), 0) / total)
      : 8;
    const totalPayroll = rawTeachers.reduce((acc: number, t: any) => acc + (t.settings?.salary || 40000), 0);

    return { total, active, avgExp, totalPayroll };
  }, [rawTeachers]);

  // Add/Edit Openers
  const handleAddOpen = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'Teacher@123',
      status: 'Active',
      employeeId: `TCH${Math.floor(100 + Math.random() * 900)}`,
      subject: 'Mathematics',
      qualification: 'M.Sc, B.Ed',
      doj: '2024-01-10',
      experienceYears: 4,
      salary: 40000,
    });
    setIsModalOpen(true);
  };

  const handleEditOpen = (teacher: any) => {
    setIsEditing(true);
    setCurrentId(teacher.id || teacher._id);
    const settings = teacher.settings || {};
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      password: '',
      status: teacher.status || 'Active',
      employeeId: settings.employeeId || '',
      subject: settings.subject || 'Mathematics',
      qualification: settings.qualification || '',
      doj: settings.doj || '',
      experienceYears: settings.experienceYears || 0,
      salary: settings.salary || 0,
    });
    setIsModalOpen(true);
  };

  // Save / Delete Handlers
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        role: 'Teacher',
        schoolId: schoolId,
        settings: {
          employeeId: formData.employeeId,
          subject: formData.subject,
          qualification: formData.qualification,
          doj: formData.doj,
          experienceYears: Number(formData.experienceYears),
          salary: Number(formData.salary),
        },
        ...(formData.password && !isEditing ? { password: formData.password } : {}),
      };

      if (isEditing && currentId) {
        await api.put(`/users/${currentId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving teacher profile');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return;
    try {
      await api.delete(`/users/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.message || 'Error deleting teacher');
    }
  };

  // Seed Helper
  const seedDemoTeachers = async () => {
    const demoTeachers = [
      { name: 'Dr. Vivek Dev', email: 'vivek.dev@school.in', subject: 'Mathematics', qualification: 'Ph.D in Maths', exp: 12, salary: 55000 },
      { name: 'Meera Sen', email: 'meera.sen@school.in', subject: 'Science', qualification: 'M.Sc Biology, B.Ed', exp: 7, salary: 45000 },
      { name: 'Rohan Deshmukh', email: 'rohan.desh@school.in', subject: 'Computer Science', qualification: 'B.Tech CSE, M.Tech', exp: 4, salary: 48000 },
      { name: 'Aparna Nair', email: 'aparna.nair@school.in', subject: 'English', qualification: 'M.A English Literature', exp: 8, salary: 42000 },
      { name: 'Sanjay Dutt', email: 'sanjay.dutt@school.in', subject: 'Physics', qualification: 'M.Sc Physics, B.Ed', exp: 9, salary: 46000 },
    ];

    try {
      for (const dt of demoTeachers) {
        const emailExists = rawTeachers.some((t: any) => t.email === dt.email);
        if (emailExists) continue;

        await api.post('/users', {
          name: dt.name,
          email: dt.email,
          password: 'Teacher@123',
          role: 'Teacher',
          schoolId: schoolId,
          status: 'Active',
          phone: '+91 88888 22222',
          settings: {
            employeeId: `TCH${Math.floor(100 + Math.random() * 900)}`,
            subject: dt.subject,
            qualification: dt.qualification,
            doj: '2021-08-15',
            experienceYears: dt.exp,
            salary: dt.salary,
          },
        });
      }
      mutate();
    } catch (err: any) {
      alert('Failed to seed teachers: ' + err.message);
    }
  };

  return (
    <SchoolLayout title="Teachers Directory" subtitle="Manage school teaching staff, subject specializations, and payroll parameters.">
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Seed helper */}
        {rawTeachers.length === 0 && !isLoading && (
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                Get Started with Demo Teachers Data
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                No teaching staff found. Instantly generate 5 professional teacher profiles mapped with their specific departments and qualifications.
              </p>
            </div>
            <button
              onClick={seedDemoTeachers}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all flex-shrink-0 shadow-md shadow-blue-500/10"
            >
              <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-3-3m3 3l3-3" className="w-4 h-4" />
              Populate Demo Teachers
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Faculty', value: stats.total, color: 'text-blue-650 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Teachers', value: stats.active, color: 'text-green-650 dark:text-green-400', bg: 'bg-green-500/10' },
            { label: 'Avg Experience', value: `${stats.avgExp} Years`, color: 'text-purple-650 dark:text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Est. Monthly Payroll', value: `₹${stats.totalPayroll.toLocaleString()}`, color: 'text-emerald-750 dark:text-emerald-450', bg: 'bg-emerald-505/10' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${item.color} ${item.bg}`}>
                ★
              </span>
              <div>
                <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions bar and Main view */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/70">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teachers, subject, employee ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <button
              onClick={handleAddOpen}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 transition-transform hover:-translate-y-0.5"
            >
              <Icon d={ICONS.user} className="w-4 h-4" />
              Add Teacher
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1c1f2e] border-b border-slate-105 dark:border-[#2b2e3b]">
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Employee ID</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Teacher</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Specialization</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Qualification</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Experience</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Salary</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-550 mr-2">Loading teachers list...</td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Icon d={ICONS.users} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500">No teachers found</p>
                      <p className="text-xs text-slate-455 mt-1">Add a teacher or adjust search criteria</p>
                    </td>
                  </tr>
                ) : filteredTeachers.map((teacher: any) => {
                  const settings = teacher.settings || {};
                  const initialName = teacher.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={teacher.id || teacher._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-slate-700 dark:text-slate-350">
                        {settings.employeeId || '—'}
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-650 flex items-center justify-center text-white font-bold text-xs">
                            {initialName || 'TC'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{teacher.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{teacher.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-0">
                          {settings.subject || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {settings.qualification || 'B.Ed'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {settings.experienceYears ?? 0} Years
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ₹{(settings.salary || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          teacher.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {teacher.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit teacher"
                            onClick={() => handleEditOpen(teacher)}
                            className="w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete teacher"
                            onClick={() => handleDelete(teacher.id || teacher._id)}
                            className="w-7 h-7 rounded-lg text-slate-505 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-455 hover:bg-red-50 dark:hover:bg-red-950/25 flex items-center justify-center transition-all"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-55/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Modify Teacher Record' : 'Register New Teacher'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Teacher Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter teacher's full name"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Email Address (Optional)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@schoolsaas.in"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Password if adding */}
                {!isEditing && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Login Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Teacher@123"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* Employee ID */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-505 uppercase">Subject Area</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science (General)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="History">History & Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                {/* Qualification */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Highest Qualification</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="M.Sc Mathematics, B.Ed"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 99000 11122"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Date of Joining */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.doj}
                    onChange={e => setFormData({ ...formData, doj: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-[#1a1d27]/0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Salary */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Monthly Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                    placeholder="45000"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1 col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Registration Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-650 dark:text-slate-350 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/10 transition-colors"
                >
                  Save Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
