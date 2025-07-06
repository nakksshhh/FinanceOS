'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, TrendingUp, TrendingDown, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  showHeader?: boolean;
  title?: string;
}

export function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete, 
  showHeader = true,
  title = "Transaction History"
}: TransactionListProps) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { toast } = useToast();

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return a.description.localeCompare(b.description);
  });

  const handleDelete = async (id: string, description: string) => {
    try {
      await onDelete(id);
      toast({
        title: 'Transaction deleted',
        description: `"${description}" has been removed from your records.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-12">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-8 animate-glow">
            <TrendingUp className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">No transactions yet</h3>
          <p className="text-[var(--text-secondary)] text-center font-medium text-lg">
            Start tracking your finances by adding your first transaction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {showHeader && (
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h3 className="text-3xl font-bold gradient-text mb-3">{title}</h3>
              <p className="text-[var(--text-secondary)] font-medium text-lg">
                Manage your {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[var(--text-secondary)]" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="futuristic-select w-full sm:w-40 border-0 h-12">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-0">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <SortAsc className="h-5 w-5 text-[var(--text-secondary)]" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="futuristic-select w-full sm:w-40 border-0 h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-0">
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="description">Description</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!showHeader && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold gradient-text mb-2">{title}</h3>
        </div>
      )}
      
      <div className="space-y-4">
        {sortedTransactions.map((transaction, index) => (
          <div
            key={transaction._id}
            className="transaction-item p-6 transition-all duration-300 hover-lift"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl ${
                  transaction.type === 'income' 
                    ? 'bg-gradient-to-br from-[var(--accent-success)] to-green-400' 
                    : 'bg-gradient-to-br from-[var(--accent-danger)] to-red-400'
                } bg-opacity-20 backdrop-blur-sm`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-6 w-6 text-[var(--accent-success)]" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-[var(--accent-danger)]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{transaction.description}</h4>
                    <span className="futuristic-badge">
                      {transaction.category}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-black ${
                  transaction.type === 'income' ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="icon-button p-3 hover-lift"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id!, transaction.description)}
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