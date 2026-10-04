import { GoogleGenAI } from '@google/genai';

export const Type = {
  OBJECT: 'object', ARRAY: 'array', STRING: 'string', NUMBER: 'number', BOOLEAN: 'boolean'
} as const;

export class GeminiAI {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  }

  models = {
    generateContent: async (params: any) => {
      const systemInstruction = params.config?.systemInstruction || '';
      const prompt = typeof params.contents === 'string' ? params.contents : String(params.contents ?? '');
      const schema = params.config?.responseSchema;
      const requested = typeof params.model === 'string' ? params.model : '';
      const model = requested.startsWith('gemini-') ? requested : this.model;
      const config: any = {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: schema ? 'application/json' : 'text/plain'
      };
      if (schema) config.responseSchema = schema;

      let lastError: any;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await this.client.models.generateContent({ model, contents: prompt, config });
          const text = response.text || '';
          if (!text.trim()) throw new Error('Gemini returned an empty response.');
          return { text };
        } catch (error: any) {
          lastError = error;
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 700 * attempt));
        }
      }
      const message = lastError?.message || lastError?.error?.message || 'Gemini API request failed after 3 attempts.';
      throw new Error('Gemini API request failed: ' + message);
    }
  };
}

export function getGeminiClient(): GeminiAI | undefined {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return undefined;
  return new GeminiAI(apiKey, process.env.GEMINI_MODEL || 'gemini-3.5-flash');
}
