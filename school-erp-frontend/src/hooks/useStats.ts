import useSWR from 'swr';
import { api } from '@/lib/api';
import { ICONS } from '@/components/dashboard/Sidebar';

// Best Practice: Define interfaces for expected data
export interface Activity {
  type: string;
  text: string;
  time: string;
  color: string;
}

export interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  counters?: {
    schoolAdmins?: number;
    [key: string]: any;
  };
  recentActivities?: Activity[];
  [key: string]: any;
}

export function useStats() {
  // Best Practice: Use centralized api.fetcher and generic types
  const { data: stats, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/stats/dashboard', 
    api.fetcher, 
    {
      revalidateOnFocus: false,
    }
  );

  if (!stats) return { stats: null, isLoading, isError: error, mutate };

  // Compute derived values for presentation
  const studentsCount = stats.totalStudents || 0;
  const teachersCount = stats.totalTeachers || 0;
  const adminCount = stats.counters?.schoolAdmins || 0;
  const parentsCount = Math.floor(studentsCount * 0.4); 
  const totalUsers = studentsCount + teachersCount + adminCount + parentsCount;

  const dynamicUserDistribution = [
    { role: 'Students', count: studentsCount, percent: totalUsers ? Math.round((studentsCount/totalUsers)*100) : 0, color: 'bg-blue-500' },
    { role: 'Parents',  count: parentsCount,  percent: totalUsers ? Math.round((parentsCount/totalUsers)*100) : 0, color: 'bg-purple-500' },
    { role: 'Teachers', count: teachersCount, percent: totalUsers ? Math.round((teachersCount/totalUsers)*100) : 0, color: 'bg-emerald-500' },
    { role: 'Admins',   count: adminCount,    percent: totalUsers ? Math.round((adminCount/totalUsers)*100) : 0, color: 'bg-orange-500' },
  ];

  let dynamicActivities = (stats.recentActivities || []).map((act, i) => ({
    id: i + 1,
    title: act.type,
    desc: act.text,
    time: new Date(act.time).toLocaleString(),
    icon: ICONS.schools,
    color: `text-${act.color}-500`,
    bg: `bg-${act.color}-100 dark:bg-${act.color}-500/20`
  }));

  if (dynamicActivities.length === 0) {
    dynamicActivities = [
      { id: 1, title: 'No recent activity', desc: 'System is running smoothly.', time: '-', icon: ICONS.schools, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' }
    ];
  }

  return {
    stats: {
      ...stats,
      dynamicUserDistribution,
      dynamicActivities,
    },
    isLoading,
    isError: error,
    mutate,
  };
}
