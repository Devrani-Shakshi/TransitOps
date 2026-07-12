import { Vehicle } from './vehicle.model';

export type ExpenseCategory = 'FUEL' | 'TOLL' | 'PARKING' | 'INSURANCE' | 'TAX' | 'ALLOWANCE' | 'OTHER';

export interface Expense {
  id: string;
  vehicleId: string;
  tripId?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  vehicle?: Vehicle;
}

export interface ExpenseSummary {
  categoryBreakdown: { category: ExpenseCategory; total: number }[];
  monthlyTrend: { month: string; amount: number }[];
  totalOperationalCost: number;
}
