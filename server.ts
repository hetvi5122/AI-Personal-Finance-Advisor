import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase payload limit for base64 receipt upload images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Receipt Scanner Endpoint
app.post('/api/ai/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Receipt image data (imageBase64) is required.' });
    }

    const ai = getGeminiClient();

    // Remove header prefix if present (e.g. "data:image/png;base64,")
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this purchase receipt image carefully. Extract the merchant name, transaction date (in YYYY-MM-DD format, fallback to current date if missing), category (choose best match from: 'Salary', 'Freelance', 'Investments', 'Housing & Rent', 'Food & Dining', 'Groceries', 'Transportation', 'Utilities & Bills', 'Shopping & Retail', 'Healthcare', 'Entertainment', 'Education', 'Travel', 'Subscriptions', 'Other'), total amount, payment method (choose best match: 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'upi'), individual line items if present, and concise notes. Return ONLY structured JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: 'Store or vendor name' },
            date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
            category: { type: Type.STRING, description: 'Best transaction category' },
            amount: { type: Type.NUMBER, description: 'Total purchase amount' },
            paymentMethod: { type: Type.STRING, description: 'Inferred payment method' },
            description: { type: Type.STRING, description: 'Summary description for the transaction' },
            notes: { type: Type.STRING, description: 'Line items summary or extra details' },
            confidenceScore: { type: Type.NUMBER, description: 'Parsing confidence 0 to 1' },
          },
          required: ['merchant', 'amount', 'category'],
        },
      },
    });

    const parsedText = response.text || '{}';
    const parsedData = JSON.parse(parsedText);
    res.json({ success: true, receipt: parsedData });
  } catch (error: any) {
    console.error('Error scanning receipt:', error);
    res.status(500).json({
      error: 'Failed to scan receipt image.',
      details: error.message || String(error),
    });
  }
});

