import { useSchools } from './useSchools';

export type Plan = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type Status = 'Active' | 'Trialling' | 'Past Due' | 'Canceled';

export interface Subscription {
  id: string;
  schoolName: string;
  schoolId: string;
  plan: Plan;
  cycle: string;
  amount: number;
  status: Status;
  lastPayment: string;
  nextBilling: string;
}

export function useSubscriptions() {
  const { schools, isLoading, isError, mutate } = useSchools();

  const subscriptions: Subscription[] = schools.map((sch: any) => {
    let planAmount = 4999;
    if (sch.plan === 'Standard') planAmount = 9999;
    if (sch.plan === 'Premium') planAmount = 19999;
    if (sch.plan === 'Enterprise') planAmount = 49999;

    let frontendStatus: Status = 'Active';
    if (sch.status === 'Trial') frontendStatus = 'Trialling';
    if (sch.status === 'Expired') frontendStatus = 'Past Due';
    if (sch.status === 'Suspended') frontendStatus = 'Canceled';

    return {
      id: sch._id,
      schoolName: sch.name,
      schoolId: sch.code,
      plan: (sch.plan as Plan) || 'Basic',
      cycle: 'Monthly',
      amount: planAmount,
      status: frontendStatus,
      lastPayment: '-',
      nextBilling: '-',
    };
  });

  return {
    subscriptions,
    isLoading,
    isError,
    mutate,
  };
}
