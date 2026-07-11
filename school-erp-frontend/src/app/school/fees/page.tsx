'use client';

import { useState, useMemo } from 'react';
import SchoolLayout from '@/components/school/SchoolLayout';
import { Icon, ICONS } from '@/components/dashboard/Sidebar';
import { api } from '@/lib/api';
import useSWR from 'swr';

interface PaymentLog {
  id: string;
  studentName: string;
  className: string;
  amount: number;
  mode: string;
  date: string;
}

const fetcher = (url: string) => api.get(url);

export default function SchoolFeesPage() {
  const { data: studentsData, mutate } = useSWR('/students?limit=250', fetcher, {
    revalidateOnFocus: false,
  });

  const students = studentsData?.users || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form payment log state
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([
    { id: '1', studentName: 'Aarav Sharma', className: '10-A', amount: 15000, mode: 'Online UPI', date: '2026-07-08' },
    { id: '2', studentName: 'Ananya Iyer', className: '9-A', amount: 15400, mode: 'Cash', date: '2026-07-09' },
    { id: '3', studentName: 'Vihaan Verma', className: '9-B', amount: 12500, mode: 'Card', date: '2026-07-10' },
  ]);

  const [paymentAmount, setPaymentAmount] = useState(12000);
  const [paymentMode, setPaymentMode] = useState('Online UPI');
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);

  // Classes list
  const classesList = useMemo(() => {
    const list = new Set<string>();
    students.forEach((s: any) => {
      const cls = s.settings?.className;
      if (cls) list.add(cls);
    });
    if (list.size === 0) return ['10-A', '10-B', '9-A', '9-B', '8-A'];
    return Array.from(list);
  }, [students]);

  // Calculations
  const stats = useMemo(() => {
    const totalCount = students.length;
    const paidCount = students.filter((s: any) => s.settings?.feeStatus === 'Paid').length;
    const pendingCount = students.filter((s: any) => s.settings?.feeStatus === 'Pending').length;
    const overdueCount = students.filter((s: any) => s.settings?.feeStatus === 'Overdue').length;

    // Financial values
    const ratePerStudent = 12000;
    const targetCollection = totalCount * ratePerStudent;
    const collectedCash = paidCount * ratePerStudent;
    const remainingCash = (pendingCount + overdueCount) * ratePerStudent;

    return { totalCount, paidCount, pendingCount, overdueCount, targetCollection, collectedCash, remainingCash };
  }, [students]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((student: any) => {
      const settings = student.settings || {};
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (settings.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === 'All' || settings.className === selectedClass;
      const matchesStatus = selectedStatus === 'All' || settings.feeStatus === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Handle pay opening
  const handlePayOpen = (student: any) => {
    setSelectedStudent(student);
    setPaymentAmount(12000);
    setPaymentMode('Online UPI');
    setIsModalOpen(true);
    setIsSuccessAlert(false);
  };

  // Submit Payment record
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const studentId = selectedStudent.id || selectedStudent._id;
      
      // Update fee status to 'Paid' in student's schema settings
      await api.put(`/students/${studentId}`, {
        settings: {
          ...selectedStudent.settings,
          feeStatus: 'Paid',
        },
      });

      // Log the payment
      const newLog: PaymentLog = {
        id: String(Date.now()),
        studentName: selectedStudent.name,
        className: selectedStudent.settings?.className || 'General',
        amount: paymentAmount,
        mode: paymentMode,
        date: new Date().toISOString().split('T')[0],
      };

      setPaymentLogs(prev => [newLog, ...prev]);
      setIsSuccessAlert(true);
      mutate();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);

    } catch (err: any) {
      alert('Error updating payment: ' + err.message);
    }
  };

  return (
    <SchoolLayout title="Fees Ledger & Payments" subtitle="Log term payments, collect dues, and track school financial targets.">
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Metric panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Estimated Term Fees', value: `₹${stats.targetCollection.toLocaleString()}`, color: 'text-indigo-650 dark:text-indigo-400', pct: 100 },
            { label: 'Collected to date', value: `₹${stats.collectedCash.toLocaleString()}`, color: 'text-green-650 dark:text-green-400', pct: stats.targetCollection ? Math.round((stats.collectedCash / stats.targetCollection) * 100) : 85 },
            { label: 'Outstanding Collections', value: `₹${stats.remainingCash.toLocaleString()}`, color: 'text-rose-650 dark:text-rose-450', pct: stats.targetCollection ? Math.round((stats.remainingCash / stats.targetCollection) * 100) : 15 },
          ].map(it => (
            <div key={it.label} className="bg-white dark:bg-[#1a1d27] border border-slate-105 dark:border-[#2a2d3a] rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{it.label}</p>
              <div className="flex items-baseline justify-between">
                <p className={`text-2xl font-black ${it.color}`}>{it.value}</p>
                <span className="text-xs font-bold text-slate-500">{it.pct}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <span className={`block h-full rounded-full ${
                  it.label.includes('Collected') ? 'bg-green-550' : it.label.includes('Outstanding') ? 'bg-rose-500' : 'bg-indigo-500'
                }`} style={{ width: `${it.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Double Column Split */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Left panel: student fee list */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-slate-100 dark:border-[#2a2d3a] flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#1a1d27]/70">
              
              <div className="flex flex-wrap gap-2.5 items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Icon d={ICONS.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-xs focus:outline-none focus:ring-1 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                  />
                </div>

                {/* Class selector */}
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="All">All Grades (All)</option>
                  {classesList.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>

                {/* Status Selector */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#1c1f2e] border-b border-slate-100 dark:border-[#2b2e3b]">
                    <th className="px-5 py-3 text-[10px] font-extrabold uppercase text-slate-500">Student Name</th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-slate-500">Roll No</th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-slate-500">Class</th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-slate-500 font-sans">Term Amount</th>
                    <th className="px-4 py-3 text-[10px] font-extrabold uppercase text-slate-500">Fee Status</th>
                    <th className="px-5 py-3 text-right text-[10px] font-extrabold uppercase text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2a2d3a]">
                  {filteredStudents.map(( student: any ) => {
                    const settings = student.settings || {};
                    const initialName = student.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    let badge = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                    if (settings.feeStatus === 'Paid') badge = 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300';
                    else if (settings.feeStatus === 'Pending') badge = 'bg-amber-100 text-amber-705 dark:bg-amber-950/40 dark:text-amber-300';
                    else if (settings.feeStatus === 'Overdue') badge = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350';

                    return (
                      <tr key={student.id || student._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                        <td className="px-5 py-3 min-w-[180px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {initialName || 'ST'}
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{student.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-650 dark:text-slate-400">
                          #{settings.rollNumber || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-205">
                          Grade {settings.className || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                          ₹12,000
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badge}`}>
                            {settings.feeStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {settings.feeStatus !== 'Paid' ? (
                            <button
                              type="button"
                              onClick={() => handlePayOpen(student)}
                              className="h-7 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] shadow-sm hover:shadow transition-all"
                            >
                              Record pay
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="h-7 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] text-slate-400 dark:text-slate-600 font-bold text-[10px] cursor-not-allowed"
                            >
                              Paid ✔
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-xs text-slate-400">No students matching criteria found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Right panel: Recent log entries */}
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl shadow-sm p-4 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-3 border-b border-slate-50 dark:border-slate-850">
              <Icon d={ICONS.payments} className="w-4 h-4 text-slate-400" />
              Recent Payment Log
            </h3>
            
            <div className="space-y-3.5">
              {paymentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5 py-1 text-xs">
                  <span className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px] mt-0.5">
                    ₹
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-850 dark:text-slate-100 truncate">{log.studentName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-505">Class {log.className} via {log.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">₹{log.amount.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-[#1c1f2e] border border-slate-100 dark:border-[#2a2d3a] rounded-xl p-3.5 text-xs text-slate-500 leading-normal mt-4">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Receipt Generations</p>
              Simulate receipts automatically online when logging payments to keep parents notified.
            </div>

          </div>

        </div>

      </div>

      {/* Record Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1d27] border border-slate-100 dark:border-[#2a2d3a] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#2a2d3a] flex items-center justify-between bg-slate-50/50 dark:bg-[#1c1f2e]">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                Log Student Fee Payment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-405 hover:text-slate-900 dark:hover:text-white">
                <Icon d={ICONS.chevronDown} className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              
              {isSuccessAlert && (
                <div className="bg-green-50 border border-green-200 text-green-700 font-bold p-3 text-xs rounded-xl flex items-center gap-1.5">
                  ✔ Payment Recorded Successfully!
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Student Name</label>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedStudent.name}</div>
                <p className="text-[10px] text-slate-400">Roll No: {selectedStudent.settings?.rollNumber || '—'} | Class: {selectedStudent.settings?.className}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Amount Due</label>
                <div className="font-black text-lg text-indigo-650 dark:text-indigo-400">₹12,000</div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Amount Paid (INR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-slate-805 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-[#2a2d3a] bg-white dark:bg-[#1a1d27] text-sm focus:outline-none cursor-pointer text-slate-800 dark:text-white"
                >
                  <option value="Online UPI">Online UPI / GPay</option>
                  <option value="Cash">Cash Counter</option>
                  <option value="Bank Net Banking">Bank Transfer / NEFT</option>
                  <option value="Card">Terminal Credit/Debit Card</option>
                </select>
              </div>

              <div className="border-t border-slate-100 dark:border-[#2a2d3a] pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#2a2d3a] text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-500/10 transition-colors"
                >
                  Record Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </SchoolLayout>
  );
}
