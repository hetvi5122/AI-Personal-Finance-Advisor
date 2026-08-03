import React, { useState, useEffect } from 'react';
import { X, User, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { UserProfile, RiskTolerance, InvestmentDuration, CurrencyCode } from '../types';
import { removeAllCreatedAccounts } from '../lib/storage';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  currency: CurrencyCode;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  currency,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Financial Profile Settings</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Update your income, liabilities, goals & risk parameters for tailored AI advice
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Doctor, Student"
                  value={formData.occupation || ''}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cash Flow & Balance Sheet */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              Monthly Cash Flow & Assets ({currency})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Monthly Net Income
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="0"
                  value={formData.monthlyIncome || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Monthly Expenses
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="0"
                  value={formData.monthlyExpenses || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Liquid Savings
                </label>
                <input
                  type="number"
                  step="500"
                  placeholder="0"
                  value={formData.currentSavings || ''}
                  onChange={(e) => setFormData({ ...formData, currentSavings: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Total Existing Debts / Loans
                </label>
                <input
                  type="number"
                  step="500"
                  placeholder="0"
                  value={formData.totalDebts || ''}
                  onChange={(e) => setFormData({ ...formData, totalDebts: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Total Investment Value (Stocks, Real Estate, Mutual Funds)
                </label>
                <input
                  type="number"
                  step="1000"
                  placeholder="0"
                  value={formData.totalInvestments || ''}
                  onChange={(e) => setFormData({ ...formData, totalInvestments: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Risk & Duration */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              Investment Appetite & Horizon
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Risk Tolerance
                </label>
                <select
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value as RiskTolerance })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low (Capital Preservation First)</option>
                  <option value="moderate">Moderate (Balanced Index & Bonds)</option>
                  <option value="high">High (Growth Stocks & Sector Funds)</option>
                  <option value="aggressive">Aggressive (High Return Alpha)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Investment Time Horizon
                </label>
                <select
                  value={formData.investmentDuration}
                  onChange={(e) => setFormData({ ...formData, investmentDuration: e.target.value as InvestmentDuration })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="short_term">Short Term (1 - 3 Years)</option>
                  <option value="medium_term">Medium Term (3 - 7 Years)</option>
                  <option value="long_term">Long Term (7+ Years / Retirement)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Goals Statement */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Financial Vision Statement
            </label>
            <textarea
              rows={3}
              value={formData.financialGoalsDescription}
              onChange={(e) => setFormData({ ...formData, financialGoalsDescription: e.target.value })}
              placeholder="e.g. Save $50,000 for house downpayment, maintain a 6-month emergency fund..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Section 5: Remove Created Accounts & Data Reset */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
              Danger Zone
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Delete all user-registered accounts and reset stored local data to default state.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all created accounts and reset local data?')) {
                  removeAllCreatedAccounts();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 font-semibold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove All Created Accounts</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Profile Parameters</span>
          </button>
        </form>

      </div>
    </div>
  );
};