// AI Financial Report Generation Endpoint
app.post('/api/ai/analyze-finance', async (req, res) => {
  try {
    const {
      profile = {},
      accounts = [],
      transactions = [],
      goals = [],
      currency = 'INR',
    } = req.body || {};

    const ai = getGeminiClient();

    const promptText = `
Act as a world-class financial advisor and wealth strategist. Analyze the following user profile and financial data:

User Profile:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 0}
- Occupation: ${profile.occupation || 'N/A'}
- Monthly Income: ${profile.monthlyIncome || 0} ${currency} (Yearly Income: ${(profile.monthlyIncome || 0) * 12} ${currency})
- Monthly Expenses: ${profile.monthlyExpenses || 0} ${currency} (Yearly Expenses: ${(profile.monthlyExpenses || 0) * 12} ${currency})
- Current Liquid Savings: ${profile.currentSavings || 0} ${currency}
- Total Debts: ${profile.totalDebts || 0} ${currency}
- Total Investments: ${profile.totalInvestments || 0} ${currency}
- Risk Tolerance: ${profile.riskTolerance || 'moderate'}
- Investment Duration: ${profile.investmentDuration || 'medium_term'}
- Goals: ${profile.financialGoalsDescription || 'None'}

Accounts: ${JSON.stringify(accounts)}
Financial Goals: ${JSON.stringify(goals)}
Recent Transactions Sample: ${JSON.stringify(Array.isArray(transactions) ? transactions.slice(0, 20) : [])}

Provide an exhaustive, highly tailored financial health report with actionable strategic advice for both monthly cash flow management and long-term yearly wealth accumulation. Ensure budget breakdown includes key categories (e.g. Housing & Rent, Food & Dining, AI Receipt Expense, Subscriptions, Utilities, Transportation, Shopping, Travel).
Output MUST be in structured JSON matching the provided schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER, description: 'Financial Health Score from 0 to 100' },
            status: { type: Type.STRING, description: 'excellent, good, fair, or needs_attention' },
            summary: { type: Type.STRING, description: 'High-level executive summary of financial status' },
            budgetBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  spent: { type: Type.NUMBER },
                  recommended: { type: Type.NUMBER },
                  status: { type: Type.STRING, description: 'optimal, warning, or overbudget' },
                },
              },
            },
            expenseAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key insights into spending patterns',
            },
            savingsRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Tactical ways to boost savings rate',
            },
            cashFlowAnalysis: { type: Type.STRING, description: 'Detailed cash flow evaluation' },
            emergencyFundRecommendation: {
              type: Type.OBJECT,
              properties: {
                recommendedMonths: { type: Type.NUMBER },
                targetAmount: { type: Type.NUMBER },
                currentAmount: { type: Type.NUMBER },
                status: { type: Type.STRING },
              },
            },
            debtRepaymentStrategy: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Debts optimization and payoff steps',
            },
            investmentSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  expectedReturn: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
              },
            },
            spendingInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            goalPlanningTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            projections: {
              type: Type.OBJECT,
              properties: {
                oneYearSavings: { type: Type.NUMBER },
                fiveYearSavings: { type: Type.NUMBER },
                summary: { type: Type.STRING },
              },
            },
            personalizedActionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 5 prioritized action items for the user',
            },
          },
          required: ['healthScore', 'status', 'summary', 'budgetBreakdown', 'personalizedActionItems'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.generatedAt = new Date().toISOString();
    if (profile.email) parsed.userEmail = profile.email;
    if (profile.name) parsed.userName = profile.name;
    res.json({ success: true, report: parsed });
  } catch (error: any) {
    console.error('Error analyzing financial data:', error);
    res.status(500).json({
      error: 'Failed to generate financial analysis.',
      details: error.message || String(error),
    });
  }
});

// AI Chat Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const body = req.body || {};
    const { messages, userContext, history, message, context } = body;

    const ctx = userContext || context || {};
    const profile = ctx.profile || {};
    const accounts = ctx.accounts || [];
    const goals = ctx.goals || [];
    const currency = ctx.currency || 'INR';
    const transactions = ctx.transactions || ctx.transactionsSummary || [];

    const ai = getGeminiClient();

    const systemInstruction = `
You are an expert AI Personal Finance Advisor & Wealth Strategist embedded in the user's dashboard.
You have direct access to the user's live financial metadata:
User Profile & Stats: ${JSON.stringify(profile)}
Accounts: ${JSON.stringify(accounts)}
Goals: ${JSON.stringify(goals)}
Currency: ${currency}
Recent Transactions Count: ${Array.isArray(transactions) ? transactions.length : 0}

Guidelines:
1. Provide highly specific, actionable, encouraging, and clear advice.
2. Address questions like "How can I save more?", "Can I afford X?", "Where should I invest?", "Reduce my expenses", "Create next month's budget".
3. Calculate real figures using the user's currency (${currency}) whenever relevant.
4. Keep answers clean, formatted with bullet points, concise sections, and bold figures.
5. End with 2-3 relevant follow-up question suggestions for the user to click.
`;

    let formattedHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      formattedHistory = messages.map((m: any) => ({
        role: m.sender === 'user' || m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || m.content || '' }],
      }));
    } else if (Array.isArray(history) && history.length > 0) {
      formattedHistory = history.map((m: any) => ({
        role: m.role === 'user' || m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || '' }],
      }));
    }

    const lastUserMessage = message || (formattedHistory.length > 0 ? formattedHistory[formattedHistory.length - 1].parts[0].text : 'Hello');

    const contentsToSend = formattedHistory.length > 0
      ? formattedHistory
      : [{ role: 'user', parts: [{ text: lastUserMessage }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contentsToSend,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const replyText = response.text || "I'm analyzing your financial metrics now. How else can I assist with your financial goals?";

    let followUpSuggestions = [
      'Show me a breakdown of my discretionary spending',
      'How much should I contribute to my emergency fund?',
      'Create a 30-day savings challenge for me',
    ];

    res.json({
      success: true,
      reply: replyText,
      suggestions: followUpSuggestions,
    });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({
      error: 'Failed to answer financial query.',
      details: error.message || String(error),
    });
  }
});

// Start Express Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
