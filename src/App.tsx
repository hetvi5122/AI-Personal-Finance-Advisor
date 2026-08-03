import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { AccountManager } from './components/AccountManager';
import { ProfileSettings } from './components/ProfileSettings';
import { DashboardView } from './components/DashboardView';
import { TransactionManager } from './components/TransactionManager';
import { AnalyticsView } from './components/AnalyticsView';
import { AiFinancialReportView } from './components/AiFinancialReport';
import { GoalTracker } from './components/GoalTracker';
import { AiChatAssistant } from './components/AiChatAssistant';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';

import {
  getStoredProfile,
  saveStoredProfile,
  getStoredAccounts,
  saveStoredAccounts,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredGoals,
  saveStoredGoals,
  getStoredReport,
  saveStoredReport,
  getStoredCurrency,
  saveStoredCurrency,
  getUserDataByEmail,
  saveUserDataByEmail,
} from './lib/storage';

import {
  INITIAL_USER_PROFILE,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
} from './data/mockData';

import {
  UserProfile,
  UserAccount,
  Transaction,
  FinancialGoal,
  AiFinancialReport,
  CurrencyCode,
} from './types';

export function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default to true for instant showcase experience
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application View Tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Domain state
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [accounts, setAccounts] = useState<UserAccount[]>(getStoredAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions());
  const [goals, setGoals] = useState<FinancialGoal[]>(getStoredGoals());
  const [aiReport, setAiReport] = useState<AiFinancialReport | null>(getStoredReport());

  // Currency
  const [currency, setCurrencyState] = useState<CurrencyCode>(getStoredCurrency() || profile.preferredCurrency || 'INR');

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    saveStoredCurrency(c);
  };

  // Active account selection
  const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
  const [activeAccountId, setActiveAccountId] = useState<string>(defaultAcc?.id || '');

  // Modals state
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-sync active user data to per-user key
  useEffect(() => {
    if (profile && profile.email) {
      saveUserDataByEmail(profile.email, {
        profile,
        accounts,
        transactions,
        goals,
        currency,
        aiReport,
      });
    }
  }, [profile, accounts, transactions, goals, currency, aiReport]);

  // Persistent storage sync
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
    setCurrency(updated.preferredCurrency);
  };

  const handleUpdateAccounts = (updatedAccounts: UserAccount[]) => {
    setAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);
  };

  const handleAddAccount = (newAccData: Omit<UserAccount, 'id'>) => {
    const newAcc: UserAccount = {
      ...newAccData,
      id: `acc_${Date.now()}`,
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveStoredAccounts(updated);
  };

  const handleUpdateAccount = (updatedAcc: UserAccount) => {
    const updated = accounts.map((a) => (a.id === updatedAcc.id ? updatedAcc : a));
    setAccounts(updated);
    saveStoredAccounts(updated);
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    saveStoredAccounts(updated);
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveStoredTransactions(updated);

    // Update corresponding account balance
    const targetAcc = accounts.find((a) => a.id === newTx.accountId);
    if (targetAcc) {
      const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
      const updatedAccounts = accounts.map((a) =>
        a.id === newTx.accountId ? { ...a, balance: a.balance + delta } : a
      );
      setAccounts(updatedAccounts);
      saveStoredAccounts(updatedAccounts);
    }
  };

  const handleUpdateTransaction = (tx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === tx.id);
    const updated = transactions.map((t) => (t.id === tx.id ? tx : t));
    setTransactions(updated);
    saveStoredTransactions(updated);

    // Recalculate account balance differences if amount or type changed
    if (oldTx) {
      const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
      const newDelta = tx.type === 'income' ? tx.amount : -tx.amount;
      const diff = newDelta - oldDelta;

      const updatedAccounts = accounts.map((a) =>
        a.id === tx.accountId ? { ...a, balance: a.balance + diff } : a
      );
      setAccounts(updatedAccounts);
      saveStoredAccounts(updatedAccounts);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);

    // Revert balance on delete
    if (tx) {
      const revertDelta = tx.type === 'income' ? -tx.amount : tx.amount;
      const updatedAccounts = accounts.map((a) =>
        a.id === tx.accountId ? { ...a, balance: a.balance + revertDelta } : a
      );
      setAccounts(updatedAccounts);
      saveStoredAccounts(updatedAccounts);
    }
  };

  const handleAddGoal = (gData: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...gData,
      id: `goal_${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveStoredGoals(updated);
  };

  const handleUpdateGoal = (g: FinancialGoal) => {
    const updated = goals.map((item) => (item.id === g.id ? g : item));
    setGoals(updated);
    saveStoredGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveStoredGoals(updated);
  };

  const handleSaveReport = (rep: AiFinancialReport) => {
    setAiReport(rep);
    saveStoredReport(rep);
    if (profile && profile.email) {
      saveUserDataByEmail(profile.email, {
        profile,
        accounts,
        transactions,
        goals,
        currency,
        aiReport: rep,
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased transition-colors duration-200">
      
      {/* Universal Navigation Header */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          setIsAuthenticated(false);
          setAiReport(null);
          saveStoredReport(null);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        accounts={accounts}
        activeAccountId={activeAccountId}
        setActiveAccountId={setActiveAccountId}
        currency={currency}
        setCurrency={setCurrency}
        userName={profile.name}
        onOpenNewAccount={() => setIsAccountManagerOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {!isAuthenticated ? (
          <LandingPage
            onStartDemo={() => {
              setIsAuthenticated(true);
              setProfile(INITIAL_USER_PROFILE);
              setAccounts(INITIAL_ACCOUNTS);
              setTransactions(INITIAL_TRANSACTIONS);
              setGoals(INITIAL_GOALS);
              setAiReport(null);
              saveStoredProfile(INITIAL_USER_PROFILE);
              saveStoredAccounts(INITIAL_ACCOUNTS);
              saveStoredTransactions(INITIAL_TRANSACTIONS);
              saveStoredGoals(INITIAL_GOALS);
              saveStoredReport(null);
              if (INITIAL_ACCOUNTS[0]) {
                setActiveAccountId(INITIAL_ACCOUNTS[0].id);
              }
            }}
            onLoginClick={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                accounts={accounts}
                transactions={transactions}
                goals={goals}
                currency={currency}
                onOpenAddTransaction={() => setActiveTab('transactions')}
                onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNewAccount={() => setIsAccountManagerOpen(true)}
                activeAccountId={activeAccountId}
                setActiveAccountId={setActiveAccountId}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionManager
                transactions={transactions}
                accounts={accounts}
                currency={currency}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
                activeAccountId={activeAccountId}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                transactions={transactions}
                currency={currency}
                profile={profile}
              />
            )}

            {activeTab === 'report' && (
              <AiFinancialReportView
                report={aiReport}
                onSaveReport={handleSaveReport}
                profile={profile}
                accounts={accounts}
                transactions={transactions}
                goals={goals}
                currency={currency}
              />
            )}

            {activeTab === 'goals' && (
              <GoalTracker
                goals={goals}
                currency={currency}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {activeTab === 'chat' && (
              <AiChatAssistant
                profile={profile}
                accounts={accounts}
                transactions={transactions}
                goals={goals}
                currency={currency}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={(name, email, isDemo) => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          if (isDemo) {
            setProfile(INITIAL_USER_PROFILE);
            setAccounts(INITIAL_ACCOUNTS);
            setTransactions(INITIAL_TRANSACTIONS);
            setGoals(INITIAL_GOALS);
            setAiReport(null);
            saveStoredProfile(INITIAL_USER_PROFILE);
            saveStoredAccounts(INITIAL_ACCOUNTS);
            saveStoredTransactions(INITIAL_TRANSACTIONS);
            saveStoredGoals(INITIAL_GOALS);
            saveStoredReport(null);
            if (INITIAL_ACCOUNTS[0]) {
              setActiveAccountId(INITIAL_ACCOUNTS[0].id);
            }
          } else {
            const cleanEmail = (email || '').trim().toLowerCase();
            const existingUserData = getUserDataByEmail(cleanEmail);

            if (existingUserData && existingUserData.profile) {
              // Restore existing user's saved profile, created accounts, transactions, goals, and report
              setProfile(existingUserData.profile);
              setAccounts(existingUserData.accounts || []);
              setTransactions(existingUserData.transactions || []);
              setGoals(existingUserData.goals || []);
              const restoredReport = existingUserData.aiReport || null;
              setAiReport(restoredReport);
              if (existingUserData.currency) {
                setCurrency(existingUserData.currency);
              }
              saveStoredProfile(existingUserData.profile);
              saveStoredAccounts(existingUserData.accounts || []);
              saveStoredTransactions(existingUserData.transactions || []);
              saveStoredGoals(existingUserData.goals || []);
              saveStoredReport(restoredReport);
              if (existingUserData.accounts && existingUserData.accounts.length > 0) {
                setActiveAccountId(existingUserData.accounts[0].id);
              }
            } else if (profile.email && profile.email.trim().toLowerCase() === cleanEmail && accounts.length > 0) {
              saveUserDataByEmail(cleanEmail, {
                profile,
                accounts,
                transactions,
                goals,
                currency,
                aiReport,
              });
            } else {
              // Brand new user account: initialize setup and open modal to fill details
              const customProfile: UserProfile = {
                id: `usr_${Date.now()}`,
                name: name || '',
                email: cleanEmail,
                age: 0,
                occupation: '',
                monthlyIncome: 0,
                monthlyExpenses: 0,
                currentSavings: 0,
                totalDebts: 0,
                totalInvestments: 0,
                financialGoalsDescription: '',
                riskTolerance: 'moderate',
                investmentDuration: 'medium_term',
                preferredCurrency: currency || 'INR',
              };
              const customAcc: UserAccount = {
                id: `acc_${Date.now()}`,
                name: 'Primary Checking',
                type: 'personal',
                balance: 0,
                currency: currency || 'INR',
                isDefault: true,
                accountNumber: '••• 1001',
                color: '#3B82F6',
              };
              setProfile(customProfile);
              saveStoredProfile(customProfile);
              setAccounts([customAcc]);
              saveStoredAccounts([customAcc]);
              setActiveAccountId(customAcc.id);
              setTransactions([]);
              saveStoredTransactions([]);
              setGoals([]);
              saveStoredGoals([]);
              setAiReport(null);
              saveStoredReport(null);

              saveUserDataByEmail(cleanEmail, {
                profile: customProfile,
                accounts: [customAcc],
                transactions: [],
                goals: [],
                currency: currency || 'INR',
                aiReport: null,
              });

              setIsProfileModalOpen(true);
            }
          }
        }}
        onSuccess={() => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
      />

      <AccountManager
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onUpdateAccount={handleUpdateAccount}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccounts={handleUpdateAccounts}
        currency={currency}
      />

      <ProfileSettings
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
        currency={currency}
      />

      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        activeAccountId={activeAccountId}
        currency={currency}
      />

    </div>
  );
}

export default App;
