'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface ClassItem {
  id: string;
  name: string;
  roomNumber: string;
  teacherId: string;
  teacherName: string;
  subjects: string[];
}

const fetcher = (url: string) => api.get(url);

export default function SchoolClassesPage() {
  // Fetch teachers and students to build dynamic relationships!
  const { data: teachersData } = useSWR('/users?role=Teacher&limit=100', fetcher, { revalidateOnFocus: false });
  const { data: studentsData } = useSWR('/students?limit=250', fetcher, { revalidateOnFocus: false });

  const teachers = teachersData?.users || [];
  const students = studentsData?.users || [];

  // Default hardcoded classes layout which will resolve dynamically
  const [classesList, setClassesList] = useState<ClassItem[]>([
    { id: '1', name: '10-A', roomNumber: 'Room 301', teacherId: '', teacherName: 'Dr. Vivek Dev', subjects: ['Mathematics', 'Science', 'English'] },
    { id: '2', name: '10-B', roomNumber: 'Room 302', teacherId: '', teacherName: 'Meera Sen', subjects: ['Mathematics', 'English', 'History'] },
    { id: '3', name: '9-A', roomNumber: 'Room 201', teacherId: '', teacherName: 'Sanjay Dutt', subjects: ['Physics', 'Chemistry', 'Biology'] },
    { id: '4', name: '9-B', roomNumber: 'Room 202', teacherId: '', teacherName: 'Aparna Nair', subjects: ['English', 'History', 'Mathematics'] },
    { id: '5', name: '8-A', roomNumber: 'Room 101', teacherId: '', teacherName: 'Rohan Deshmukh', subjects: ['Science', 'Computer Science', 'English'] },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    teacherName: '',
    subjectsString: '',
  });

  // Calculate dynamic stats per class (Students count)
  const classStats = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s: any) => {
      const cls = s.settings?.className;
      if (cls) {
        counts[cls] = (counts[cls] || 0) + 1;
      }
    });
    return counts;
  }, [students]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classesList.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classesList, searchQuery]);

  // Open Handlers
  const handleAddOpen = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      roomNumber: `Room ${Math.floor(100 + Math.random() * 400)}`,
      teacherName: teachers[0]?.name || 'Not Assigned',
      subjectsString: 'Mathematics, Science, English',
    });
    setIsModalOpen(true);
  };

  const handleEditOpen = (cls: ClassItem) => {
    setIsEditing(true);
    setCurrentId(cls.id);
    setFormData({
      name: cls.name,
      roomNumber: cls.roomNumber,
      teacherName: cls.teacherName,
      subjectsString: cls.subjects.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = formData.subjectsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (isEditing && currentId) {
      setClassesList(prev =>
        prev.map(c =>
          c.id === currentId
            ? { ...c, name: formData.name, roomNumber: formData.roomNumber, teacherName: formData.teacherName, subjects }
            : c
        )
      );
    } else {
      const newClass: ClassItem = {
        id: String(Date.now()),
        name: formData.name,
        roomNumber: formData.roomNumber,
        teacherId: '',
        teacherName: formData.teacherName,
        subjects,
      };
      setClassesList(prev => [...prev, newClass]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this class track?')) return;
    setClassesList(prev => prev.filter(c => c.id !== id));
    if (selectedClass?.id === id) {
      setSelectedClass(null);
    }
  };

  // Get active student list for a class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s: any) => s.settings?.className === selectedClass.name);
  }, [selectedClass, students]);

  return (
    <SchoolLayout title="Classes & Sections" subtitle="Track classrooms, class mentors/teachers, subjects, and student distribution.">
      <div className="p-4 sm:p-6 space-y-6">

        {/* Split grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* Left panel: List / Grid of Classes */}
          <div className="xl:col-span-2 space-y-4">

            {/* Toolbar */}
            <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="relative w-full sm:w-64">
                <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              <button
                onClick={handleAddOpen}
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-green-500/10 transition-colors"
              >
                <Icon d={ICONS.dashboard} className="w-4 h-4" />
                Define Class
              </button>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClasses.map(cls => {
                const count = classStats[cls.name] || 0;
                const isSelected = selectedClass?.id === cls.id;

                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`bg-white dark:bg-[#1a1d27] border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-44 shadow-sm hover:shadow-md ${isSelected ? 'border-green-600 ring-2 ring-green-500/10' : 'border-slate-100 dark:border-[#2a2d3a]'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">Class {cls.name}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {cls.roomNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-450 dark:text-slate-505 mt-2 flex items-center gap-1.5 font-semibold">
                        <Icon d={ICONS.user} className="w-3.5 h-3.5 text-slate-400" />
                        Mentor: <span className="text-slate-700 dark:text-slate-300">{cls.teacherName}</span>
                      </p>
                    </div>

                    <div className="border-t border-slate-50 dark:border-slate-800/60 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black text-green-650 dark:text-green-400">{count}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Students Enrolled</p>
                      </div>
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditOpen(cls)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Icon d={ICONS.edit} className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center text-slate-400 hover:text-red-655"
                        >
                          <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredClasses.length === 0 && (
                <div className="col-span-2 bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl py-12 text-center">
                  <Icon d={ICONS.schools} className="w-10 h-10 text-slate-205 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No classes found</p>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Class rosters & details */}
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm p-5 space-y-5 h-[530px] flex flex-col justify-between overflow-hidden">

            {selectedClass ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Roster Overview: {selectedClass.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Class Teacher: <span className="font-bold text-slate-755 dark:text-slate-300">{selectedClass.teacherName}</span></p>

                  {/* Subjects badges */}
                  <div className="flex flex-wrap gap-1 mt-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    {selectedClass.subjects.map(s => (
                      <span key={s} className="text-[10px] font-bold px-2 py-0.5 roundedbg rounded-md bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Students list */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                  <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Students ({classStudents.length})</h4>
                  {classStudents.map((s: any, idx: any) => (
                    <div key={s.id || s._id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">#{s.settings?.rollNumber || (idx + 1)}</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-205">{s.name}</p>
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-2 rounded-full ${s.settings?.attendanceRate >= 93 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                        {s.settings?.attendanceRate ?? 95}% Attd
                      </span>
                    </div>
                  ))}

                  {classStudents.length === 0 && (
                    <p className="text-xs text-slate-400 py-6 text-center">No students registered in this class.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Icon d={ICONS.schools} className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-500">No class selected</p>
                <p className="text-xs text-slate-400 max-w-[200px] mt-1 mx-auto">Click on any class card to view subject details, mentors and class lists.</p>
              </div>
            )}

            <div className="rounded-xl border border-slate-100 bg-[#f5fdf4]/50 dark:bg-[#1a1d27]/70 p-3.5 text-xs text-slate-500 leading-normal flex-shrink-0">
              <p className="font-bold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-1">
                💡 Integration Tip
              </p>
              Students and teachers will map to these class names automatically when their school directory profile is updated.
            </div>

          </div>

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Modify Class Parameters' : 'Create Class Structure'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Class Name / Code</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 10-A, 11-Science, 8-B"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Room Number / Location</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. Room 301, Lab B"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Class Mentor / Teacher</label>
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

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Subjects Taught (comma separated)</label>
                <input
                  type="text"
                  required
                  value={formData.subjectsString}
                  onChange={e => setFormData({ ...formData, subjectsString: e.target.value })}
                  placeholder="Mathematics, English, Physics"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-800 dark:text-white"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10 transition-colors"
                >
                  Save Class
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
