import { useSchools } from './useSchools';

export type TxnStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded';
export type Method = 'Credit Card' | 'Bank Transfer' | 'UPI' | 'PayPal';

export interface Transaction {
  id: string;
  schoolName: string;
  schoolId: string;
  amount: number;
  date: string;
  method: Method;
  status: TxnStatus;
  invoiceId: string;
  description: string;
}

export function useTransactions() {
  const { schools, isLoading, isError, mutate } = useSchools();

  const transactions: Transaction[] = schools.map((sch: any, index: number) => {
    let planAmount = 4999;
    let method: Method = 'Credit Card';
    let status: TxnStatus = 'Successful';

    if (sch.plan === 'Standard') planAmount = 9999;
    if (sch.plan === 'Premium') {
      planAmount = 199990;
      method = 'Bank Transfer';
    }
    if (sch.plan === 'Enterprise') {
      planAmount = 499990;
      method = 'UPI';
    }

    if (sch.status === 'Trial') status = 'Pending';
    if (sch.status === 'Expired') status = 'Failed';
    if (sch.status === 'Suspended') status = 'Refunded';

    return {
      id: `TXN-${8091 + index}`,
      schoolName: sch.name,
      schoolId: sch.code,
      amount: planAmount,
      date: new Date(sch.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      method,
      status,
      invoiceId: `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      description: `Annual ${sch.plan || 'Basic'} Plan`,
    };
  });

  return {
    transactions,
    isLoading,
    isError,
    mutate,
  };
}
