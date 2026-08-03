import React, { useState } from 'react';
import {
  Wallet,
  Sparkles,
  TrendingUp,
  Receipt,
  PieChart,
  FileText,
  Target,
  Bot,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { UserAccount, CurrencyCode, UserProfile } from '../types';
import { CURRENCIES, formatCurrency } from '../data/currencies';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accounts?: UserAccount[];
  activeAccountId?: string;
  setActiveAccountId?: (id: string) => void;
  currency?: CurrencyCode;
  setCurrency?: (currency: CurrencyCode) => void;
  userName?: string;
  userAvatar?: string;
  profile?: UserProfile;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  toggleDarkMode?: () => void;
  onOpenNewAccount?: () => void;
  onOpenAccountManager?: () => void;
  onOpenProfile?: () => void;
  onOpenProfileSettings?: () => void;
  onLogout?: () => void;
  onLogoutClick?: () => void;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  accounts = [],
  activeAccountId = '',
  setActiveAccountId = (_id: string) => {},
  currency = 'USD' as CurrencyCode,
  setCurrency = (_c: CurrencyCode) => {},
  userName,
  profile,
  onOpenNewAccount,
  onOpenAccountManager,
  onOpenProfile,
  onOpenProfileSettings,
  onLogout,
  onLogoutClick,
  isAuthenticated = false,
  onLoginClick = () => {},
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const activeAccount = safeAccounts.find((a) => a.id === activeAccountId) || safeAccounts[0];
  const nameToUse = userName || profile?.name || 'User';
  const handleOpenAccount = onOpenNewAccount || onOpenAccountManager || (() => {});
  const handleOpenProfile = onOpenProfile || onOpenProfileSettings || (() => {});
  const handleLogout = onLogout || onLogoutClick || (() => {});

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'report', label: 'AI Strategy Report', icon: FileText, badge: 'AI' },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'chat', label: 'AI Assistant', icon: Bot, badge: 'Co-Pilot' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Wallet className="w-5.5 h-5.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                    Wealth<span className="text-blue-600 dark:text-blue-400">AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <Sparkles className="w-2.5 h-2.5" />
                    Pro
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                  AI-Powered Financial Advisor
                </p>
              </div>
            </button>
          </div>

          {/* Account & Currency Controls (When authenticated) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-2">
              {/* Account Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeAccount?.color || '#3B82F6' }}
                  />
                  <span className="max-w-[120px] truncate">{activeAccount?.name || 'All Accounts'}</span>
                  <span className="text-neutral-400 dark:text-neutral-500 font-mono">
                    {activeAccount ? formatCurrency(activeAccount.balance, currency) : ''}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl p-1.5 z-50">
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      Switch Active Account
                    </div>
                    {safeAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setActiveAccountId(acc.id);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer transition ${
                          acc.id === activeAccountId
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: acc.color }}
                          />
                          <span className="truncate">{acc.name}</span>
                          {acc.isDefault && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-neutral-500 dark:text-neutral-400 ml-2">
                          {formatCurrency(acc.balance, currency)}
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowAccountDropdown(false);
                        handleOpenAccount();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add New Finance Account
                    </button>
                  </div>
                )}
              </div>

              {/* Currency Selector */}
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer appearance-none pr-7"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} ({c.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* User Controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {nameToUse.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline-block max-w-[100px] truncate">
                    {nameToUse}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl p-1.5 z-50">
                    <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 mb-1">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white">{nameToUse}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                        Personal Financial Profile
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      Edit Financial Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleOpenAccount();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      Manage Accounts
                    </button>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Sign In / Access Demo
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu (When authenticated) */}
        {isAuthenticated && (
          <nav className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-neutral-200/60 dark:border-neutral-800/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
