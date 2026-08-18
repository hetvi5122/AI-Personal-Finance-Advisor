import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing on Vercel');

      return res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Receipt image data (imageBase64) is required.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    // Remove data:image/...;base64, prefix if present
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
              mimeType,
            },
          },
          {
            text: `
Analyze this purchase receipt image carefully.

Extract:

1. Merchant name
2. Transaction date in YYYY-MM-DD format
3. Category
4. Total amount
5. Payment method
6. Individual line items if available
7. Concise notes

Choose the best category from:

- Salary
- Freelance
- Investments
- Housing & Rent
- Food & Dining
- Groceries
- Transportation
- Utilities & Bills
- Shopping & Retail
- Healthcare
- Entertainment
- Education
- Travel
- Subscriptions
- Other

Choose the best payment method from:

- credit_card
- debit_card
- bank_transfer
- cash
- upi

If the date is missing, use today's date.

Return ONLY structured JSON.
            `,
          },
        ],
      },

      config: {
        responseMimeType: 'application/json',

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            merchant: {
              type: Type.STRING,
              description: 'Store or vendor name',
            },

            date: {
              type: Type.STRING,
              description: 'Date in YYYY-MM-DD format',
            },

            category: {
              type: Type.STRING,
              description: 'Best transaction category',
            },

            amount: {
              type: Type.NUMBER,
              description: 'Total purchase amount',
            },

            paymentMethod: {
              type: Type.STRING,
              description: 'Inferred payment method',
            },

            description: {
              type: Type.STRING,
              description: 'Summary description',
            },

            notes: {
              type: Type.STRING,
              description: 'Line items summary or extra details',
            },

            confidenceScore: {
              type: Type.NUMBER,
              description: 'Parsing confidence from 0 to 1',
            },
          },

          required: [
            'merchant',
            'amount',
            'category',
          ],
        },
      },
    });

    const parsedText = response.text || '{}';

    const parsedData = JSON.parse(parsedText);

    return res.status(200).json({
      success: true,
      receipt: parsedData,
    });

  } catch (error: any) {
    console.error('❌ Vercel receipt scan error:', error);

    return res.status(500).json({
      error: 'Failed to scan receipt image.',
      details: error?.message || String(error),
    });
  }
}
