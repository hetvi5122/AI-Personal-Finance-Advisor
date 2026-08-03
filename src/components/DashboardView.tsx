import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  FileText,
  Bot,
  Target,
  ShieldCheck,
  CreditCard,
  Building,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  UserAccount,
  UserProfile,
  Transaction,
  FinancialGoal,
  CurrencyCode,
} from '../types';
import { formatCurrency, convertCurrency, CURRENCIES } from '../data/currencies';

interface DashboardViewProps {
  profile: UserProfile;
  accounts: UserAccount[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  currency: CurrencyCode;
  onOpenAddTransaction: () => void;
  onOpenReceiptScanner: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewAccount: () => void;
  activeAccountId: string;
  setActiveAccountId: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  accounts = [],
  transactions = [],
  goals = [],
  currency = 'USD' as CurrencyCode,
  onOpenAddTransaction = () => {},
  onOpenReceiptScanner = () => {},
  onNavigateTab = (_tab: string) => {},
  onOpenNewAccount = () => {},
  activeAccountId = '',
  setActiveAccountId = (_id: string) => {},
}) => {
  // Converter state
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<CurrencyCode>('USD');
  const [toCurr, setToCurr] = useState<CurrencyCode>(currency);

  // Total balance across all accounts
  const totalAccountsBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Net Worth Calculation = Total Accounts Balance + Investments - Debts
  const netWorth = totalAccountsBalance + profile.totalInvestments - profile.totalDebts;

  // Monthly Income vs Monthly Expenses
  const monthlyIncome = profile.monthlyIncome;
  const monthlyExpenses = profile.monthlyExpenses;
  const monthlyNetCashFlow = monthlyIncome - monthlyExpenses;
  const savingsRatePercent = monthlyIncome > 0 ? ((monthlyNetCashFlow / monthlyIncome) * 100).toFixed(1) : '0';

  // Emergency Fund status
  const targetEmergencyFund = monthlyExpenses * 6;
  const currentEmergencyFund = profile.currentSavings;
  const emergencyFundPercent = Math.min(100, Math.round((currentEmergencyFund / (targetEmergencyFund || 1)) * 100));

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const convertedResult = convertCurrency(convertAmount, fromCurr, toCurr);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 p-6 sm:p-8 text-white shadow-xl border border-neutral-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Portfolio Monitor Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.name}!
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-xl">
              Your financial health index is operating in <span className="text-emerald-400 font-semibold">Optimal Standing</span> with a monthly savings rate of {savingsRatePercent}%.
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenReceiptScanner}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>AI Receipt Scanner</span>
            </button>
            <button
              onClick={onOpenAddTransaction}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/15 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Net Worth</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-2">
            {formatCurrency(netWorth, currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Includes liquid assets + investments</span>
          </div>
        </div>

        {/* Monthly Cash Flow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Net Cash Flow / Mo</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            +{formatCurrency(monthlyNetCashFlow, currency)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            <span>In: {formatCurrency(monthlyIncome, currency)}</span>
            <span>•</span>
            <span>Out: {formatCurrency(monthlyExpenses, currency)}</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Savings Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
            {savingsRatePercent}%
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Target benchmark: &gt;20%
          </p>
        </div>

        {/* Liquid Emergency Shield */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Emergency Shield</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-2">
            {emergencyFundPercent}%
          </p>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{ width: `${emergencyFundPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Grid Section: Accounts + Quick AI Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Accounts & Quick AI Action Banner */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Accounts Header & Grid */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Active Finance Accounts</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select an account to view filtered transactions
                </p>
              </div>
              <button
                onClick={onOpenNewAccount}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map((acc) => {
                const isSelected = acc.id === activeAccountId;
                return (
                  <div
                    key={acc.id}
                    onClick={() => setActiveAccountId(acc.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: acc.color }}
                        />
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {acc.name}
                        </span>
                      </div>
                      {acc.isDefault && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 capitalize font-mono">
                      {acc.type} • {acc.accountNumber}
                    </p>
                    <p className="text-lg font-extrabold font-mono text-neutral-900 dark:text-white mt-3">
                      {formatCurrency(acc.balance, currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Recent Transactions</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Latest activity across accounts
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        {tx.isAiExtracted && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            AI Scanned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {tx.category} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-xs font-bold font-mono shrink-0 ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: AI Assistant Shortcuts & Currency Converter */}
        <div className="space-y-6">
          
          {/* AI Strategy Quick Hub */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-neutral-900 text-white shadow-xl border border-indigo-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI Wealth Co-Pilot</span>
            </div>
            <h4 className="text-lg font-bold">Generate Fresh AI Financial Analysis</h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Get an instant budget audit, cash flow review, emergency fund status, debt payoff roadmap, and 5-year savings projection.
            </p>
            <button
              onClick={() => onNavigateTab('report')}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generate AI Financial Strategy</span>
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="mt-2.5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Chat Assistant</span>
            </button>
          </div>

          {/* Financial Goals Mini Preview */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Active Goals</h4>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100));
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{g.title}</span>
                      <span className="font-mono text-neutral-500">{pct}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Currency Converter Widget */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white mb-3">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick FX Exchange Converter</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">From</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value as CurrencyCode)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">To</label>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value as CurrencyCode)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Equivalent Value</span>
                <p className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  {formatCurrency(convertedResult, toCurr)}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
