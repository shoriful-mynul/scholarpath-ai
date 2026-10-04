import OpenAI from 'openai';

export const Type = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
} as const;

function convertSchema(schema: any): any {
  if (!schema) return undefined;

  const result: any = {
    type: schema.type
  };

  // OpenRouter/provider strict JSON Schema implementations expect object
  // schemas to reject undeclared properties.
  if (schema.type === Type.OBJECT) {
    result.additionalProperties = false;
  }

  if (schema.description) {
    result.description = schema.description;
  }

  if (schema.properties) {
    result.properties = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = convertSchema(value);
    }
  }

  if (schema.items) {
    result.items = convertSchema(schema.items);
  }

  if (schema.required) {
    result.required = schema.required;
  }

  if (schema.enum) {
    result.enum = schema.enum;
  }

  return result;
}

export class OpenRouterAI {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ScholarPath AI'
      }
    });
  }

  models = {
    generateContent: async (params: any) => {
      const systemInstruction =
        params.config?.systemInstruction || '';

      const prompt =
        typeof params.contents === 'string'
          ? params.contents
          : String(params.contents);

      const schema = params.config?.responseSchema;

      const model =
        params.model ||
        process.env.OPENROUTER_MODEL ||
        process.env.OPENROUTER_MODEL || 'openrouter/free';

      const response = await this.client.chat.completions.create({
        model,
        provider: {
          require_parameters: Boolean(schema)
        },
        messages: [
          {
            role: 'system',
            content: systemInstruction
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: schema
          ? {
              type: 'json_schema',
              json_schema: {
                name: 'scholarpath_response',
                strict: true,
                schema: convertSchema(schema)
              }
            }
          : {
              type: 'json_object'
            }
      });

      const text = response.choices[0]?.message?.content || '';

      if (!text.trim()) {
        throw new Error('OpenRouter returned an empty response.');
      }

      return { text };
    }
  };
}

export function getOpenRouterClient(): OpenRouterAI | undefined {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return undefined;
  }

  return new OpenRouterAI(apiKey);
}