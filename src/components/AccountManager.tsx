import React, { useState } from 'react';
import { X, Plus, Trash2, Check, CreditCard, Building, Shield, Landmark, Edit3, DollarSign, Save, PlusCircle } from 'lucide-react';
import { UserAccount, AccountType, CurrencyCode } from '../types';
import { CURRENCIES, formatCurrency } from '../data/currencies';

interface AccountManagerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: UserAccount[];
  onAddAccount?: (acc: Omit<UserAccount, 'id'>) => void;
  onUpdateAccount?: (acc: UserAccount) => void;
  onDeleteAccount?: (id: string) => void;
  onUpdateAccounts?: (accs: UserAccount[]) => void;
  currency?: CurrencyCode;
}

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
];

export const AccountManager: React.FC<AccountManagerProps> = ({
  isOpen,
  onClose,
  accounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUpdateAccounts,
  currency = 'INR' as CurrencyCode,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('personal');
  const [balance, setBalance] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState('••• ' + Math.floor(1000 + Math.random() * 9000));
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  // Edit Mode state
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('personal');
  const [editBalance, setEditBalance] = useState<string>('0');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editColor, setEditColor] = useState(COLOR_OPTIONS[0]);

  // Add Amount state
  const [addingAmountAccountId, setAddingAmountAccountId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState<string>('');

  if (!isOpen) return null;

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAccData = {
      name: name.trim(),
      type,
      balance: Number(balance) || 0,
      currency,
      isDefault: safeAccounts.length === 0,
      accountNumber,
      color,
    };

    if (onAddAccount) {
      onAddAccount(newAccData);
    } else if (onUpdateAccounts) {
      onUpdateAccounts([
        ...safeAccounts,
        { ...newAccData, id: `acc_${Date.now()}` },
      ]);
    }

    setName('');
    setBalance(0);
    setShowAddForm(false);
  };

  const handleStartEdit = (acc: UserAccount) => {
    setEditingAccountId(acc.id);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditBalance(acc.balance ? String(acc.balance) : '0');
    setEditAccountNumber(acc.accountNumber || '');
    setEditColor(acc.color || COLOR_OPTIONS[0]);
    setAddingAmountAccountId(null);
  };

  const handleSaveEdit = (e: React.FormEvent, acc: UserAccount) => {
    e.preventDefault();
    const updatedAcc: UserAccount = {
      ...acc,
      name: editName.trim() || acc.name,
      type: editType,
      balance: parseFloat(editBalance) || 0,
      accountNumber: editAccountNumber || acc.accountNumber,
      color: editColor,
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAcc);
    } else if (onUpdateAccounts) {
      onUpdateAccounts(
        safeAccounts.map((a) => (a.id === acc.id ? updatedAcc : a))
      );
    }
    setEditingAccountId(null);
  };

  const handleStartAddAmount = (acc: UserAccount) => {
    setAddingAmountAccountId(acc.id);
    setAmountToAdd('');
    setEditingAccountId(null);
  };

  const handleSaveAddAmount = (e: React.FormEvent, acc: UserAccount) => {
    e.preventDefault();
    const val = parseFloat(amountToAdd);
    if (isNaN(val) || val === 0) return;

    const updatedAcc: UserAccount = {
      ...acc,
      balance: (acc.balance || 0) + val,
    };

    if (onUpdateAccount) {
      onUpdateAccount(updatedAcc);
    } else if (onUpdateAccounts) {
      onUpdateAccounts(
        safeAccounts.map((a) => (a.id === acc.id ? updatedAcc : a))
      );
    }

    setAddingAmountAccountId(null);
    setAmountToAdd('');
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'savings':
        return Shield;
      case 'work':
      case 'business':
        return Building;
      case 'investment':
        return Landmark;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Finance Accounts Hub</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage balances, edit accounts & track personal, work, business funds
            </p>
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-4 mb-6">
          {safeAccounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const isEditing = editingAccountId === acc.id;
            const isAddingAmount = addingAmountAccountId === acc.id;

            return (
              <div
                key={acc.id}
                className={`p-4 rounded-2xl border transition ${
                  acc.isDefault
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200/80 dark:border-neutral-700/80'
                }`}
              >
                {/* Default view row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{acc.name}</p>
                        {acc.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            Default Account
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                        {acc.type} • {acc.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                      {formatCurrency(acc.balance, currency)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {!acc.isDefault && (
                        <button
                          onClick={() => {
                            const updated = safeAccounts.map((a) => ({
                              ...a,
                              isDefault: a.id === acc.id,
                            }));
                            if (onUpdateAccounts) {
                              onUpdateAccounts(updated);
                            } else if (onUpdateAccount) {
                              updated.forEach((a) => onUpdateAccount(a));
                            }
                          }}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      {safeAccounts.length > 1 && !acc.isDefault && (
                        <button
                          onClick={() => {
                            if (onDeleteAccount) {
                              onDeleteAccount(acc.id);
                            } else if (onUpdateAccounts) {
                              onUpdateAccounts(safeAccounts.filter((a) => a.id !== acc.id));
                            }
                          }}
                          className="text-neutral-400 hover:text-red-500 transition cursor-pointer p-1"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar for each account (both default and other accounts) */}
                {!isEditing && !isAddingAmount && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60">
                    <button
                      onClick={() => handleStartAddAmount(acc)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Add Amount</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(acc)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Edit Account</span>
                    </button>
                  </div>
                )}

                {/* Inline Quick Add Amount Panel */}
                {isAddingAmount && (
                  <form onSubmit={(e) => handleSaveAddAmount(e, acc)} className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Add Funds to {acc.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingAmountAccountId(null)}
                        className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        required
                        autoFocus
                        placeholder="Enter amount to add"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 shrink-0">Presets:</span>
                      {[500, 1000, 5000, 10000, 50000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmountToAdd(String(preset))}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer text-neutral-700 dark:text-neutral-300 shrink-0"
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {/* Inline Full Edit Form */}
                {isEditing && (
                  <form onSubmit={(e) => handleSaveEdit(e, acc)} className="mt-3 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        Edit Account: {acc.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingAccountId(null)}
                        className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Account Type
                        </label>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as AccountType)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="personal">Personal</option>
                          <option value="savings">Savings Vault</option>
                          <option value="work">Work / Freelance</option>
                          <option value="business">Business</option>
                          <option value="investment">Investment Portfolio</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Total Balance ({currency})
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Account Number / Mask
                        </label>
                        <input
                          type="text"
                          value={editAccountNumber}
                          onChange={(e) => setEditAccountNumber(e.target.value)}
                          placeholder="e.g. ••• 8842"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Accent Color
                        </label>
                        <div className="flex gap-1.5 pt-1">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className="w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer"
                              style={{ backgroundColor: c }}
                            >
                              {editColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingAccountId(null)}
                        className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium text-xs hover:bg-neutral-300 dark:hover:bg-neutral-600 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Account</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Account Toggle Button */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Finance Account</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAccount} className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Create Account
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Business Checking or Crypto Wallet"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="savings">Savings Vault</option>
                  <option value="work">Work / Freelance</option>
                  <option value="business">Business</option>
                  <option value="investment">Investment Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Initial Balance ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balance}
                  onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition cursor-pointer"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
            >
              Save Account
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

