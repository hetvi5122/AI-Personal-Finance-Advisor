import React, { useState } from 'react';
import {
  Target,
  Plus,
  Home,
  Car,
  GraduationCap,
  ShieldCheck,
  Palmtree,
  TrendingUp,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
  X,
  CheckCircle,
} from 'lucide-react';
import { FinancialGoal, GoalCategory, CurrencyCode } from '../types';
import { formatCurrency } from '../data/currencies';

interface GoalTrackerProps {
  goals: FinancialGoal[];
  currency: CurrencyCode;
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const GOAL_CATEGORIES: { id: GoalCategory; label: string; icon: any; color: string }[] = [
  { id: 'house', label: 'Real Estate / House', icon: Home, color: '#3B82F6' },
  { id: 'car', label: 'Vehicle / Car', icon: Car, color: '#F59E0B' },
  { id: 'emergency_fund', label: 'Emergency Shield', icon: ShieldCheck, color: '#10B981' },
  { id: 'vacation', label: 'Travel & Vacation', icon: Palmtree, color: '#EC4899' },
  { id: 'education', label: 'Education / Higher Studies', icon: GraduationCap, color: '#8B5CF6' },
  { id: 'retirement', label: 'Retirement Corpus', icon: TrendingUp, color: '#06B6D4' },
  { id: 'other', label: 'Other Milestone', icon: Target, color: '#6366F1' },
];

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals = [],
  currency = 'USD' as CurrencyCode,
  onAddGoal = (_goal: Omit<FinancialGoal, 'id'>) => {},
  onUpdateGoal = (_goal: FinancialGoal) => {},
  onDeleteGoal = (_id: string) => {},
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('house');
  const [targetAmount, setTargetAmount] = useState<number>(50000);
  const [currentAmount, setCurrentAmount] = useState<number>(10000);
  const [targetDate, setTargetDate] = useState<string>('2028-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(800);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setCategory('house');
    setTargetAmount(50000);
    setCurrentAmount(10000);
    setTargetDate('2028-12-31');
    setMonthlyContribution(800);
    setPriority('high');
    setIsModalOpen(true);
  };

  const openEditModal = (g: FinancialGoal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setCategory(g.category);
    setTargetAmount(g.targetAmount);
    setCurrentAmount(g.currentAmount);
    setTargetDate(g.targetDate);
    setMonthlyContribution(g.monthlyContribution);
    setPriority(g.priority);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0) return;

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: title.trim(),
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        targetDate,
        monthlyContribution: Number(monthlyContribution),
        priority,
      });
    } else {
      onAddGoal({
        title: title.trim(),
        category,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        targetDate,
        monthlyContribution: Number(monthlyContribution),
        priority,
        aiSuggestion: `Automate $${monthlyContribution}/mo to hit target on ${targetDate}.`,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickAddSavings = (g: FinancialGoal, extra: number) => {
    onUpdateGoal({
      ...g,
      currentAmount: g.currentAmount + extra,
    });
  };

  const getCategoryMeta = (catId: GoalCategory) => {
    return GOAL_CATEGORIES.find((c) => c.id === catId) || GOAL_CATEGORIES[0];
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Financial Goal Tracking
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Monitor progress toward house downpayments, emergency funds, cars, and retirement
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const meta = getCategoryMeta(goal.category);
          const Icon = meta.icon;
          const pct = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 relative overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: meta.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">{goal.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                      Target Date: {goal.targetDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Amounts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="text-neutral-500">
                    Target: {formatCurrency(goal.targetAmount, currency)} ({pct}%)
                  </span>
                </div>

                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>

              {/* Details & Quick Add */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Remaining</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {formatCurrency(remaining, currency)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Monthly SIP</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(goal.monthlyContribution, currency)}/mo
                  </span>
                </div>

                <button
                  onClick={() => handleQuickAddSavings(goal, 500)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] transition cursor-pointer"
                >
                  +$500 Saved
                </button>
              </div>

              {/* AI Suggestion Box */}
              {goal.aiSuggestion && (
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{goal.aiSuggestion}</span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Goal Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
              {editingGoal ? 'Edit Financial Goal' : 'Create Financial Goal'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vacation in Italy or Dream House Downpayment"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Already Saved ({currency})
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Monthly Target SIP ({currency})
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer mt-2"
              >
                {editingGoal ? 'Update Goal' : 'Save Goal'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
