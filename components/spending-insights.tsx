'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Activity } from 'lucide-react';
import { Transaction, Budget } from '@/lib/validations';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    // Current month expenses by category
    const currentExpenses = transactions
      .filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
        return t.type === 'expense' && transactionMonth === currentMonth;
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Last month expenses by category
    const lastMonthExpenses = transactions
      .filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7);
        return t.type === 'expense' && transactionMonth === lastMonth;
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Current month budgets
    const currentBudgets = budgets
      .filter(b => b.month === currentMonth)
      .reduce((acc, b) => {
        acc[b.category] = b.amount;
        return acc;
      }, {} as Record<string, number>);

    // Calculate insights
    const totalCurrentSpending = Object.values(currentExpenses).reduce((sum, amount) => sum + amount, 0);
    const totalLastMonthSpending = Object.values(lastMonthExpenses).reduce((sum, amount) => sum + amount, 0);
    const totalBudget = Object.values(currentBudgets).reduce((sum, amount) => sum + amount, 0);

    // Top spending categories
    const topCategories = Object.entries(currentExpenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalCurrentSpending > 0 ? (amount / totalCurrentSpending) * 100 : 0,
      }));

    // Budget alerts
    const budgetAlerts = Object.entries(currentBudgets)
      .map(([category, budget]) => {
        const spent = currentExpenses[category] || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        return {
          category,
          budget,
          spent,
          percentage,
          status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
        };
      })
      .filter(alert => alert.status !== 'good')
      .sort((a, b) => b.percentage - a.percentage);

    // Month-over-month comparison
    const monthComparison = totalLastMonthSpending > 0 
      ? ((totalCurrentSpending - totalLastMonthSpending) / totalLastMonthSpending) * 100 
      : 0;

    return {
      totalCurrentSpending,
      totalBudget,
      monthComparison,
      topCategories,
      budgetAlerts,
      budgetUtilization: totalBudget > 0 ? (totalCurrentSpending / totalBudget) * 100 : 0,
    };
  }, [transactions, budgets]);

  const pieColors = [
    'var(--accent-primary)',
    'var(--accent-secondary)',
    'var(--accent-tertiary)',
    'var(--accent-success)',
    'var(--accent-warning)',
  ];

  const pieData = insights.topCategories.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: pieColors[index % pieColors.length],
  }));

  return (
    <div className="space-y-12">
      {/* Overview Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card p-8 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-opacity-20">
              <Target className="h-7 w-7 text-[var(--accent-primary)]" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Budget Usage</p>
              <div className="text-3xl font-black text-[var(--accent-primary)]">
                {insights.budgetUtilization.toFixed(0)}%
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            ${insights.totalCurrentSpending.toFixed(2)} of ${insights.totalBudget.toFixed(2)}
          </p>
        </div>

        <div className="stat-card p-8 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-xl ${
              insights.monthComparison > 0 
                ? 'bg-gradient-to-br from-[var(--accent-danger)] to-red-400 bg-opacity-20' 
                : 'bg-gradient-to-br from-[var(--accent-success)] to-green-400 bg-opacity-20'
            }`}>
              {insights.monthComparison > 0 ? (
                <TrendingUp className="h-7 w-7 text-[var(--accent-danger)]" />
              ) : (
                <TrendingDown className="h-7 w-7 text-[var(--accent-success)]" />
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">vs Last Month</p>
              <div className={`text-3xl font-black ${
                insights.monthComparison > 0 ? 'text-[var(--accent-danger)]' : 'text-[var(--accent-success)]'
              }`}>
                {insights.monthComparison > 0 ? '+' : ''}{insights.monthComparison.toFixed(1)}%
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            {insights.monthComparison > 0 ? 'Increased' : 'Decreased'} spending
          </p>
        </div>

        <div className="stat-card p-8 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-warning)] to-yellow-400 bg-opacity-20">
              <AlertTriangle className="h-7 w-7 text-[var(--accent-warning)]" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Budget Alerts</p>
              <div className="text-3xl font-black text-[var(--accent-warning)]">
                {insights.budgetAlerts.length}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Categories over 80%</p>
        </div>

        <div className="stat-card p-8 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-tertiary)] to-cyan-400 bg-opacity-20">
              <Activity className="h-7 w-7 text-[var(--accent-tertiary)]" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Top Category</p>
              <div className="text-lg font-black text-[var(--text-primary)]">
                {insights.topCategories[0]?.category || 'None'}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            ${insights.topCategories[0]?.amount.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Spending Breakdown */}
        <div className="chart-container p-10 hover-scale">
          <h3 className="text-3xl font-bold gradient-text mb-8">Spending Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name = '', percent = 0 }) =>
  `${name} ${(percent * 100).toFixed(0)}%`
}

                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-lg)',
                      backdropFilter: 'blur(20px)',
                    }}
                   formatter={(value: number) => [value, 'Amount']}

                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-[var(--text-secondary)]">
              <p className="text-center font-medium text-lg">No spending data for this month</p>
            </div>
          )}
        </div>

        {/* Budget Alerts */}
        <div className="chart-container p-10 hover-scale">
          <h3 className="text-3xl font-bold gradient-text mb-8">Budget Alerts</h3>
          {insights.budgetAlerts.length > 0 ? (
            <div className="space-y-6">
              {insights.budgetAlerts.map((alert, index) => (
                <div 
                  key={alert.category} 
                  className="glass-card p-6 hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{alert.category}</h4>
                    <span className={`futuristic-badge font-bold ${
                      alert.status === 'over' ? 'text-[var(--accent-danger)]' : 'text-[var(--accent-warning)]'
                    }`}>
                      {alert.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)] font-semibold">Spent: ${alert.spent.toFixed(2)}</span>
                      <span className="text-[var(--text-secondary)] font-semibold">Budget: ${alert.budget.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          alert.status === 'over' 
                            ? 'bg-gradient-to-r from-[var(--accent-danger)] to-red-400' 
                            : 'bg-gradient-to-r from-[var(--accent-warning)] to-yellow-400'
                        }`}
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-[var(--text-secondary)]">
              <div className="text-center">
                <div className="p-6 rounded-full bg-gradient-to-br from-[var(--accent-success)] to-green-400 w-fit mx-auto mb-6 animate-glow">
                  <Target className="h-16 w-16 text-white" />
                </div>
                <p className="font-bold text-lg text-[var(--text-primary)] mb-2">All budgets are on track!</p>
                <p className="text-sm">Great job managing your spending.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}