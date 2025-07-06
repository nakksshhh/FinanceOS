'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, Budget } from '@/lib/validations';

interface BudgetVsActualChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function BudgetVsActualChart({ transactions, budgets }: BudgetVsActualChartProps) {
  const chartData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get current month budgets
    const currentBudgets = budgets.filter(b => b.month === currentMonth);
    
    // Calculate actual spending by category for current month
    const actualSpending = transactions
      .filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
        return t.type === 'expense' && transactionMonth === currentMonth;
      })
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    // Combine budget and actual data
    const data = currentBudgets.map(budget => ({
      category: budget.category,
      budget: budget.amount,
      actual: actualSpending[budget.category] || 0,
      remaining: Math.max(0, budget.amount - (actualSpending[budget.category] || 0)),
      overspent: Math.max(0, (actualSpending[budget.category] || 0) - budget.amount),
    }));

    // Add categories with spending but no budget
    Object.keys(actualSpending).forEach(category => {
      if (!data.find(d => d.category === category)) {
        data.push({
          category,
          budget: 0,
          actual: actualSpending[category],
          remaining: 0,
          overspent: actualSpending[category],
        });
      }
    });

    return data.sort((a, b) => b.budget - a.budget);
  }, [transactions, budgets]);

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const totalBudget = chartData.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = chartData.reduce((sum, item) => sum + item.actual, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);

  if (chartData.length === 0) {
    return (
      <div className="chart-container p-10">
        <div className="mb-8">
          <h3 className="text-3xl font-bold gradient-text mb-3">Budget vs Actual</h3>
          <p className="text-[var(--text-secondary)] text-lg">No budget data available for {currentMonthName}</p>
        </div>
        <div className="flex items-center justify-center h-80 text-[var(--text-secondary)]">
          <p className="text-center font-medium text-lg">Set up your monthly budgets to track spending against your limits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container p-10">
      <div className="mb-8">
        <h3 className="text-3xl font-bold gradient-text mb-3">Budget vs Actual</h3>
        <p className="text-[var(--text-secondary)] mb-6 text-lg">{currentMonthName} spending comparison</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center hover-lift">
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Total Budget</p>
            <p className="text-2xl font-black text-[var(--accent-primary)]">${totalBudget.toFixed(2)}</p>
          </div>
          <div className="glass-card p-6 text-center hover-lift">
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Total Spent</p>
            <p className={`text-2xl font-black ${totalSpent > totalBudget ? 'text-[var(--accent-danger)]' : 'text-[var(--text-primary)]'}`}>
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="glass-card p-6 text-center hover-lift">
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Remaining</p>
            <p className={`text-2xl font-black ${totalRemaining > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
              ${totalRemaining.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-96 glass-card p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.3} />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-primary)', opacity: 0.3 }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`, 
                name === 'budget' ? 'Budget' : 'Actual'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="budget" 
              fill="var(--accent-primary)"
              name="Budget"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="actual" 
              fill="var(--accent-secondary)"
              name="Actual"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}