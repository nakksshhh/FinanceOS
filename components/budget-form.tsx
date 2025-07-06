'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Budget } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (budget: Omit<Budget, '_id'>) => Promise<void>;
  onCancel?: () => void;
}

export function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    amount: budget?.amount?.toString() || '',
    category: budget?.category || '',
    month: budget?.month || new Date().toISOString().slice(0, 7), // YYYY-MM format
    year: budget?.year || new Date().getFullYear(),
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

      if (!formData.category) {
        setErrors({ category: 'Category is required' });
        return;
      }

      if (!formData.month) {
        setErrors({ month: 'Month is required' });
        return;
      }

      await onSubmit({
        amount,
        category: formData.category,
        month: formData.month,
        year: formData.year,
      });

      if (!budget) {
        // Reset form for new budgets
        setFormData({
          amount: '',
          category: '',
          month: new Date().toISOString().slice(0, 7),
          year: new Date().getFullYear(),
        });
      }

      toast({
        title: `Budget ${budget ? 'updated' : 'created'} successfully`,
        description: `${formData.category} - $${formData.amount}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save budget. Please try again.',
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
          {budget ? 'Edit Budget' : 'Set Monthly Budget'}
        </h2>
        <p className="text-[var(--text-secondary)] font-medium text-lg">
          {budget ? 'Update your budget limits' : 'Set spending limits for better financial control'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
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
                {CATEGORIES.filter(cat => cat !== 'Income').map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.category}</p>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="amount" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Budget Amount ($)</Label>
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
          <Label htmlFor="month" className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Month</Label>
          <Input
            id="month"
            type="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value, year: new Date(e.target.value).getFullYear() })}
            className={`futuristic-input border-0 h-14 ${errors.month ? 'border-[var(--accent-danger)] border-2' : ''}`}
          />
          {errors.month && <p className="text-sm text-[var(--accent-danger)] font-semibold">{errors.month}</p>}
        </div>

        <div className="flex gap-6 pt-8">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="futuristic-button-primary flex-1 h-14 text-lg font-bold hover-lift"
          >
            {isSubmitting ? 'Processing...' : (budget ? 'Update Budget' : 'Set Budget')}
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