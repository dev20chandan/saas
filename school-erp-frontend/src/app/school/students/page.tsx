'use client';

import { useState, useMemo, useEffect } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';
import { useAuth } from '@/lib/AuthContext';

interface StudentSettings {
  rollNumber: string;
  className: string;
  guardianName: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  feeStatus?: 'Paid' | 'Pending' | 'Overdue';
  attendanceRate?: number;
}

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  settings: StudentSettings;
  createdAt: string;
}

const fetcher = (url: string) => api.get(url);

export default function SchoolStudentsPage() {
  const { schoolId } = useAuth();
  const { data, error, mutate } = useSWR('/students?limit=100', fetcher, {
    revalidateOnFocus: false,
  });

  const rawStudents = data?.users || [];
  const isLoading = !data && !error;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Student@123',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    rollNumber: '',
    className: '10-A',
    guardianName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    feeStatus: 'Pending' as 'Paid' | 'Pending' | 'Overdue',
    attendanceRate: 95,
  });

  // Calculate unique classes
  const classes = useMemo(() => {
    const list = new Set<string>();
    rawStudents.forEach((s: any) => {
      if (s.settings?.className) {
        list.add(s.settings.className);
      }
    });
    // Add default options if empty
    if (list.size === 0) {
      return ['10-A', '10-B', '9-A', '9-B', '8-A', '11-Sci', '12-Comm'];
    }
    return Array.from(list);
  }, [rawStudents]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return rawStudents.filter((student: any) => {
      const settings = student.settings || {};
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings.guardianName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === 'All' || settings.className === selectedClass;
      const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [rawStudents, searchQuery, selectedClass, selectedStatus]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = rawStudents.length;
    const paid = rawStudents.filter((s: any) => s.settings?.feeStatus === 'Paid').length;
    const pending = rawStudents.filter((s: any) => s.settings?.feeStatus === 'Pending').length;
    const overdue = rawStudents.filter((s: any) => s.settings?.feeStatus === 'Overdue').length;
    const avgAttendance = total
      ? Math.round(rawStudents.reduce((acc: number, s: any) => acc + (s.settings?.attendanceRate || 95), 0) / total)
      : 96;

    return { total, paid, pending, overdue, avgAttendance };
  }, [rawStudents]);

  // Open modal for add
  const handleAddOpen = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'Student@123',
      status: 'Active',
      rollNumber: `STU${Math.floor(1000 + Math.random() * 9000)}`,
      className: '10-A',
      guardianName: '',
      dob: '2010-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      feeStatus: 'Pending',
      attendanceRate: 98,
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEditOpen = (student: any) => {
    setIsEditing(true);
    setCurrentId(student.id || student._id);
    const settings = student.settings || {};
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      password: '',
      status: student.status || 'Active',
      rollNumber: settings.rollNumber || '',
      className: settings.className || '10-A',
      guardianName: settings.guardianName || '',
      dob: settings.dob || '',
      gender: settings.gender || 'Male',
      bloodGroup: settings.bloodGroup || 'O+',
      feeStatus: settings.feeStatus || 'Pending',
      attendanceRate: settings.attendanceRate || 95,
    });
    setIsModalOpen(true);
  };

  // Save student
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        schoolId: schoolId,
        settings: {
          rollNumber: formData.rollNumber,
          className: formData.className,
          guardianName: formData.guardianName,
          dob: formData.dob,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          feeStatus: formData.feeStatus,
          attendanceRate: formData.attendanceRate,
        },
        ...(formData.password && !isEditing ? { password: formData.password } : {}),
      };

      if (isEditing && currentId) {
        await api.put(`/students/${currentId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      mutate();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving student');
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.message || 'Error deleting student');
    }
  };

  // Seed demo students helper
  const seedDemoStudents = async () => {
    const demoStudents = [
      { name: 'Aarav Sharma', email: 'aarav.sharma@school.in', roll: '1001', class: '10-A', guardian: 'Ramesh Sharma', gender: 'Male', fee: 'Paid' },
      { name: 'Diya Patel', email: 'diya.patel@school.in', roll: '1002', class: '10-A', guardian: 'Karan Patel', gender: 'Female', fee: 'Pending' },
      { name: 'Kabir Singh', email: 'kabir.singh@school.in', roll: '1003', class: '10-B', guardian: 'Jaspreet Singh', gender: 'Male', fee: 'Overdue' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@school.in', roll: '1004', class: '9-A', guardian: 'Venkatesh Iyer', gender: 'Female', fee: 'Paid' },
      { name: 'Vihaan Verma', email: 'vihaan.verma@school.in', roll: '1005', class: '9-B', guardian: 'Alok Verma', gender: 'Male', fee: 'Paid' },
      { name: 'Riya Gupta', email: 'riya.gupta@school.in', roll: '1006', class: '8-A', guardian: 'Sanjay Gupta', gender: 'Female', fee: 'Pending' },
    ];

    try {
      for (const ds of demoStudents) {
        const emailExists = rawStudents.some((s: any) => s.email === ds.email);
        if (emailExists) continue;

        await api.post('/students', {
          name: ds.name,
          email: ds.email,
          password: 'Student@123',
          schoolId: schoolId,
          status: 'Active',
          phone: '+91 99999 11111',
          settings: {
            rollNumber: ds.roll,
            className: ds.class,
            guardianName: ds.guardian,
            dob: '2011-04-12',
            gender: ds.gender,
            bloodGroup: 'B+',
            feeStatus: ds.fee,
            attendanceRate: Math.floor(88 + Math.random() * 12),
          },
        });
      }
      mutate();
    } catch (err: any) {
      alert('Failed to seed demo database: ' + err.message);
    }
  };

  return (
    <SchoolLayout title="Students Directory" subtitle="Manage, filter and add student admissions for your school.">
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Helper Seed Banner if empty */}
        {rawStudents.length === 0 && !isLoading && (
          <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 dark:border-green-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                Get Started with Demo Admissions Data
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                It looks like there are no student accounts registered in your school yet. Click the button to automatically generate 6 standard demo student profiles for your active classes.
              </p>
            </div>
            <button
              onClick={seedDemoStudents}
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all flex-shrink-0 shadow-md shadow-green-500/10"
            >
              <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-3-3m3 3l3-3" className="w-4 h-4" />
              Populate Demo Data
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Enrolled', value: stats.total, color: 'text-indigo-650 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Attendance (Avg)', value: `${stats.avgAttendance}%`, color: 'text-green-650 dark:text-green-400', bg: 'bg-green-500/10' },
            { label: 'Fees Paid', value: stats.paid, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Fees Pending', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Fees Overdue', value: stats.overdue, color: 'text-rose-650 dark:text-rose-450', bg: 'bg-rose-500/10' },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${item.bg} ${item.color}`}>
                #
              </span>
              <div>
                <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid and Table operations */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/70">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students, roll no, guardian..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              {/* Class filter */}
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Classes</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>

              {/* Status filter */}
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
              className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-green-500/10 transition-transform hover:-translate-y-0.5"
            >
              <Icon d={ICONS.users} className="w-4 h-4" />
              Enroll Student
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1c1f2e] border-b border-slate-105 dark:border-[#2b2e3b]">
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Roll No</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-sans">Student Name</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Class</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-sans">Guardian</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Attendance</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Fees</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm text-slate-550">Loading student directory...</td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Icon d={ICONS.users} className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500">No students found</p>
                      <p className="text-xs text-slate-455 mt-1">Try resetting filters or adding a student card</p>
                    </td>
                  </tr>
                ) : filteredStudents.map((student: any) => {
                  const settings = student.settings || {};
                  const initialName = student.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  let feeBadge = 'bg-slate-105 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
                  if (settings.feeStatus === 'Paid') feeBadge = 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
                  else if (settings.feeStatus === 'Pending') feeBadge = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
                  else if (settings.feeStatus === 'Overdue') feeBadge = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350';

                  return (
                    <tr key={student.id || student._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-xs font-bold text-indigo-650 dark:text-indigo-400">
                        #{settings.rollNumber || '—'}
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                            {initialName || 'ST'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Class {settings.className || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {settings.guardianName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-12 bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${settings.attendanceRate >= 90 ? 'bg-green-550' : 'bg-amber-500'}`}
                              style={{ width: `${settings.attendanceRate || 95}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {settings.attendanceRate || 95}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${feeBadge}`}>
                          {settings.feeStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          student.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {student.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Edit student"
                            onClick={() => handleEditOpen(student)}
                            className="w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"
                          >
                            <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete student"
                            onClick={() => handleDelete(student.id || student._id)}
                            className="w-7 h-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/25 flex items-center justify-center transition-all"
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
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Modify Student Admission' : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-405 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Student Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student's full name"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Email Address (Optional)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@school.com"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
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
                      placeholder="Student@123"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                )}

                {/* Roll No */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Class Grade */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Class / Grade</label>
                  <select
                    value={formData.className}
                    onChange={e => setFormData({ ...formData, className: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="10-A">Class 10-A</option>
                    <option value="10-B">Class 10-B</option>
                    <option value="9-A">Class 9-A</option>
                    <option value="9-B">Class 9-B</option>
                    <option value="8-A">Class 8-A</option>
                    <option value="11-Sci">Class 11 Science</option>
                    <option value="12-Comm">Class 12 Commerce</option>
                  </select>
                </div>

                {/* Guardian Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Guardian Name</label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Parent/Guardian Name"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 99999 00000"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                {/* DOB & Gender */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-[#1a1d27]/0 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Fees & status */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Fee Status</label>
                  <select
                    value={formData.feeStatus}
                    onChange={e => setFormData({ ...formData, feeStatus: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Admission Status</label>
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
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-650 dark:text-slate-350 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10 transition-colors"
                >
                  Save Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
