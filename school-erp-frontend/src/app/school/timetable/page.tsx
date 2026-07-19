'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface TimetableItem {
  id: string;
  className: string;
  dayOfWeek: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  roomNumber: string;
}

const fetcher = (url: string) => api.get(url);

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STANDARD_PERIODS = [
  { start: '08:30 AM', end: '09:15 AM', label: 'Period 1' },
  { start: '09:15 AM', end: '10:00 AM', label: 'Period 2' },
  { start: '10:15 AM', end: '11:00 AM', label: 'Period 3' },
  { start: '11:00 AM', end: '11:45 AM', label: 'Period 4' },
  { start: '12:30 PM', end: '01:15 PM', label: 'Period 5' },
  { start: '01:15 PM', end: '02:00 PM', label: 'Period 6' },
];

export default function SchoolTimetablePage() {
  const { data: timetableList, error: timetableError, mutate: mutateTimetable } = useSWR('/timetable', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: classesData } = useSWR('/classes', fetcher, { revalidateOnFocus: false });
  const { data: teachersData } = useSWR('/users?role=Teacher&limit=100', fetcher, { revalidateOnFocus: false });
  const { data: subjectsData } = useSWR('/subjects', fetcher, { revalidateOnFocus: false });

  const rawTimetable = timetableList || [];
  const classes = classesData || [];
  const teachers = teachersData?.users || [];
  const subjects = subjectsData || [];
  const isLoading = !timetableList && !timetableError;

  // Active filter state
  const [activeClass, setActiveClass] = useState('10-A');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    subjectName: '',
    startTime: '08:30 AM',
    endTime: '09:15 AM',
    teacherName: '',
    roomNumber: 'Room 301',
  });

  // Calculate unique classes options
  const classesOptions = useMemo(() => {
    const list = new Set<string>();
    classes.forEach((c: any) => {
      if (c.name) list.add(c.name);
    });
    if (list.size === 0) {
      return ['10-A', '10-B', '9-A', '9-B', '8-A'];
    }
    return Array.from(list);
  }, [classes]);

  // Sync selected base class on load
  useMemo(() => {
    if (classesOptions.length > 0 && !activeClass) {
      setActiveClass(classesOptions[0]);
    }
  }, [classesOptions, activeClass]);

  // Group timetable slots by (day, time) key
  const timetableMatrix = useMemo(() => {
    const matrix: Record<string, TimetableItem[]> = {};
    rawTimetable.forEach((slot: TimetableItem) => {
      if (slot.className === activeClass) {
        const key = `${slot.dayOfWeek}-${slot.startTime}`;
        if (!matrix[key]) {
          matrix[key] = [];
        }
        matrix[key].push(slot);
      }
    });
    return matrix;
  }, [rawTimetable, activeClass]);

  // Open Handlers
  const handleAddOpen = (day?: string, period?: any) => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      dayOfWeek: day || 'Monday',
      subjectName: subjects[0]?.name || 'Mathematics',
      startTime: period?.start || '08:30 AM',
      endTime: period?.end || '09:15 AM',
      teacherName: teachers[0]?.name || 'Dr. Vivek Dev',
      roomNumber: 'Room 301',
    });
    setIsModalOpen(true);
  };

  const handleEditOpen = (slot: TimetableItem) => {
    setIsEditing(true);
    setCurrentId(slot.id);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      subjectName: slot.subjectName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      teacherName: slot.teacherName,
      roomNumber: slot.roomNumber,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        className: activeClass,
        dayOfWeek: formData.dayOfWeek,
        subjectName: formData.subjectName,
        startTime: formData.startTime,
        endTime: formData.endTime,
        teacherName: formData.teacherName,
        roomNumber: formData.roomNumber,
      };

      if (isEditing && currentId) {
        await api.put(`/timetable/${currentId}`, payload);
      } else {
        await api.post('/timetable', payload);
      }
      mutateTimetable();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error saving time slot');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule slot?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      mutateTimetable();
    } catch (err: any) {
      alert(err.message || 'Error deleting slot');
    }
  };

  // Seed standard demo timetable values
  const seedDemoTimetable = async () => {
    const slots = [
      // Monday
      { day: 'Monday', start: '08:30 AM', end: '09:15 AM', sub: 'Mathematics', teacher: 'Dr. Vivek Dev', room: 'Room 301' },
      { day: 'Monday', start: '09:15 AM', end: '10:00 AM', sub: 'English Literature', teacher: 'Meera Sen', room: 'Room 301' },
      { day: 'Monday', start: '10:15 AM', end: '11:00 AM', sub: 'Science Lab', teacher: 'Sanjay Dutt', room: 'Lab A' },
      { day: 'Monday', start: '11:00 AM', end: '11:45 AM', sub: 'World History', teacher: 'Aparna Nair', room: 'Room 301' },
      // Tuesday
      { day: 'Tuesday', start: '08:30 AM', end: '09:15 AM', sub: 'World History', teacher: 'Aparna Nair', room: 'Room 301' },
      { day: 'Tuesday', start: '09:15 AM', end: '10:00 AM', sub: 'Mathematics', teacher: 'Dr. Vivek Dev', room: 'Room 301' },
      { day: 'Tuesday', start: '10:15 AM', end: '11:00 AM', sub: 'English Literature', teacher: 'Meera Sen', room: 'Room 301' },
      { day: 'Tuesday', start: '01:15 PM', end: '02:00 PM', sub: 'Computer Applications', teacher: 'Rohan Deshmukh', room: 'Computer Lab' },
      // Wednesday
      { day: 'Wednesday', start: '08:30 AM', end: '09:15 AM', sub: 'Mathematics', teacher: 'Dr. Vivek Dev', room: 'Room 301' },
      { day: 'Wednesday', start: '11:00 AM', end: '11:45 AM', sub: 'Science Lab', teacher: 'Sanjay Dutt', room: 'Lab A' },
      // Thursday
      { day: 'Thursday', start: '09:15 AM', end: '10:00 AM', sub: 'English Literature', teacher: 'Meera Sen', room: 'Room 301' },
      { day: 'Thursday', start: '12:30 PM', end: '01:15 PM', sub: 'Geography', teacher: 'Aparna Nair', room: 'Room 301' },
      // Friday
      { day: 'Friday', start: '08:30 AM', end: '09:15 AM', sub: 'Mathematics', teacher: 'Dr. Vivek Dev', room: 'Room 301' },
      { day: 'Friday', start: '10:15 AM', end: '11:00 AM', sub: 'Chemistry Lab', teacher: 'Sanjay Dutt', room: 'Lab B' },
    ];

    try {
      for (const s of slots) {
        // avoid duplication
        const exists = rawTimetable.some(
          (t: TimetableItem) =>
            t.className === activeClass &&
            t.dayOfWeek === s.day &&
            t.startTime === s.start
        );
        if (exists) continue;

        await api.post('/timetable', {
          className: activeClass,
          dayOfWeek: s.day,
          subjectName: s.sub,
          startTime: s.start,
          endTime: s.end,
          teacherName: s.teacher,
          roomNumber: s.room,
        });
      }
      mutateTimetable();
    } catch (err: any) {
      alert('Failed to seed timetable: ' + err.message);
    }
  };

  return (
    <SchoolLayout title="Academic Timetable" subtitle="Manage scheduled periods, class locations, and lecturer rotas.">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Toolbar & Selector */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-105 dark:border-[#2a2d3a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Stream:</span>
            <div className="flex bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl gap-1">
              {classesOptions.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveClass(c)}
                  className={`h-9 px-4 rounded-lg text-xs font-bold transition-all ${activeClass === c
                    ? 'bg-white dark:bg-[#151722] text-green-700 dark:text-green-400 shadow-sm border border-slate-100 dark:border-slate-800/50'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  Class {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={seedDemoTimetable}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-700 dark:text-slate-350 bg-white dark:bg-[#1a1d27] hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold flex items-center justify-center gap-2"
            >
              ⚡ Load Sample Week
            </button>
            <button
              onClick={() => handleAddOpen()}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-green-500/10"
            >
              <Icon d="M3 13h18M12 4v18" className="w-4 h-4" />
              Schedule Slot
            </button>
          </div>
        </div>

        {/* Weekly Grid Representation */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-w-[900px]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-[#1c1f2e] border-b border-slate-105 dark:border-[#2a2d3a]">
                  <th className="px-4 py-4 w-40 text-xs font-bold text-left text-slate-500 uppercase tracking-widest pl-6">Period / Hour</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="px-4 py-4 text-xs font-extrabold text-slate-655 dark:text-slate-300 uppercase">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-slate-400 font-semibold text-sm">
                      Retrieving schedule configuration...
                    </td>
                  </tr>
                ) : STANDARD_PERIODS.map(period => (
                  <tr key={period.label} className="hover:bg-slate-50/20 dark:hover:bg-white/[0.01]">
                    {/* Period details */}
                    <td className="px-4 py-6 text-left pl-6 border-r border-slate-50 dark:border-slate-800/50">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{period.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{period.start} - {period.end}</p>
                    </td>

                    {/* Week Slots */}
                    {DAYS_OF_WEEK.map(day => {
                      const key = `${day}-${period.start}`;
                      const slots = timetableMatrix[key] || [];

                      return (
                        <td
                          key={day}
                          className="px-2 py-3 border-r last:border-0 border-slate-50 dark:border-slate-800/40 relative group"
                        >
                          {slots.length === 0 ? (
                            <button
                              onClick={() => handleAddOpen(day, period)}
                              className="w-full py-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-green-500/50 hover:bg-green-500/[0.02] flex items-center justify-center text-[10px] font-bold text-slate-350 hover:text-green-600 transition-all opacity-0 group-hover:opacity-100"
                            >
                              + Assign
                            </button>
                          ) : (
                            <div className="space-y-1.5 align-middle">
                              {slots.map(slot => (
                                <div
                                  key={slot.id}
                                  className="mx-auto max-w-[130px] rounded-xl p-3 bg-green-500/5 border border-green-500/10 dark:border-green-500/20 group/slot text-left hover:shadow-sm transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 truncate max-w-[80px]">
                                      {slot.subjectName}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleEditOpen(slot)}
                                        className="text-slate-450 hover:text-green-700 dark:hover:text-green-400"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handleDelete(slot.id)}
                                        className="text-slate-450 hover:text-red-650"
                                      >
                                        ❌
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[110px]">
                                    🧑‍🏫 {slot.teacherName}
                                  </p>
                                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                                    📍 {slot.roomNumber}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Tip */}
        <div className="bg-[#f0f9ff]/50 dark:bg-sky-500/[0.02] border border-sky-500/10 rounded-2xl p-4 flex gap-3 text-xs text-slate-500 dark:text-slate-400 leading-normal">
          <span className="text-base text-sky-500">ℹ️</span>
          <div>
            <p className="font-extrabold text-sky-700 dark:text-sky-400 mb-0.5">Room conflict checkers</p>
            The system resolves teacher rotas and venue conflicts. Changing schedule cells will sync timetables instantly to Parent/Student mobile views.
          </div>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-805 dark:text-slate-100">
                {isEditing ? 'Modify Schedule Block' : 'Schedule Timetable Slot'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-205 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-3.5">

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Day of the Week</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white"
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Class Stream</label>
                    <input
                      type="text"
                      disabled
                      value={`Class ${activeClass}`}
                      className="w-full h-10 px-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-sm text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-505 uppercase">Start Time</label>
                    <select
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white"
                    >
                      {STANDARD_PERIODS.map(p => <option key={p.start} value={p.start}>{p.start}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                    <select
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white"
                    >
                      {STANDARD_PERIODS.map(p => <option key={p.end} value={p.end}>{p.end}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Subject Name</label>
                  <select
                    value={formData.subjectName}
                    onChange={e => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-220 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white"
                  >
                    {subjects.map((sub: any) => <option key={sub.id || sub._id} value={sub.name}>{sub.name}</option>)}
                    {subjects.length === 0 && (
                      <>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English Literature">English Literature</option>
                        <option value="Science Lab">Science Lab</option>
                        <option value="World History">World History</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Class Teacher / Teacher</label>
                  <select
                    value={formData.teacherName}
                    onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-800 dark:text-white"
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

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Room Number / Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                  />
                </div>

              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10"
                >
                  Confirm Schedule
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
