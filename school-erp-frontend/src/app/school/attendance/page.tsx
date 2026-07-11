'use client';

import { useState, useMemo, useEffect } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface AttendanceRecord {
  studentId: string;
  name: string;
  rollNumber: string;
  status: 'Present' | 'Absent' | 'Late';
}

const fetcher = (url: string) => api.get(url);

export default function SchoolAttendancePage() {
  const { data: studentsData, mutate } = useSWR('/students?limit=250', fetcher, {
    revalidateOnFocus: false,
  });

  const students = studentsData?.users || [];

  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Calculate unique classes
  const classesList = useMemo(() => {
    const list = new Set<string>();
    students.forEach((s: any) => {
      const cls = s.settings?.className;
      if (cls) list.add(cls);
    });
    if (list.size === 0) return ['10-A', '10-B', '9-A', '9-B', '8-A'];
    return Array.from(list);
  }, [students]);

  // Load students of selected class
  const classStudents = useMemo(() => {
    return students.filter((s: any) => s.settings?.className === selectedClass);
  }, [students, selectedClass]);

  // State to hold local attendance updates
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Load existing logs or initialize records when class or date changes
  useEffect(() => {
    let active = true;
    async function loadLogs() {
      try {
        const logs = await api.get(`/attendance?date=${selectedDate}&className=${selectedClass}`);
        if (!active) return;
        
        if (logs && logs.length > 0) {
          const loaded: Record<string, 'Present' | 'Absent' | 'Late'> = {};
          logs.forEach((log: any) => {
            loaded[log.studentId] = log.status as any;
          });
          
          const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
          classStudents.forEach((student: any) => {
            const id = student.id || student._id;
            initial[id] = loaded[id] || 'Present';
          });
          setAttendanceRecords(initial);
        } else {
          const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
          classStudents.forEach((student: any) => {
            initial[student.id || student._id] = 'Present';
          });
          setAttendanceRecords(initial);
        }
      } catch (err) {
        console.error('Error loading attendance logs', err);
        // Fallback to present
        const initial: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        classStudents.forEach((student: any) => {
          initial[student.id || student._id] = 'Present';
        });
        if (active) setAttendanceRecords(initial);
      }
    }

    if (classStudents.length > 0) {
      loadLogs();
    } else {
      setAttendanceRecords({});
    }
    
    setIsSavedSuccessfully(false);
    setSelectedStudents(new Set());

    return () => {
      active = false;
    };
  }, [classStudents, selectedDate, selectedClass]);

  // Handle individual change
  const handleStatusChange = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: status,
    }));
    setIsSavedSuccessfully(false);
  };

  // Selection helpers
  const toggleStudentSelect = (id: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = classStudents.length > 0 && classStudents.every((s: any) => selectedStudents.has(s.id || s._id));
    if (allSelected) {
      setSelectedStudents(new Set());
    } else {
      const next = new Set<string>();
      classStudents.forEach((s: any) => next.add(s.id || s._id));
      setSelectedStudents(next);
    }
  };

  const markSelected = (status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords(prev => {
      const next = { ...prev };
      selectedStudents.forEach(id => {
        next[id] = status;
      });
      return next;
    });
    setIsSavedSuccessfully(false);
  };

  // Mark all helpers
  const markAll = (status: 'Present' | 'Absent' | 'Late') => {
    const updated = { ...attendanceRecords };
    classStudents.forEach((s: any) => {
      updated[s.id || s._id] = status;
    });
    setAttendanceRecords(updated);
  };

  // Submit selected students attendance
  const handleSubmitSelected = async () => {
    if (selectedStudents.size === 0) return;
    try {
      setIsSavedSuccessfully(true);
      const records = Array.from(selectedStudents).map(id => ({
        studentId: id,
        status: attendanceRecords[id] || 'Present'
      }));

      await api.post('/attendance/submit', {
        date: selectedDate,
        records
      });

      setTimeout(() => {
        setIsSavedSuccessfully(false);
      }, 4000);
      setSelectedStudents(new Set());
      mutate();
    } catch (err: any) {
      alert('Failed to update attendance for selected students on server: ' + err.message);
    }
  };

  // Submit attendance to backend for everyone 
  const handleSubmit = async () => {
    try {
      setIsSavedSuccessfully(true);
      const records = classStudents.map((s: any) => {
        const id = s.id || s._id;
        return {
          studentId: id,
          status: attendanceRecords[id] || 'Present'
        };
      });

      await api.post('/attendance/submit', {
        date: selectedDate,
        records
      });

      setTimeout(() => {
        setIsSavedSuccessfully(false);
      }, 4000);
      mutate();
    } catch (err: any) {
      alert('Failed to update attendance on server: ' + err.message);
    }
  };

  // Stats
  const totals = useMemo(() => {
    const list = Object.values(attendanceRecords);
    const present = list.filter(s => s === 'Present').length;
    const absent = list.filter(s => s === 'Absent').length;
    const late = list.filter(s => s === 'Late').length;
    const rate = list.length ? Math.round((present / list.length) * 100) : 100;

    return { total: list.length, present, absent, late, rate };
  }, [attendanceRecords]);

  return (
    <SchoolLayout title="Mark Daily Attendance" subtitle="Daily presence registry dashboard for schools check-in.">
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Controls Bar */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Class picker */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Class Select</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm text-slate-755 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {classesList.map(cls => <option key={cls} value={cls}>Class {cls}</option>)}
              </select>
            </div>

            {/* Date selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider">Calendar Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="col-span-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none text-slate-705 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Quick options */}
          <div className="flex gap-2">
            <button
              onClick={() => markAll('Present')}
              className="h-9 px-3 rounded-lg border border-green-200 dark:border-green-800 text-green-650 hover:bg-green-50 text-xs font-bold transition-all"
            >
              All Present ✓
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="h-9 px-3 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 text-xs font-bold transition-all"
            >
              All Absent ✗
            </button>
          </div>

        </div>

        {/* Stats view */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Roster Strength', value: totals.total, color: 'text-indigo-650 dark:text-indigo-400', desc: 'Students registered' },
            { label: 'Attending Today', value: totals.present, color: 'text-green-650 dark:text-green-400', desc: 'Marked present' },
            { label: 'Absent Today', value: totals.absent, color: 'text-red-550 dark:text-red-450', desc: 'Not check-in' },
            { label: 'Attendance Rate', value: `${totals.rate}%`, color: 'text-emerald-700 dark:text-emerald-400', desc: 'Status summary' },
          ].map(it => (
            <div key={it.label} className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 shadow-sm">
              <p className={`text-xl font-black ${it.color}`}>{it.value}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{it.label}</p>
              <span className="text-[9px] text-slate-400 mt-1 block">{it.desc}</span>
            </div>
          ))}
        </div>

        {/* Main List */}
        <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
              Registrar Roll-call
            </h3>
            {isSavedSuccessfully && (
              <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200 animate-fade-in animate-out">
                ✔ Attendance saved & synced correctly on server database!
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#2c2e3b]">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={classStudents.length > 0 && classStudents.every((s: any) => selectedStudents.has(s.id || s._id))}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-green-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 w-24">Roll No</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-sans">Name</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Gender</th>
                  <th className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-505 w-64 text-center">Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                {classStudents.map((student: any, idx: number) => {
                  const id = student.id || student._id;
                  const currentStatus = attendanceRecords[id] || 'Present';
                  const roll = student.settings?.rollNumber || String(1001 + idx);
                  const gender = student.settings?.gender || 'Male';

                  return (
                    <tr 
                      key={id} 
                      className={`hover:bg-slate-50/40 dark:hover:bg-white/[0.01] ${
                        selectedStudents.has(id) ? 'bg-green-50/20 dark:bg-green-950/10' : ''
                      }`}
                    >
                      <td className="w-12 px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(id)}
                          onChange={() => toggleStudentSelect(id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 accent-green-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-400">
                        #{roll}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-extrabold text-slate-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {gender}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-center items-center gap-1">
                          
                          {/* Present tag */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, 'Present')}
                            className={`h-8 px-4 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-green-600 text-white shadow-sm shadow-green-500/10'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent tag */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, 'Absent')}
                            className={`h-8 px-4 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-red-650 text-white shadow-sm shadow-red-500/10'
                                : 'bg-slate-50 text-slate-505 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            Absent
                          </button>

                          {/* Late tag */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(id, 'Late')}
                            className={`h-8 px-4 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            Late
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}

                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">No students enrolled in Class {selectedClass}. Go to Directory to enroll students first.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Submit */}
          {classStudents.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-[#2a2d3a] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#1a1d27]/70 font-sans">
              {/* Selected actions */}
              {selectedStudents.size > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
                    {selectedStudents.size} selected:
                  </span>
                  <button
                    type="button"
                    onClick={() => markSelected('Present')}
                    className="h-8 px-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Set Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markSelected('Absent')}
                    className="h-8 px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Set Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => markSelected('Late')}
                    className="h-8 px-3 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Set Late
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitSelected}
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-2 cursor-pointer"
                  >
                    <Icon d={ICONS.check} className="w-3.5 h-3.5 text-blue-200" />
                    Submit Selected ({selectedStudents.size})
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-405 dark:text-slate-500 font-medium">
                  Select students using checkboxes to perform bulk updates or submit selection.
                </span>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-md shadow-green-500/10 transition-transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Icon d={ICONS.check} className="w-4 h-4" />
                Submit Roster
              </button>
            </div>
          )}

        </div>

      </div>
    </SchoolLayout>
  );
}
