'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Target, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => Promise<void>;
}

export function BudgetList({ budgets, onEdit, onDelete }: BudgetListProps) {
  const [filter, setFilter] = useState('current');
  const { toast } = useToast();

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const filteredBudgets = budgets.filter((budget) => {
    if (filter === 'current') return budget.month === currentMonth;
    if (filter === 'all') return true;
    return budget.month === filter;
  });

  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    if (a.month !== b.month) {
      return b.month.localeCompare(a.month);
    }
    return b.amount - a.amount;
  });

  const handleDelete = async (id: string, category: string) => {
    try {
      await onDelete(id);
      toast({
        title: 'Budget deleted',
        description: `Budget for "${category}" has been removed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete budget. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get unique months for filter
  const availableMonths = [...new Set(budgets.map(b => b.month))].sort().reverse();

  if (budgets.length === 0) {
    return (
      <div className="glass-card p-12">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-8 animate-glow">
            <Target className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">No budgets set</h3>
          <p className="text-[var(--text-secondary)] text-center font-medium text-lg">
            Start managing your finances by setting monthly budgets for different categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-10">
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div>
            <h3 className="text-3xl font-bold gradient-text mb-3">Budget Management</h3>
            <p className="text-[var(--text-secondary)] font-medium text-lg">
              Manage your {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-[var(--text-secondary)]" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="futuristic-select w-48 border-0 h-12">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent className="glass-card border-0">
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + '-01'), 'MMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {sortedBudgets.map((budget, index) => (
          <div
            key={budget._id}
            className="transaction-item p-6 transition-all duration-300 hover-lift"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-opacity-20">
                  <Target className="h-6 w-6 text-[var(--accent-primary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{budget.category}</h4>
                    <span className="futuristic-badge">
                      {format(new Date(budget.month + '-01'), 'MMM yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    Monthly budget limit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-2xl font-black text-[var(--accent-primary)]">
                  ${budget.amount.toFixed(2)}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => onEdit(budget)}
                    className="icon-button p-3 hover-lift"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id!, budget.category)}
                    className="icon-button p-3 hover-lift hover:text-[var(--accent-danger)] hover:border-[var(--accent-danger)]"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}