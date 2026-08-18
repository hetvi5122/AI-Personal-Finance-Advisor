import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const {
      profile = {},
      accounts = [],
      transactions = [],
      goals = [],
      currency = 'INR',
    } = req.body || {};

    const ai = new GoogleGenAI({
      apiKey,
    });

    const promptText = `
Act as a world-class financial advisor and wealth strategist.

Analyze the following user's financial information:

User Profile:
- Name: ${profile.name || 'User'}
- Age: ${profile.age || 0}
- Occupation: ${profile.occupation || 'N/A'}
- Monthly Income: ${profile.monthlyIncome || 0} ${currency}
- Monthly Expenses: ${profile.monthlyExpenses || 0} ${currency}
- Current Liquid Savings: ${profile.currentSavings || 0} ${currency}
- Total Debts: ${profile.totalDebts || 0} ${currency}
- Total Investments: ${profile.totalInvestments || 0} ${currency}
- Risk Tolerance: ${profile.riskTolerance || 'moderate'}
- Investment Duration: ${profile.investmentDuration || 'medium_term'}
- Financial Goals: ${profile.financialGoalsDescription || 'None'}

Accounts:
${JSON.stringify(accounts)}

Financial Goals:
${JSON.stringify(goals)}

Recent Transactions:
${JSON.stringify(
  Array.isArray(transactions)
    ? transactions.slice(0, 20)
    : []
)}

Provide a highly personalized financial health report.

Analyze:
- Monthly cash flow
- Spending patterns
- Savings
- Emergency fund
- Debt
- Investments
- Financial goals
- Budget categories
- Long-term wealth building

Use these budget categories where relevant:

Housing & Rent
Food & Dining
AI Receipt Expense
Subscriptions
Utilities & Bills
Transportation
Shopping & Retail
Travel
Healthcare
Entertainment
Education
Other

Give practical and actionable recommendations.

Return ONLY structured JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',

      contents: promptText,

      config: {
        responseMimeType: 'application/json',

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            healthScore: {
              type: Type.INTEGER,
              description: 'Financial health score from 0 to 100',
            },

            status: {
              type: Type.STRING,
              description:
                'excellent, good, fair, or needs_attention',
            },

            summary: {
              type: Type.STRING,
              description:
                'High-level financial summary',
            },

            budgetBreakdown: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  category: {
                    type: Type.STRING,
                  },

                  spent: {
                    type: Type.NUMBER,
                  },

                  recommended: {
                    type: Type.NUMBER,
                  },

                  status: {
                    type: Type.STRING,
                  },
                },
              },
            },

            expenseAnalysis: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },

            savingsRecommendations: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },

            cashFlowAnalysis: {
              type: Type.STRING,
            },

            emergencyFundRecommendation: {
              type: Type.OBJECT,

              properties: {
                recommendedMonths: {
                  type: Type.NUMBER,
                },

                targetAmount: {
                  type: Type.NUMBER,
                },

                currentAmount: {
                  type: Type.NUMBER,
                },

                status: {
                  type: Type.STRING,
                },
              },
            },

            debtRepaymentStrategy: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },

            investmentSuggestions: {
              type: Type.ARRAY,

              items: {
                type: Type.OBJECT,

                properties: {
                  title: {
                    type: Type.STRING,
                  },

                  riskLevel: {
                    type: Type.STRING,
                  },

                  expectedReturn: {
                    type: Type.STRING,
                  },

                  rationale: {
                    type: Type.STRING,
                  },
                },
              },
            },

            spendingInsights: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },

            goalPlanningTips: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },

            projections: {
              type: Type.OBJECT,

              properties: {
                oneYearSavings: {
                  type: Type.NUMBER,
                },

                fiveYearSavings: {
                  type: Type.NUMBER,
                },

                summary: {
                  type: Type.STRING,
                },
              },
            },

            personalizedActionItems: {
              type: Type.ARRAY,

              items: {
                type: Type.STRING,
              },
            },
          },

          required: [
            'healthScore',
            'status',
            'summary',
            'budgetBreakdown',
            'personalizedActionItems',
          ],
        },
      },
    });

    const parsed = JSON.parse(
      response.text || '{}'
    );

    parsed.generatedAt = new Date().toISOString();

    if (profile.email) {
      parsed.userEmail = profile.email;
    }

    if (profile.name) {
      parsed.userName = profile.name;
    }

    return res.status(200).json({
      success: true,
      report: parsed,
    });

  } catch (error: any) {
    console.error(
      'Error analyzing financial data:',
      error
    );

    return res.status(500).json({
      error: 'Failed to generate financial analysis.',
      details:
        error?.message || String(error),
    });
  }
}
