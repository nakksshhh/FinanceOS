import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
});

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  month: z.string().min(1, 'Month is required'),
  year: z.number().min(2020).max(2030),
});

export type Transaction = z.infer<typeof transactionSchema> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Budget = z.infer<typeof budgetSchema> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Groceries',
  'Fitness',
  'Personal Care',
  'Home & Garden',
  'Gifts & Donations',
  'Income',
  'Other',
] as const;