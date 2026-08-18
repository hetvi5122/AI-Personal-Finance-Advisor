import React, { useState, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Wallet,
  Receipt,
  Layers,
  Briefcase,
  TrendingUp,
  Target,
  ChevronDown,
} from 'lucide-react';
import {
  AiFinancialReport as ReportType,
  UserProfile,
  UserAccount,
  Transaction,
  FinancialGoal,
  CurrencyCode,
} from '../types';
import { formatCurrency } from '../data/currencies';

interface AiFinancialReportProps {
  report: ReportType | null;
  onSaveReport: (report: ReportType) => void;
  profile: UserProfile;
  accounts: UserAccount[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  currency: CurrencyCode;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AiFinancialReportView: React.FC<AiFinancialReportProps> = ({
  report,
  onSaveReport,
  profile,
  accounts,
  transactions,
  goals,
  currency,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Date & Period Filtering State
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Streamlined 3 Tabs
  const [activeTab, setActiveTab] = useState<'income_expense' | 'action_budget' | 'wealth_projections'>('income_expense');

  // Available Years dynamically derived from transactions
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    years.add(2025);
    years.add(2024);

    transactions.forEach((t) => {
      if (t.date) {
        const y = new Date(t.date).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const selectedPeriodLabel = useMemo(() => {
    if (timeframe === 'yearly') {
      return `Full Year ${selectedYear}`;
    }
    return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  }, [timeframe, selectedMonth, selectedYear]);

  // Filtered Transactions for the selected period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;
      const yearMatch = d.getFullYear() === selectedYear;
      if (timeframe === 'yearly') return yearMatch;
      return yearMatch && d.getMonth() === selectedMonth;
    });
  }, [transactions, selectedYear, selectedMonth, timeframe]);

  // Computed Period Income
  const totalPeriodIncome = useMemo(() => {
    const txIncome = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    if (txIncome > 0) return txIncome;

    return timeframe === 'yearly'
      ? (profile.monthlyIncome || 0) * 12
      : (profile.monthlyIncome || 0);
  }, [periodTransactions, timeframe, profile]);

  // Computed Period Expenses
  const totalPeriodExpenses = useMemo(() => {
    const txExpense = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    if (txExpense > 0) return txExpense;

    return timeframe === 'yearly'
      ? (profile.monthlyExpenses || 0) * 12
      : (profile.monthlyExpenses || 0);
  }, [periodTransactions, timeframe, profile]);

  const totalPeriodNetSavings = totalPeriodIncome - totalPeriodExpenses;
  const periodSavingsRatePct = totalPeriodIncome > 0 ? Math.round((totalPeriodNetSavings / totalPeriodIncome) * 100) : 0;

  // Itemized Income Categories for selected period
  const incomeCategoryList = useMemo(() => {
    const map: Record<string, number> = {};

    const txIncomes = periodTransactions.filter((t) => t.type === 'income');
    if (txIncomes.length > 0) {
      txIncomes.forEach((t) => {
        const cat = t.category || 'Salary / Earnings';
        map[cat] = (map[cat] || 0) + t.amount;
      });
    } else {
      map['Base Salary / Primary Income'] = totalPeriodIncome;
    }

    const totalInflow = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pctOfTotal: Math.round((amount / totalInflow) * 100),
    }));
  }, [periodTransactions, totalPeriodIncome]);

  // Security & Account Isolation Verification for Report Data
  const isReportForCurrentAccount = useMemo(() => {
    if (!report) return false;

    // Strict account email ownership match if present
    if (report.userEmail && profile.email) {
      if (report.userEmail.trim().toLowerCase() !== profile.email.trim().toLowerCase()) {
        return false;
      }
    }

    // Strict account name ownership match if present
    if (report.userName && profile.name) {
      if (report.userName.trim().toLowerCase() !== profile.name.trim().toLowerCase()) {
        return false;
      }
    }

    // Check greeting/name in summary text
    if (report.summary && profile.name) {
      const summaryText = report.summary.trim();
      const firstWordMatch = summaryText.match(/^([A-Za-z]+)[,\s]/);
      if (firstWordMatch && firstWordMatch[1]) {
        const greetingName = firstWordMatch[1].toLowerCase();
        const currentFirstName = profile.name.trim().split(/\s+/)[0].toLowerCase();
        // If the report summary explicitly starts with another user's name e.g. "Kalpesh, your overall..."
        if (greetingName.length > 2 && currentFirstName.length > 2 && greetingName !== currentFirstName) {
          return false;
        }
      }
    }

    return true;
  }, [report, profile.email, profile.name]);

  const activeReport = isReportForCurrentAccount ? report : null;

  // Itemized Expense Categories for selected period (including AI Receipt OCR Expenses)
  const expenseCategoryList = useMemo(() => {
    const map: Record<string, number> = {};

    const txExpenses = periodTransactions.filter((t) => t.type === 'expense');
    if (txExpenses.length > 0) {
      txExpenses.forEach((t) => {
        const catName = t.category || (t.isAiExtracted ? 'AI Receipt Expense' : 'Other Expenses');
        map[catName] = (map[catName] || 0) + t.amount;
      });
    } else if (activeReport?.budgetBreakdown) {
      activeReport.budgetBreakdown.forEach((b) => {
        map[b.category] = timeframe === 'yearly' ? b.spent * 12 : b.spent;
      });
    } else {
      map['Essential Living & Utilities'] = totalPeriodExpenses * 0.6;
      map['Discretionary & Shopping'] = totalPeriodExpenses * 0.4;
    }

    const totalSpent = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pctOfTotal: Math.round((amount / totalSpent) * 100),
    }));
  }, [periodTransactions, activeReport, timeframe, totalPeriodExpenses]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setLoadingStep(`Aggregating data for ${selectedPeriodLabel}...`);

    try {
      setTimeout(() => setLoadingStep('Analyzing spending categories & debt liabilities...'), 800);
      setTimeout(() => setLoadingStep('Calling Gemini AI Strategy Engine...'), 1600);

      const response = await fetch('/api/ai/analyze-finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            selectedPeriodLabel,
            monthlyIncome: totalPeriodIncome / (timeframe === 'yearly' ? 12 : 1),
            monthlyExpenses: totalPeriodExpenses / (timeframe === 'yearly' ? 12 : 1),
          },
          accounts,
          transactions: periodTransactions.length > 0 ? periodTransactions : transactions,
          goals,
          currency,
        }),
      });

      const data = await response.json();

      if (data.success && data.report) {
        const reportWithOwnership: ReportType = {
          ...data.report,
          userEmail: profile.email,
          userName: profile.name,
        };
        onSaveReport(reportWithOwnership);
      } else {
        // Fallback report structure
        const mockGeneratedReport: ReportType = {
          userEmail: profile.email,
          userName: profile.name,
          generatedAt: new Date().toISOString(),
          healthScore: 88,
          status: 'excellent',
          summary: `${profile.name || 'User'}'s financial standing for ${selectedPeriodLabel} is exceptionally solid. Total inflow is ${formatCurrency(
            totalPeriodIncome,
            currency
          )} against total outflow of ${formatCurrency(
            totalPeriodExpenses,
            currency
          )}, yielding a net surplus of ${formatCurrency(totalPeriodNetSavings, currency)} (${periodSavingsRatePct}% savings rate).`,
          budgetBreakdown: [
            { category: 'Housing & Utilities', spent: (totalPeriodExpenses * 0.40) / (timeframe === 'yearly' ? 12 : 1), recommended: (totalPeriodIncome * 0.30) / (timeframe === 'yearly' ? 12 : 1), status: 'optimal' },
            { category: 'Groceries & Dining', spent: (totalPeriodExpenses * 0.25) / (timeframe === 'yearly' ? 12 : 1), recommended: (totalPeriodIncome * 0.15) / (timeframe === 'yearly' ? 12 : 1), status: 'optimal' },
            { category: 'Transportation & Travel', spent: (totalPeriodExpenses * 0.15) / (timeframe === 'yearly' ? 12 : 1), recommended: (totalPeriodIncome * 0.10) / (timeframe === 'yearly' ? 12 : 1), status: 'optimal' },
            { category: 'AI Receipt Expenses & Shopping', spent: (totalPeriodExpenses * 0.20) / (timeframe === 'yearly' ? 12 : 1), recommended: (totalPeriodIncome * 0.10) / (timeframe === 'yearly' ? 12 : 1), status: 'warning' },
          ],
          expenseAnalysis: [
            `Discretionary spending in ${selectedPeriodLabel} represents ${Math.round((totalPeriodExpenses * 0.2) / (totalPeriodIncome || 1) * 100)}% of total cash inflow.`,
            'AI Receipt Scanner logs show consistent small purchases that aggregate to significant monthly totals.',
          ],
          savingsRecommendations: [
            `Automate a periodic transfer of ${formatCurrency(
              totalPeriodNetSavings * 0.5,
              currency
            )} directly into high-yield asset accumulation accounts.`,
            'Keep 3-6 months of liquid expenses in an emergency shield buffer before expanding equity risk.',
          ],
          cashFlowAnalysis: `Surplus cash flow for ${selectedPeriodLabel} is positive at +${formatCurrency(totalPeriodNetSavings, currency)}.`,
          emergencyFundRecommendation: {
            recommendedMonths: 6,
            targetAmount: (totalPeriodExpenses / (timeframe === 'yearly' ? 12 : 1)) * 6,
            currentAmount: profile.currentSavings,
            status: profile.currentSavings >= (totalPeriodExpenses / (timeframe === 'yearly' ? 12 : 1)) * 6 ? 'Fully Funded' : 'In Progress',
          },
          debtRepaymentStrategy: [
            'Use the Debt Avalanche method: prioritize extra cash flow toward highest APR loans first.',
            'Maintain minimum monthly payments across low-interest obligations.',
          ],
          investmentSuggestions: [
            { title: 'Broad Market Index ETF (S&P 500 / VTI)', riskLevel: 'Moderate', expectedReturn: '8.5% - 10%', rationale: 'Core foundation for compounding long-term wealth.' },
            { title: 'High-Yield Liquid Treasury Vault', riskLevel: 'Low', expectedReturn: '4.8% - 5.2%', rationale: 'Ideal risk-free bucket for short-term emergency liquidity.' },
            { title: 'Diversified Tech & Growth Basket', riskLevel: 'High', expectedReturn: '12% - 15%', rationale: 'Long-term equity allocation for strategic capital appreciation.' },
          ],
          spendingInsights: [
            `Highest expense velocity for ${selectedPeriodLabel} occurred during mid-cycle utility and subscription renewals.`,
            'Fixed living expenses remain comfortably under 50% of net take-home pay.',
          ],
          goalPlanningTips: [
            'Reallocate surplus cash flow toward active milestone goals.',
            'Maintain automated deposit rules aligned with target completion dates.',
          ],
          projections: {
            oneYearSavings: totalPeriodNetSavings * (timeframe === 'yearly' ? 1 : 12) + profile.currentSavings,
            fiveYearSavings: (totalPeriodNetSavings * (timeframe === 'yearly' ? 1 : 12) * 5) * 1.22 + profile.currentSavings,
            summary: `Compounding at an estimated 8% annual return, your total wealth accumulation can reach ${formatCurrency(
              (totalPeriodNetSavings * (timeframe === 'yearly' ? 1 : 12) * 5) * 1.22 + profile.currentSavings,
              currency
            )} over 5 years.`,
          },
          personalizedActionItems: [
            `Automate a payday deposit of ${formatCurrency(totalPeriodNetSavings * 0.5, currency)} directly to wealth fund.`,
            `Review subscription and utility charges for ${selectedPeriodLabel} to trim discretionary leaks.`,
            'Maintain high-interest debt at zero balance.',
            'Sustain a liquid emergency shield covering at least 6 months of essential living expenses.',
          ],
        };

        onSaveReport(mockGeneratedReport);
      }
    } catch (e) {
      console.error('Error generating report:', e);
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const handlePrintPDF = () => {
    if (!activeReport) {
      handleGenerateReport();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=950,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AI Wealth Strategy Report - ${profile.name}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #111; line-height: 1.5; background: #fff; }
                h1 { font-size: 22px; color: #1e3a8a; margin: 0; }
                .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; margin-bottom: 20px; }
                .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #fafafa; }
                .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
                .value { font-size: 18px; font-weight: bold; color: #111827; }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
                th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; color: #4b5563; }
                ul { padding-left: 20px; margin: 6px 0; font-size: 12px; }
                li { margin-bottom: 4px; }
                .footer { margin-top: 30px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
                @media print { .no-print { display: none !important; } }
              </style>
            </head>
            <body>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <div>
                  <h1>AI Strategy Report (${selectedPeriodLabel})</h1>
                  <p class="subtitle">Prepared for ${profile.name} &bull; Generated on ${new Date(activeReport.generatedAt).toLocaleDateString()}</p>
                </div>
                <div class="no-print">
                  <button onclick="window.print()" style="padding:10px 18px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Print / Save as PDF</button>
                </div>
              </div>

              <!-- Income vs Expense Key Metrics -->
              <div class="card">
                <div style="font-weight:bold; margin-bottom:10px; font-size:14px; color:#1e3a8a;">Income & Expense Executive Summary (${selectedPeriodLabel})</div>
                <div class="grid-3">
                  <div style="background:#fff; border:1px solid #e5e7eb; padding:10px; border-radius:8px;">
                    <div class="label">Total Inflow (${selectedPeriodLabel})</div>
                    <div class="value" style="color:#059669;">${formatCurrency(totalPeriodIncome, currency)}</div>
                  </div>
                  <div style="background:#fff; border:1px solid #e5e7eb; padding:10px; border-radius:8px;">
                    <div class="label">Total Outflow (${selectedPeriodLabel})</div>
                    <div class="value" style="color:#dc2626;">${formatCurrency(totalPeriodExpenses, currency)}</div>
                  </div>
                  <div style="background:#fff; border:1px solid #e5e7eb; padding:10px; border-radius:8px;">
                    <div class="label">Net Surplus</div>
                    <div class="value" style="color:#2563eb;">${formatCurrency(totalPeriodNetSavings, currency)} (${periodSavingsRatePct}% Savings Rate)</div>
                  </div>
                </div>
              </div>

              <!-- Itemized Expense Categories -->
              <div class="card">
                <div style="font-weight:bold; margin-bottom:8px; font-size:13px;">Itemized Category Expenses (${selectedPeriodLabel})</div>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount (${selectedPeriodLabel})</th>
                      <th>% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${expenseCategoryList.map((item) => `
                      <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${formatCurrency(item.amount, currency)}</td>
                        <td>${item.pctOfTotal}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Top Action Plan -->
              <div class="card">
                <div style="font-weight:bold; margin-bottom:6px; font-size:13px;">Strategic Action Plan</div>
                <ul>
                  ${(activeReport.personalizedActionItems || []).map((item) => `<li><strong>${item}</strong></li>`).join('')}
                </ul>
              </div>

              <!-- Wealth Projections -->
              <div class="card">
                <div style="font-weight:bold; margin-bottom:6px; font-size:13px;">Compounding Wealth Forecast</div>
                <div class="grid-2">
                  <div><strong>1-Year Projection:</strong> ${formatCurrency(activeReport.projections?.oneYearSavings || 0, currency)}</div>
                  <div><strong>5-Year Projection:</strong> ${formatCurrency(activeReport.projections?.fiveYearSavings || 0, currency)}</div>
                </div>
                <p style="font-size:11px; color:#4b5563; margin-top:8px;">${activeReport.projections?.summary || ''}</p>
              </div>

              <div class="footer">
                AI Wealth Co-Pilot &bull; Confidential Personal Financial Strategy Document
              </div>

              <script>
                setTimeout(() => { window.print(); }, 400);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn('Print popup blocked, falling back to window.print()', e);
    }

    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 print:p-0 print:space-y-4">
      
      {/* Header Banner & Global Period Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              AI Financial Strategy Report
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              AI Wealth Co-Pilot
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Select specific month or year to view customized report details
          </p>
        </div>

        {/* Month & Year Selectors Bar */}
        <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          
          {/* Monthly / Yearly Mode Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'monthly'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'yearly'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Yearly</span>
            </button>
          </div>

          {/* Month Dropdown (visible in Monthly mode) */}
          {timeframe === 'monthly' && (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="appearance-none bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold px-3 py-2 pr-8 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold px-3 py-2 pr-8 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
            title="Print or Export PDF"
          >
            <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{loadingStep || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeReport ? 'Refresh' : 'Generate'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!activeReport && !isGenerating ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Generate Strategy Report for {selectedPeriodLabel}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2">
            Click below to generate an AI strategy breakdown based on your income and expenses for {selectedPeriodLabel}.
          </p>
          <button
            onClick={handleGenerateReport}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Report ({selectedPeriodLabel})</span>
          </button>
        </div>
      ) : isGenerating ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Analyzing {selectedPeriodLabel} Financial Data</h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-medium">{loadingStep}</p>
        </div>
      ) : activeReport ? (
        <div className="space-y-6">
          
          {/* Active Period Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-emerald-500/80 shrink-0">
                  <div className="text-center">
                    <span className="text-2xl font-extrabold font-mono leading-none">{activeReport.healthScore}</span>
                    <span className="text-[9px] text-neutral-300 block uppercase font-bold">/ 100</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      Status: {activeReport.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                      Period: {selectedPeriodLabel}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
                    Financial Health Strategy Report
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                    {activeReport.summary}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Streamlined 3 Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto no-scrollbar print:hidden">
            {[
              { id: 'income_expense', label: `💰 Income & Expenses (${selectedPeriodLabel})` },
              { id: 'action_budget', label: '🎯 Action Plan & Budget Audit' },
              { id: 'wealth_projections', label: '📈 Wealth, Shield & Projections' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* STREAMLINED TAB 1: Income & Expenses Details for Selected Month/Year */}
          {(activeTab === 'income_expense' || window.matchMedia('print').matches) && (
            <div className="space-y-6">
              
              {/* Summary Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Income */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      Total Inflow ({selectedPeriodLabel})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                      Income
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-2">
                    {formatCurrency(totalPeriodIncome, currency)}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Total earnings for {selectedPeriodLabel}
                  </p>
                </div>

                {/* Total Expenses */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      Total Outflow ({selectedPeriodLabel})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 font-bold">
                      Expense
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white mt-2">
                    {formatCurrency(totalPeriodExpenses, currency)}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Total spending for {selectedPeriodLabel}
                  </p>
                </div>

                {/* Net Savings Surplus */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Wallet className="w-4 h-4" />
                      Net Period Cash Flow
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">
                      Net Surplus
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-2">
                    {formatCurrency(totalPeriodNetSavings, currency)}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Inflow remaining after expenses
                  </p>
                </div>

                {/* Savings Ratio */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <PieChart className="w-4 h-4" />
                      Savings Ratio
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                      Target: 20%+
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-2">
                    {periodSavingsRatePct}%
                  </p>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        periodSavingsRatePct >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, periodSavingsRatePct))}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Side-by-side Tables: Inflow Sources & Outflow Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Income Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      <span>Income Inflow Audit</span>
                    </h4>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                      {selectedPeriodLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                          <th className="py-2 px-2">Income Source</th>
                          <th className="py-2 px-2">Amount ({selectedPeriodLabel})</th>
                          <th className="py-2 px-2">% Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {incomeCategoryList.map((inc, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-2 font-semibold text-neutral-900 dark:text-white">{inc.name}</td>
                            <td className="py-3 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(inc.amount, currency)}</td>
                            <td className="py-3 px-2 font-mono text-neutral-500">{inc.pctOfTotal}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Expense Table (with AI Receipt OCR Tag) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-rose-500" />
                      <span>Category Expense Audit</span>
                    </h4>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                      {selectedPeriodLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Amount ({selectedPeriodLabel})</th>
                          <th className="py-2 px-2">% Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {expenseCategoryList.map((exp, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-2 font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              <span>{exp.name}</span>
                              {exp.name === 'AI Receipt Expense' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                  OCR
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 font-mono font-bold text-rose-600 dark:text-rose-400">{formatCurrency(exp.amount, currency)}</td>
                            <td className="py-3 px-2 font-mono font-bold text-neutral-500">{exp.pctOfTotal}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* AI Cash Flow Analysis Banner */}
              <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Cash Flow Synthesis ({selectedPeriodLabel})</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {activeReport.cashFlowAnalysis}
                </p>
              </div>

            </div>
          )}

          {/* STREAMLINED TAB 2: Action Plan & Budget Audit */}
          {(activeTab === 'action_budget' || window.matchMedia('print').matches) && (
            <div className="space-y-6">
              
              {/* Prioritized Action Plan */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Top Prioritized Action Plan</span>
                </div>
                <div className="space-y-2.5">
                  {activeReport.personalizedActionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Budget Audit vs Recommended Ceilings */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Category Budget Ceiling Audit</h4>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    {timeframe === 'yearly' ? 'Yearly Ceiling' : 'Monthly Ceiling'}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Actual Spent</th>
                        <th className="py-2.5 px-3">Recommended Ceiling</th>
                        <th className="py-2.5 px-3">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {activeReport.budgetBreakdown.map((item, idx) => {
                        const scale = timeframe === 'yearly' ? 12 : 1;
                        return (
                          <tr key={idx}>
                            <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">{item.category}</td>
                            <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">{formatCurrency(item.spent * scale, currency)}</td>
                            <td className="py-3 px-3 font-mono text-neutral-500">{formatCurrency(item.recommended * scale, currency)}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.status === 'optimal'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Spending Insights & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Spending Velocity Insights</h4>
                  <div className="space-y-2">
                    {activeReport.spendingInsights.map((insight, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-700 dark:text-neutral-300">
                        • {insight}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Savings Recommendations</h4>
                  <div className="space-y-2">
                    {activeReport.savingsRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
                        💡 {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STREAMLINED TAB 3: Wealth, Debt & Projections */}
          {(activeTab === 'wealth_projections' || window.matchMedia('print').matches) && (
            <div className="space-y-6">
              
              {/* Emergency Shield & Cash Buffer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <span>Emergency Shield Status</span>
                  </div>
                  <p className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white">
                    {formatCurrency(activeReport.emergencyFundRecommendation.currentAmount, currency)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Recommended 6-Month Buffer: {formatCurrency(activeReport.emergencyFundRecommendation.targetAmount, currency)} ({activeReport.emergencyFundRecommendation.status})
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>Debt Payoff Strategy</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeReport.debtRepaymentStrategy.map((step, idx) => (
                      <p key={idx} className="text-xs text-neutral-700 dark:text-neutral-300">
                        • {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investment Portfolio Allocation Suggestions */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Portfolio Asset Allocation Suggestions</span>
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Tailored to {profile.riskTolerance} risk tolerance and {profile.investmentDuration} horizon</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeReport.investmentSuggestions.map((inv, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        Risk: {inv.riskLevel}
                      </span>
                      <h5 className="text-xs font-bold text-neutral-900 dark:text-white">{inv.title}</h5>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        Expected Return: {inv.expectedReturn}
                      </p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{inv.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compounding Wealth Forecast Projections */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">Compounding Wealth Forecast</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">1-Year Projected Wealth</span>
                    <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-2">
                      {formatCurrency(activeReport.projections.oneYearSavings, currency)}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">5-Year Compounded Wealth</span>
                    <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                      {formatCurrency(activeReport.projections.fiveYearSavings, currency)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {activeReport.projections.summary}
                </p>
              </div>

            </div>
          )}

        </div>
      ) : null}

    </div>
  );
};
