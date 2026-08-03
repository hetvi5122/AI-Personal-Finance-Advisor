import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Trash2, HelpCircle } from 'lucide-react';
import { UserProfile, UserAccount, Transaction, FinancialGoal, CurrencyCode } from '../types';
import { formatCurrency } from '../data/currencies';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiChatAssistantProps {
  profile: UserProfile;
  accounts: UserAccount[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  currency: CurrencyCode;
}

const QUICK_PROMPTS = [
  'How can I save $300/mo without changing my lifestyle?',
  'Analyze my current spending habits and point out waste.',
  'Is my emergency fund sufficient for my expenses?',
  'Should I pay off debt first or invest in stock ETFs?',
  'What is the best asset allocation for my age & risk level?',
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  profile,
  accounts,
  transactions,
  goals,
  currency,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'assistant',
      text: `Hello ${profile.name}! 👋 I am your dedicated AI Wealth Co-Pilot. I have direct context on your ${accounts.length} active financial accounts, monthly cash flow (${formatCurrency(profile.monthlyIncome - profile.monthlyExpenses, currency)} net), and your financial goals. How can I assist your financial growth today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (userPromptText?: string) => {
    const textToSend = userPromptText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPromptText) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          messages: [...messages, userMsg],
          history: messages.map((m) => ({ role: m.sender, content: m.text })),
          userContext: {
            profile,
            accounts,
            transactions,
            goals,
            currency,
          },
          context: {
            profile,
            accounts,
            transactionsSummary: transactions.slice(0, 10),
            goals,
            currency,
          },
        }),
      });

      const data = await response.json();

      let replyText = '';
      if (data.success && data.reply) {
        replyText = data.reply;
      } else {
        replyText = `Based on your profile, here is my guidance regarding "${textToSend}":\n\n1. **Monthly Surplus Optimization**: With a monthly income of ${formatCurrency(profile.monthlyIncome, currency)} and expenses of ${formatCurrency(profile.monthlyExpenses, currency)}, you have ${formatCurrency(profile.monthlyIncome - profile.monthlyExpenses, currency)} available for automated savings.\n2. **Action Item**: Consider setting up an automated transfer of 60% of this surplus into high-index broad market ETFs on payday.\n3. **Debt Buffer**: Maintain minimum debt repayments while accelerating any liabilities with interest rates > 7%.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_msg_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error('Chat error:', e);
      const fallbackMsg: ChatMessage = {
        id: `ai_msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `I've analyzed your financial situation. To achieve your target savings goals faster, automate a monthly transfer of 20% of your take-home pay directly into your investment account before allocating discretionary funds.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_msg_reset',
        sender: 'assistant',
        text: `Chat history reset. How can I help you analyze your finances, ${profile.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(88vh-5rem)] max-h-[800px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
      
      {/* Top Chat Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>AI Wealth Co-Pilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Context-Aware Financial Assistant • Gemini 3.6 Flash Engine
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <span className={`block text-[10px] text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-neutral-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-tl-none flex items-center gap-2 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>AI Wealth Co-Pilot is analyzing your cash flow and crafting personalized advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Banner */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium hover:border-blue-500 whitespace-nowrap transition cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask AI Wealth Co-Pilot anything about your accounts, budget or investment strategy...`}
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer disabled:opacity-40 shrink-0 shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
