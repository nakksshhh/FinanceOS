'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Transaction } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, '_id'>) => Promise<void>;
  onCancel?: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '',
    type: transaction?.type || 'expense' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const amount = parseFloat(formData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        setErrors({ amount: 'Please enter a valid amount' });
        return;
      }

      if (!formData.description.trim()) {
        setErrors({ description: 'Description is required' });
        return;
      }

      if (!formData.category) {
        setErrors({ category: 'Category is required' });
        return;
      }

      if (!formData.date) {
        setErrors({ date: 'Date is required' });
        return;
      }

      await onSubmit({
        amount,
        description: formData.description.trim(),
        date: formData.date,
        category: formData.category,
        type: formData.type,
      });

      if (!transaction) {
        // Reset form for new transactions
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          type: 'expense',
        });
      }

      toast({
        title: `Transaction ${transaction ? 'updated' : 'created'} successfully`,
        description: `${formData.description} - $${formData.amount}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-10">
      <div className="mb-10">
        <h2 className="text-4xl font-black gradient-text mb-4">
          {transaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <p className="text-[var(--text-secondary)] font-medium text-lg">
          {transaction ? 'Update your transaction details' : 'Track your income and expenses'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="type" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="futuristic-input border-0 h-14">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-card border-0">
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label htmlFor="amount" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`futuristic-input border-0 h-14 text-lg font-semibold ${errors.amount ? 'border-[var(--accent-danger)] border-2' : ''}`}
            />
            {errors.amount && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.amount}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="description" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Description</Label>
          <Input
            id="description"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`futuristic-input border-0 h-14 text-lg ${errors.description ? 'border-[var(--accent-danger)] border-2' : ''}`}
          />
          {errors.description && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="category" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={`futuristic-input border-0 h-14 ${errors.category ? 'border-[var(--accent-danger)] border-2' : ''}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="glass-card border-0">
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.category}</p>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="date" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`futuristic-input border-0 h-14 ${errors.date ? 'border-[var(--accent-danger)] border-2' : ''}`}
            />
            {errors.date && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.date}</p>}
          </div>
        </div>

        <div className="flex gap-6 pt-8">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="futuristic-button-primary flex-1 h-14 text-lg font-bold hover-lift"
          >
            {isSubmitting ? 'Processing...' : (transaction ? 'Update Transaction' : 'Add Transaction')}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              onClick={onCancel} 
              className="futuristic-button flex-1 h-14 text-lg font-semibold hover-lift"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}