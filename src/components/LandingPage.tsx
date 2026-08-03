import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Receipt,
  PieChart,
  FileText,
  Target,
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  ChevronDown,
  Layers,
  BarChart3,
  Globe,
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo?: () => void;
  onLoginClick?: () => void;
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onLoginClick, onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemoClick = () => {
    if (onStartDemo) onStartDemo();
    else if (onGetStarted) onGetStarted();
  };

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else if (onGetStarted) onGetStarted();
  };

  const features = [
    {
      icon: Layers,
      title: 'Multi-Account Hub',
      description: 'Unified management for Personal, Checking, Savings, Business, and Investment portfolios in any currency.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Receipt,
      title: 'AI Vision Receipt OCR',
      description: 'Upload receipt photos or drag-and-drop bills. Gemini AI extracts items, tax, total, and merchant instantly.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: FileText,
      title: 'Financial Strategy Reports',
      description: 'Receive executive-level health scores, budget breakdowns, debt repayment strategies, and 5-year growth forecasts.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Interactive Analytics',
      description: 'Dynamic time-series charts for Income vs. Expense, Cash Flow trends, and category distribution breakdowns.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: Target,
      title: 'Smart Goal Tracker',
      description: 'Plan for a dream home, electric car, retirement, or emergency shield with auto-calculated monthly SIP targets.',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: Bot,
      title: '24/7 AI Finance Assistant',
      description: 'Ask questions like "Can I afford a new car?" or "How can I reduce expenses?" and get instant context-aware answers.',
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  const faqs = [
    {
      q: 'How does the AI Receipt Scanner work?',
      a: 'Simply snap or upload a photo of any physical or digital receipt. Our server-side Gemini AI Vision model parses the merchant name, transaction date, line items, and total amount, then populates an editable transaction entry automatically.',
    },
    {
      q: 'Does it support multiple accounts and international currencies?',
      a: 'Yes! You can manage separate accounts for Personal, Work, Business, Savings, and Investments. Select preferred currencies like USD ($), INR (₹), EUR (€), GBP (£), JPY (¥), and CAD ($) with seamless display conversion.',
    },
    {
      q: 'What is included in the AI Financial Report?',
      a: 'The report gives you an objective 0-100 Financial Health Index, budget allocation analysis (50/30/20 rule), debt payoff recommendations, emergency fund status, investment suggestions based on your risk tolerance, and 1-year/5-year wealth projections.',
    },
    {
      q: 'Is my financial data secure?',
      a: 'All processing runs on secure, isolated full-stack servers. Your API credentials and secrets never leak to the browser client.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Next-Gen AI Wealth Intelligence & Receipt OCR</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Master Your Money with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              AI-Powered Precision
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Manage multi-account finances, scan receipts instantly, receive custom financial health reports, and chat 24/7 with your personal wealth advisor.
          </p>

          {/* Call-to-action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleDemoClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold text-base shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>Launch Dashboard Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleLoginClick}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-base border border-neutral-300 dark:border-neutral-700 shadow-sm transition cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>

          {/* Key metrics / Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Multi-Currency Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant AI Receipt OCR</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>100% Client Security</span>
            </div>
          </div>

          {/* Live Interactive Hero Showcase Graphic */}
          <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl p-3 bg-neutral-200/80 dark:bg-neutral-800/80 border border-neutral-300/80 dark:border-neutral-700/80 shadow-2xl">
            <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 sm:p-8 text-left border border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                <div>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Executive Dashboard Preview
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    Net Worth Portfolio: $90,750.00
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Health Score: 88/100 (Excellent)
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                    4 Accounts Active
                  </span>
                </div>
              </div>

              {/* Grid Mini Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Monthly Cash Flow</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">+$4,700.00</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">55.3% Savings Rate</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Receipt OCR Scanner</span>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Apple Store ($249.00) Processed
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Auto-categorized under Shopping</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Goal: Dream Home</span>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white mt-1">$28,500 / $60,000</p>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full w-[47%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-white dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Everything You Need for Financial Freedom
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
              Built with cutting-edge AI to automate transaction categorization, analyze cash flows, and craft personalized wealth strategies.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-blue-500/50 transition duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            How WealthAI Operates in 3 Simple Steps
          </h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Setup Profile & Accounts</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Input income, fixed expenses, debts, investments, and risk tolerance across Checking, Savings, or Business accounts.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Track & Scan Receipts</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Log income and expenses, or drop receipt images to let Gemini AI Vision automatically extract merchants and line items.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Execute Wealth Strategy</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Generate comprehensive AI reports, review 5-year wealth growth projections, and chat with your 24/7 financial co-pilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-neutral-100/60 dark:bg-neutral-900/40 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Loved by Smart Investors & Professionals</h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              See how our users achieved financial clarity and accelerated their savings goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: 'The AI Receipt scanner saved me hours of manually typing expenses! I just take a quick picture and it categorizes everything.',
                author: 'Sarah Jenkins',
                role: 'Tech Lead & Investor',
              },
              {
                quote: 'The AI Financial Strategy report gave me a clear debt payoff roadmap. I cleared my credit card debt 6 months ahead of schedule!',
                author: 'David Chen',
                role: 'Product Designer',
              },
              {
                quote: 'Being able to ask the AI Chat if I can afford a luxury purchase based on my live savings rate keeps me accountable every single day.',
                author: 'Priya Sharma',
                role: 'Entrepreneur',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">"{t.quote}"</p>
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{t.author}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center text-neutral-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-neutral-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 bg-neutral-900 text-white border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold">Ready to take control of your financial future?</h3>
          <p className="mt-3 text-neutral-400 text-sm max-w-xl mx-auto">
            Experience intelligent wealth planning, automatic receipt scanning, and AI advisory today.
          </p>
          <button
            onClick={handleDemoClick}
            className="mt-6 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 transition cursor-pointer"
          >
            Open Interactive Demo Dashboard
          </button>
          <p className="mt-8 text-xs text-neutral-500">
            © {new Date().getFullYear()} WealthAI Advisor. Built with Google AI Studio & Gemini Intelligence.
          </p>
        </div>
      </footer>

    </div>
  );
};
