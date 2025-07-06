'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/lib/validations';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const monthlyData = useMemo(() => {
    const expensesByMonth = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: monthName,
            amount: 0,
            count: 0
          };
        }
        
        acc[monthYear].amount += transaction.amount;
        acc[monthYear].count += 1;
        return acc;
      }, {} as Record<string, { month: string; amount: number; count: number }>);

    return Object.entries(expensesByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([_, data]) => ({
        month: data.month,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count
      }));
  }, [transactions]);

  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.amount, 0);
  const averageMonthly = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container p-10">
        <div className="mb-8">
          <h3 className="text-3xl font-bold gradient-text mb-3">Monthly Expenses</h3>
          <p className="text-[var(--text-secondary)] text-lg">No expense data available</p>
        </div>
        <div className="flex items-center justify-center h-80 text-[var(--text-secondary)]">
          <p className="text-center font-medium text-lg">Add some expense transactions to see your monthly spending trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-bold gradient-text mb-3">Monthly Expenses</h3>
        <p className="text-[var(--text-secondary)] mb-6 text-lg">Track your spending patterns over time</p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"></div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Total: ${totalExpenses.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-60"></div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Average: ${averageMonthly.toFixed(2)}/month
            </span>
          </div>
        </div>
      </div>
      
      <div className="h-96 glass-card p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-primary)', opacity: 0.3 }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => `$${value}`}
              axisLine={{ stroke: 'var(--border-primary)', opacity: 0.3 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(20px)',
              }}
              formatter={(value: number) => [value, 'Amount']}
              
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar 
              dataKey="amount" 
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}