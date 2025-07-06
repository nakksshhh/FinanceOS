'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Settings, PieChart, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/monthly-expenses-chart';
import { DashboardStats } from '@/components/dashboard-stats';
import { BudgetForm } from '@/components/budget-form';
import { BudgetList } from '@/components/budget-list';
import { BudgetVsActualChart } from '@/components/budget-vs-actual-chart';
import { SpendingInsights } from '@/components/spending-insights';
import { Transaction, Budget } from '@/lib/validations';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, '_id'>) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });

    if (response.ok) {
      const newTransaction = await response.json();
      setTransactions([newTransaction, ...transactions]);
      setIsTransactionDialogOpen(false);
    } else {
      throw new Error('Failed to add transaction');
    }
  };

  const handleEditTransaction = async (transaction: Omit<Transaction, '_id'>) => {
    if (!editingTransaction?._id) return;

    const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });

    if (response.ok) {
      setTransactions(transactions.map(t => 
        t._id === editingTransaction._id 
          ? { ...t, ...transaction }
          : t
      ));
      setEditingTransaction(null);
      setIsTransactionDialogOpen(false);
    } else {
      throw new Error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTransactions(transactions.filter(t => t._id !== id));
    } else {
      throw new Error('Failed to delete transaction');
    }
  };

  const handleAddBudget = async (budget: Omit<Budget, '_id'>) => {
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });

    if (response.ok) {
      const newBudget = await response.json();
      setBudgets([newBudget, ...budgets]);
      setIsBudgetDialogOpen(false);
    } else {
      throw new Error('Failed to add budget');
    }
  };

  const handleEditBudget = async (budget: Omit<Budget, '_id'>) => {
    if (!editingBudget?._id) return;

    const response = await fetch(`/api/budgets/${editingBudget._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });

    if (response.ok) {
      setBudgets(budgets.map(b => 
        b._id === editingBudget._id 
          ? { ...b, ...budget }
          : b
      ));
      setEditingBudget(null);
      setIsBudgetDialogOpen(false);
    } else {
      throw new Error('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    const response = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setBudgets(budgets.filter(b => b._id !== id));
    } else {
      throw new Error('Failed to delete budget');
    }
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const handleEditBudgetClick = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  const handleCloseTransactionDialog = () => {
    setIsTransactionDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleCloseBudgetDialog = () => {
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
  };

  const handleQuickTransaction = (type: 'income' | 'expense') => {
    setEditingTransaction({
      _id: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: type === 'income' ? 'Income' : 'Other',
      type,
    });
    setIsTransactionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="futuristic-loading mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold gradient-text mb-4">Initializing Financial Matrix</h2>
          <p className="text-lg font-medium text-[var(--text-secondary)]">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'insights', label: 'Insights', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-secondary)] rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-[var(--accent-tertiary)] rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] animate-glow">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl font-black gradient-text">
                  FinanceOS
                </h1>
              </div>
              <p className="text-xl text-[var(--text-secondary)] font-medium">
                Advanced Financial Intelligence System
              </p>
            </div>
            
            {/* Navigation */}
            <div className="nav-container p-2">
              <div className="flex gap-2">
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-item flex items-center gap-3 px-6 py-3 font-semibold transition-all duration-300 ${
                      activeTab === item.id
                        ? 'active text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 animate-slide-in-right">
          <div className="flex flex-col sm:flex-row gap-6">
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <button className="group relative overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-[0_0_40px_var(--glow-primary)] transition-all duration-500 hover:scale-105 hover:-translate-y-1 border-2 border-transparent hover:border-white/20">
                  {/* Animated background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Button content */}
                  <div className="relative flex items-center gap-4">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-black tracking-wide">Add Transaction</span>
                  </div>
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </DialogTrigger>
              <DialogContent className="futuristic-dialog max-w-2xl border-0">
                <TransactionForm
                  transaction={editingTransaction || undefined}
                  onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
                  onCancel={handleCloseTransactionDialog}
                />
              </DialogContent>
            </Dialog>

            {activeTab === 'budget' && (
              <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <button className="group relative overflow-hidden bg-gradient-to-br from-[var(--accent-tertiary)] to-[var(--accent-primary)] text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-[0_0_40px_var(--glow-primary)] transition-all duration-500 hover:scale-105 hover:-translate-y-1 border-2 border-transparent hover:border-white/20">
                    {/* Animated background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {/* Button content */}
                    <div className="relative flex items-center gap-4">
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                        <Target className="h-6 w-6" />
                      </div>
                      <span className="font-black tracking-wide">Set Budget</span>
                    </div>
                    
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </DialogTrigger>
                <DialogContent className="futuristic-dialog max-w-2xl border-0">
                  <BudgetForm
                    budget={editingBudget || undefined}
                    onSubmit={editingBudget ? handleEditBudget : handleAddBudget}
                    onCancel={handleCloseBudgetDialog}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <button 
              onClick={() => handleQuickTransaction('income')}
              className="group relative overflow-hidden bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card-hover)] border-2 border-[var(--border-primary)] hover:border-[var(--accent-success)] text-[var(--text-primary)] px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_30px_var(--glow-success)]"
            >
              <div className="relative flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-[var(--accent-success)]" />
                <span className="font-bold tracking-wide">Quick Income</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickTransaction('expense')}
              className="group relative overflow-hidden bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-card-hover)] border-2 border-[var(--border-primary)] hover:border-[var(--accent-danger)] text-[var(--text-primary)] px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_30px_var(--glow-danger)]"
            >
              <div className="relative flex items-center gap-3">
                <TrendingDown className="h-6 w-6 text-[var(--accent-danger)]" />
                <span className="font-bold tracking-wide">Quick Expense</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in-up">
              <DashboardStats transactions={transactions} />
              
              <div className="grid gap-12 lg:grid-cols-2 mt-12">
                <div className="hover-scale">
                  <MonthlyExpensesChart transactions={transactions} />
                </div>
                <div className="lg:col-span-1 hover-scale">
                  <TransactionList
                    transactions={transactions.slice(0, 5)}
                    onEdit={handleEditTransactionClick}
                    onDelete={handleDeleteTransaction}
                    showHeader={false}
                    title="Recent Transactions"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div className="animate-fade-in-up hover-scale">
              <TransactionList
                transactions={transactions}
                onEdit={handleEditTransactionClick}
                onDelete={handleDeleteTransaction}
              />
            </div>
          )}
          
          {activeTab === 'budget' && (
            <div className="space-y-12 animate-fade-in-up">
              <div className="hover-scale">
                <BudgetVsActualChart transactions={transactions} budgets={budgets} />
              </div>
              <div className="hover-scale">
                <BudgetList
                  budgets={budgets}
                  onEdit={handleEditBudgetClick}
                  onDelete={handleDeleteBudget}
                />
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="animate-fade-in-up hover-scale">
              <SpendingInsights transactions={transactions} budgets={budgets} />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="glass-card p-12 text-center animate-fade-in-up">
              <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] w-fit mx-auto mb-8 animate-glow">
                <Settings className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-3xl font-bold gradient-text mb-4">System Configuration</h3>
              <p className="text-xl text-[var(--text-secondary)] font-medium">Advanced settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}