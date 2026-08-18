import { GoogleGenAI } from '@google/genai';

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

    const body = req.body || {};

    const {
      messages,
      userContext,
      history,
      message,
      context,
    } = body;

    const ctx =
      userContext || context || {};

    const profile =
      ctx.profile || {};

    const accounts =
      ctx.accounts || [];

    const goals =
      ctx.goals || [];

    const currency =
      ctx.currency || 'INR';

    const transactions =
      ctx.transactions ||
      ctx.transactionsSummary ||
      [];

    const ai = new GoogleGenAI({
      apiKey,
    });

    const systemInstruction = `
You are an expert AI Personal Finance Advisor and Wealth Strategist.

You are embedded inside the user's personal finance dashboard.

User Profile:
${JSON.stringify(profile)}

Accounts:
${JSON.stringify(accounts)}

Financial Goals:
${JSON.stringify(goals)}

Currency:
${currency}

Recent Transactions:
${JSON.stringify(transactions)}

Your responsibilities:

1. Give specific and actionable financial advice.
2. Help the user manage monthly expenses.
3. Help the user increase savings.
4. Help with budgeting.
5. Help analyze spending.
6. Explain investment concepts clearly.
7. Help with emergency fund planning.
8. Help with debt repayment strategies.
9. Help users plan financial goals.
10. Use the user's actual financial numbers whenever possible.

Important:
- Do not invent financial data.
- Use the user's currency (${currency}).
- Give practical recommendations.
- Keep responses easy to understand.
- Use headings and bullet points when useful.
- Mention that investment returns are not guaranteed when discussing investments.

At the end, provide 2-3 useful follow-up questions.
`;

    let formattedHistory: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];

    if (
      Array.isArray(messages) &&
      messages.length > 0
    ) {
      formattedHistory = messages.map(
        (m: any) => ({
          role:
            m.sender === 'user' ||
            m.role === 'user'
              ? 'user'
              : 'model',

          parts: [
            {
              text:
                m.text ||
                m.content ||
                '',
            },
          ],
        })
      );

    } else if (
      Array.isArray(history) &&
      history.length > 0
    ) {
      formattedHistory = history.map(
        (m: any) => ({
          role:
            m.role === 'user' ||
            m.sender === 'user'
              ? 'user'
              : 'model',

          parts: [
            {
              text:
                m.content ||
                m.text ||
                '',
            },
          ],
        })
      );
    }

    const lastUserMessage =
      message ||
      (
        formattedHistory.length > 0
          ? formattedHistory[
              formattedHistory.length - 1
            ].parts[0].text
          : 'Hello'
      );

    const contentsToSend =
      formattedHistory.length > 0
        ? formattedHistory
        : [
            {
              role: 'user',
              parts: [
                {
                  text: lastUserMessage,
                },
              ],
            },
          ];

    const response =
      await ai.models.generateContent({
        model: 'gemini-3.6-flash',

        contents: contentsToSend,

        config: {
          systemInstruction,
        },
      });

    const replyText =
      response.text ||
      'I am analyzing your financial information. How else can I help you?';

    const followUpSuggestions = [
      'Show me a breakdown of my discretionary spending',
      'How much should I contribute to my emergency fund?',
      'Create a 30-day savings challenge for me',
    ];

    return res.status(200).json({
      success: true,
      reply: replyText,
      suggestions: followUpSuggestions,
    });

  } catch (error: any) {
    console.error(
      'Error in AI Chat:',
      error
    );

    return res.status(500).json({
      error: 'Failed to answer financial query.',
      details:
        error?.message || String(error),
    });
  }
}
