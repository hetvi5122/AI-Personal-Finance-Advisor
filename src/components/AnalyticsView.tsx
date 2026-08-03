import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Filter,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Transaction, TimeRangeFilter, CurrencyCode, UserProfile } from '../types';
import { formatCurrency } from '../data/currencies';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  profile: UserProfile;
}

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions = [], currency = 'USD' as CurrencyCode }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('3m');

  // Filter transactions based on time range
  const filteredTxs = useMemo(() => {
    if (timeRange === 'all') return transactions;
    const now = new Date().getTime();
    const daysMap: Record<TimeRangeFilter, number> = {
      '7d': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      'all': 99999,
    };
    const maxDays = daysMap[timeRange] || 90;
    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime();
      return (now - txTime) / (1000 * 60 * 60 * 24) <= maxDays;
    });
  }, [transactions, timeRange]);

  // Aggregate Totals
  const totalIncome = useMemo(
    () => filteredTxs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    [filteredTxs]
  );

  const totalExpenses = useMemo(
    () => filteredTxs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    [filteredTxs]
  );

  const netCashFlow = totalIncome - totalExpenses;

  // AI Receipt Expenses Total
  const aiReceiptTotal = useMemo(
    () =>
      filteredTxs
        .filter((t) => t.type === 'expense' && (t.isAiExtracted || t.category === 'AI Receipt Expense'))
        .reduce((acc, t) => acc + t.amount, 0),
    [filteredTxs]
  );

  const aiReceiptCount = useMemo(
    () =>
      filteredTxs.filter(
        (t) => t.type === 'expense' && (t.isAiExtracted || t.category === 'AI Receipt Expense')
      ).length,
    [filteredTxs]
  );

  // Category Distribution (Expenses)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const catName = t.category || (t.isAiExtracted ? 'AI Receipt Expense' : 'Other');
        map[catName] = (map[catName] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTxs]);

  // Income vs Expense Over Time (Grouped by Date)
  const timeSeriesData = useMemo(() => {
    const map: Record<string, { date: string; income: number; expense: number; net: number }> = {};

    // Sort chronologically
    const sorted = [...filteredTxs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((t) => {
      if (!map[t.date]) {
        map[t.date] = { date: t.date, income: 0, expense: 0, net: 0 };
      }
      if (t.type === 'income') {
        map[t.date].income += t.amount;
      } else {
        map[t.date].expense += t.amount;
      }
      map[t.date].net = map[t.date].income - map[t.date].expense;
    });

    return Object.values(map);
  }, [filteredTxs]);

  const topSpendingCategory = categoryData[0]?.name || 'N/A';

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header & Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Financial Analytics & Insights
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Interactive breakdown of income streams, burn rate, and category distributions
          </p>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: '7d', label: '7 Days' },
            { id: '1m', label: 'Last Month' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: 'Last Year' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id as TimeRangeFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                timeRange === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Income</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalIncome, currency)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Inflow for selected period</p>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Expenses</span>
          <p className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Outflow for selected period</p>
        </div>

        {/* AI Receipt Expenses */}
        <div className="p-5 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              AI Receipt Expenses
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(aiReceiptTotal, currency)}
          </p>
          <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 mt-1 font-medium">
            {aiReceiptCount} scanned receipt{aiReceiptCount === 1 ? '' : 's'}
          </p>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Net Cash Flow</span>
          <p
            className={`text-2xl font-extrabold font-mono mt-2 ${
              netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, currency)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Net surplus saved</p>
        </div>

        {/* Top Expense Category */}
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Top Spend Category</span>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-2 truncate">
            {topSpendingCategory}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {categoryData[0] ? formatCurrency(categoryData[0].value, currency) : '$0.00'}
          </p>
        </div>

      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expenses Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Income vs Expense Trends</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Cash inflows compared to outflows</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut Chart (1 Col) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Expenses by Category</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Discretionary & fixed spend ratio</p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-neutral-400">
              No expense data recorded in this timeframe
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'Total']}
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="truncate text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                  {cat.name === 'AI Receipt Expense' && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      OCR
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(cat.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Net Cash Flow Area Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Cumulative Cash Flow Growth</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Net monthly surplus trajectory over time</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#888888" />
              <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val) || 0, currency), 'Net Cash Flow']}
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#262626',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
