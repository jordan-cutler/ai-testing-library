import 'dotenv/config';

export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
} as const;
