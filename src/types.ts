export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'SGD' | 'AED';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // For conversions
}

export type AccountType = 'personal' | 'work' | 'business' | 'savings' | 'investment';

export interface UserAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  isDefault: boolean;
  accountNumber: string;
  color: string;
}

export type RiskTolerance = 'low' | 'moderate' | 'high' | 'aggressive';
export type InvestmentDuration = 'short_term' | 'medium_term' | 'long_term';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  totalDebts: number;
  totalInvestments: number;
  financialGoalsDescription: string;
  riskTolerance: RiskTolerance;
  investmentDuration: InvestmentDuration;
  preferredCurrency: CurrencyCode;
  avatarUrl?: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Housing & Rent'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Shopping & Retail'
  | 'Healthcare'
  | 'Entertainment'
  | 'Education'
  | 'Travel'
  | 'Subscriptions'
  | 'AI Receipt Expense'
  | 'Other';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'upi';

export interface TransactionItem {
  description: string;
  amount: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptUrl?: string;
  isAiExtracted?: boolean;
  merchant?: string;
}

export type GoalCategory =
  | 'house'
  | 'car'
  | 'education'
  | 'retirement'
  | 'emergency_fund'
  | 'vacation'
  | 'investment'
  | 'other';

export interface FinancialGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  priority: 'low' | 'medium' | 'high';
  aiSuggestion?: string;
}

export interface BudgetBreakdownItem {
  category: string;
  spent: number;
  recommended: number;
  status: 'optimal' | 'warning' | 'overbudget';
}

export interface InvestmentSuggestion {
  title: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  expectedReturn: string;
  rationale: string;
}

export interface AiFinancialReport {
  userEmail?: string;
  userName?: string;
  generatedAt: string;
  healthScore: number; // 0 - 100
  status: 'excellent' | 'good' | 'fair' | 'needs_attention';
  summary: string;
  budgetBreakdown: BudgetBreakdownItem[];
  expenseAnalysis: string[];
  savingsRecommendations: string[];
  cashFlowAnalysis: string;
  emergencyFundRecommendation: {
    recommendedMonths: number;
    targetAmount: number;
    currentAmount: number;
    status: string;
  };
  debtRepaymentStrategy: string[];
  investmentSuggestions: InvestmentSuggestion[];
  spendingInsights: string[];
  goalPlanningTips: string[];
  projections: {
    oneYearSavings: number;
    fiveYearSavings: number;
    summary: string;
  };
  personalizedActionItems: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export type TimeRangeFilter = '7d' | '1m' | '3m' | '6m' | '1y' | 'all';
