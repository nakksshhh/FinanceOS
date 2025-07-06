'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Zap, Target } from 'lucide-react';
import { Transaction } from '@/lib/validations';

interface DashboardStatsProps {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      currentMonthExpenses,
      balance,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${stats.balance.toFixed(2)}`,
      description: 'Your current balance',
      icon: DollarSign,
      color: stats.balance >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]',
      gradient: stats.balance >= 0 ? 'from-[var(--accent-success)] to-green-400' : 'from-[var(--accent-danger)] to-red-400',
      glow: stats.balance >= 0 ? 'success-glow' : 'danger-glow',
    },
    {
      title: 'Total Income',
      value: `$${stats.totalIncome.toFixed(2)}`,
      description: 'All time income',
      icon: TrendingUp,
      color: 'text-[var(--accent-success)]',
      gradient: 'from-[var(--accent-success)] to-green-400',
      glow: 'success-glow',
    },
    {
      title: 'Total Expenses',
      value: `$${stats.totalExpenses.toFixed(2)}`,
      description: 'All time expenses',
      icon: TrendingDown,
      color: 'text-[var(--accent-danger)]',
      gradient: 'from-[var(--accent-danger)] to-red-400',
      glow: 'danger-glow',
    },
    {
      title: 'This Month',
      value: `$${stats.currentMonthExpenses.toFixed(2)}`,
      description: 'Current month expenses',
      icon: Calendar,
      color: 'text-[var(--accent-primary)]',
      gradient: 'from-[var(--accent-primary)] to-[var(--accent-secondary)]',
      glow: '',
    },
  ];

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div 
          key={stat.title} 
          className={`stat-card p-8 relative overflow-hidden hover-lift ${stat.glow}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-20 backdrop-blur-sm`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{stat.title}</p>
                <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] font-medium">{stat.description}</p>
          </div>
          
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
          
          {/* Animated border */}
          <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-r ${stat.gradient} opacity-20 blur-sm`}></div>
        </div>
      ))}
    </div>
  );
}