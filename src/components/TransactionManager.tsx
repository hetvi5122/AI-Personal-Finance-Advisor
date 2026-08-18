import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Receipt,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  X,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  Transaction,
  UserAccount,
  TransactionCategory,
  PaymentMethod,
  TransactionType,
  CurrencyCode,
  TimeRangeFilter,
} from '../types';
import { formatCurrency } from '../data/currencies';

interface TransactionManagerProps {
  transactions: Transaction[];
  accounts: UserAccount[];
  currency: CurrencyCode;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenReceiptScanner: () => void;
  activeAccountId: string;
}

const CATEGORIES: TransactionCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Utilities & Bills',
  'Shopping & Retail',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Subscriptions',
  'AI Receipt Expense',
  'Other',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI / Digital' },
];

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  accounts,
  currency,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenReceiptScanner,
  activeAccountId,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>(activeAccountId || 'all');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all');

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  // Form Fields
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Food & Dining');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [formAccountId, setFormAccountId] = useState<string>(safeAccounts[0]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formMerchant, setFormMerchant] = useState('');

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchCategory = selectedCategory === 'all' || tx.category === selectedCategory;

      // Payment Method
      const matchPayment = selectedPaymentMethod === 'all' || tx.paymentMethod === selectedPaymentMethod;

      // Type
      const matchType = selectedType === 'all' || tx.type === selectedType;

      // Account
      const matchAccount = selectedAccount === 'all' || tx.accountId === selectedAccount;

      // Time Range
      let matchTime = true;
      if (timeRange !== 'all') {
        const txDate = new Date(tx.date).getTime();
        const now = new Date().getTime();
        const daysMap: Record<TimeRangeFilter, number> = {
          '7d': 7,
          '1m': 30,
          '3m': 90,
          '6m': 180,
          '1y': 365,
          'all': 99999,
        };
        const maxDays = daysMap[timeRange] || 99999;
        const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
        matchTime = diffDays <= maxDays;
      }

      return matchSearch && matchCategory && matchPayment && matchType && matchAccount && matchTime;
    });
  }, [transactions, searchQuery, selectedCategory, selectedPaymentMethod, selectedType, selectedAccount, timeRange]);

  const openAddModal = () => {
    setEditingTx(null);
    setFormDescription('');
    setFormAmount(0);
    setFormType('expense');
    setFormCategory('Food & Dining');
    setFormPaymentMethod('credit_card');
    setFormAccountId(activeAccountId || accounts[0]?.id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormMerchant('');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setFormDescription(tx.description);
    setFormAmount(tx.amount);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormPaymentMethod(tx.paymentMethod);
    setFormAccountId(tx.accountId);
    setFormDate(tx.date);
    setFormNotes(tx.notes || '');
    setFormMerchant(tx.merchant || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || formAmount <= 0) return;

    if (editingTx) {
      onUpdateTransaction({
        ...editingTx,
        description: formDescription.trim(),
        amount: Number(formAmount),
        type: formType,
        category: formCategory,
        paymentMethod: formPaymentMethod,
        accountId: formAccountId,
        date: formDate,
        notes: formNotes.trim(),
        merchant: formMerchant.trim(),
      });
    } else {
      onAddTransaction({
        description: formDescription.trim(),
        amount: Number(formAmount),
        type: formType,
        category: formCategory,
        paymentMethod: formPaymentMethod,
        accountId: formAccountId,
        date: formDate,
        notes: formNotes.trim(),
        merchant: formMerchant.trim(),
      });
    }

    setIsModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Account', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredTransactions.map((tx) => {
      const acc = safeAccounts.find((a) => a.id === tx.accountId)?.name || 'Account';
      return [
        tx.date,
        `"${acc}"`,
        tx.type,
        `"${tx.category}"`,
        `"${tx.description}"`,
        tx.amount,
        tx.paymentMethod,
        `"${tx.notes || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Transactions Directory
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Full audit log of incoming revenues and outgoing expenses ({filteredTransactions.length} items)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReceiptScanner}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Receipt Scanner</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        
        {/* Row 1: Search + Account + Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, merchant or notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category + Payment Method + Time Range Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['7d', '1m', '3m', '6m', '1y', 'all'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase transition cursor-pointer ${
                  timeRange === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No transactions match your filters
            </p>
            <p className="text-xs text-neutral-500 mt-1">Try clearing filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description / Merchant</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
                {filteredTransactions.map((tx) => {
                  const acc = safeAccounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-mono">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {tx.description}
                          </span>
                          {tx.isAiExtracted && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                              AI Receipt
                            </span>
                          )}
                        </div>
                        {tx.merchant && tx.merchant !== tx.description && (
                          <p className="text-[10px] text-neutral-400">{tx.merchant}</p>
                        )}
                        {tx.notes && (
                          <p className="text-[10px] text-neutral-400 italic truncate max-w-xs">{tx.notes}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: acc?.color || '#3B82F6' }}
                          />
                          <span>{acc?.name || 'Account'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 capitalize">
                        {tx.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold">
                        <span
                          className={
                            tx.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-900 dark:text-white'
                          }
                        >
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form for Add/Edit Transaction */}
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
              {editingTx ? 'Edit Transaction' : 'Log New Transaction'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    formType === 'expense'
                      ? 'bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Expense Out
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    formType === 'income'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Income In
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Title
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Whole Foods Organic Groceries"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assign Account
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Notes / Item Details
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Receipt #9021 or reimbursement pending"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer mt-2"
              >
                {editingTx ? 'Save Changes' : 'Create Transaction'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
