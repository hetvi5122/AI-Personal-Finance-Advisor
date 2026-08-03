import {
  UserAccount,
  UserProfile,
  Transaction,
  FinancialGoal,
  CurrencyCode,
  ChatMessage,
  AiFinancialReport,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_PROFILE,
} from '../data/mockData';

const STORAGE_KEYS = {
  PROFILE: 'fin_ai_profile_v1',
  ACCOUNTS: 'fin_ai_accounts_v1',
  TRANSACTIONS: 'fin_ai_transactions_v1',
  GOALS: 'fin_ai_goals_v1',
  CHAT: 'fin_ai_chat_v1',
  REPORT: 'fin_ai_report_v1',
  CURRENCY: 'fin_ai_currency_v1',
  ACTIVE_ACCOUNT: 'fin_ai_active_acc_v1',
  AUTH: 'fin_ai_authenticated_v1',
  USERS: 'fin_ai_users_v1',
};

// Safely getItem from localStorage
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch (e) {
    console.warn(`LocalStorage read error for ${key}:`, e);
    return fallback;
  }
}

// Safely setItem to localStorage
function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}:`, e);
  }
}

export interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

const DEFAULT_USERS: RegisteredUser[] = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan@fintech.ai',
    password: 'password123',
  },
];

export function getRegisteredUsers(): RegisteredUser[] {
  return safeGetItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
}

export function removeAllCreatedAccounts(): void {
  try {
    // Reset registered users to only default demo user
    safeSetItem(STORAGE_KEYS.USERS, DEFAULT_USERS);

    // Remove all user specific storage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fin_ai_user_data_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Reset default account balances & data to initial defaults
    safeSetItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
    safeSetItem(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    safeSetItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  } catch (e) {
    console.warn('Error removing created accounts:', e);
  }
}

export function saveRegisteredUser(user: RegisteredUser): void {
  const users = getRegisteredUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  safeSetItem(STORAGE_KEYS.USERS, users);
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  const users = getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export interface UserDataSet {
  profile: UserProfile;
  accounts: UserAccount[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  currency?: CurrencyCode;
  aiReport?: AiFinancialReport | null;
  chat?: ChatMessage[];
}

export function getUserDataByEmail(email: string): UserDataSet | null {
  if (!email) return null;
  const key = `fin_ai_user_data_${email.trim().toLowerCase()}`;
  return safeGetItem<UserDataSet | null>(key, null);
}

export function saveUserDataByEmail(email: string, data: UserDataSet): void {
  if (!email || !email.trim()) return;
  const key = `fin_ai_user_data_${email.trim().toLowerCase()}`;
  safeSetItem(key, data);
}

export function getStoredProfile(): UserProfile {
  return safeGetItem(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
}

export function saveStoredProfile(profile: UserProfile): void {
  safeSetItem(STORAGE_KEYS.PROFILE, profile);
}

export function getStoredAccounts(): UserAccount[] {
  return safeGetItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  safeSetItem(STORAGE_KEYS.ACCOUNTS, accounts);
}

export function getStoredTransactions(): Transaction[] {
  return safeGetItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  safeSetItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export function getStoredGoals(): FinancialGoal[] {
  return safeGetItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
}

export function saveStoredGoals(goals: FinancialGoal[]): void {
  safeSetItem(STORAGE_KEYS.GOALS, goals);
}

export function getStoredChat(): ChatMessage[] {
  return safeGetItem(STORAGE_KEYS.CHAT, [
    {
      id: 'msg_0',
      sender: 'assistant',
      text: "Hello Alex! I'm your AI Personal Finance Advisor. I've synced your accounts, transaction history, and goals. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How can I save $500 more each month?',
        'Can I afford a new car worth $35,000?',
        'Where should I invest my extra savings?',
        'Analyze my spending and reduce expenses',
      ],
    },
  ]);
}

export function saveStoredChat(messages: ChatMessage[]): void {
  safeSetItem(STORAGE_KEYS.CHAT, messages);
}

export function getStoredReport(): AiFinancialReport | null {
  const profile = getStoredProfile();
  if (profile && profile.email) {
    const userData = getUserDataByEmail(profile.email);
    if (userData && userData.aiReport !== undefined) {
      return userData.aiReport;
    }
  }
  return null;
}

export function saveStoredReport(report: AiFinancialReport | null): void {
  if (report === null) {
    localStorage.removeItem(STORAGE_KEYS.REPORT);
  } else {
    safeSetItem(STORAGE_KEYS.REPORT, report);
  }
  const profile = getStoredProfile();
  if (profile && profile.email) {
    const existing = getUserDataByEmail(profile.email);
    if (existing) {
      saveUserDataByEmail(profile.email, {
        ...existing,
        aiReport: report,
      });
    }
  }
}

export function getStoredCurrency(): CurrencyCode {
  return safeGetItem(STORAGE_KEYS.CURRENCY, 'INR');
}

export function saveStoredCurrency(currency: CurrencyCode): void {
  safeSetItem(STORAGE_KEYS.CURRENCY, currency);
}

export function getIsAuthenticated(): boolean {
  return safeGetItem(STORAGE_KEYS.AUTH, true); // default true for seamless initial preview, but user can sign out/in
}

export function setIsAuthenticated(auth: boolean): void {
  safeSetItem(STORAGE_KEYS.AUTH, auth);
}

export function resetAllData(): void {
  safeSetItem(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE);
  safeSetItem(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
  safeSetItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  safeSetItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
  localStorage.removeItem(STORAGE_KEYS.CHAT);
  localStorage.removeItem(STORAGE_KEYS.REPORT);
  safeSetItem(STORAGE_KEYS.CURRENCY, 'USD');
  safeSetItem(STORAGE_KEYS.AUTH, true);
}
