import { OpenAI } from 'openai';
import { ENV } from 'src/config/env';

export type ChatCompletionMessageParam = Parameters<
  typeof openai.chat.completions.create
>[0]['messages'][number];

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

export async function runCompletion({
  model = 'gpt-4o',
  messages,
  temperature = 0.7,
}: {
  model?: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
}) {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
  });

  const messageContent = response.choices[0]?.message?.content;

  if (!messageContent) {
    throw new Error('No message content generated from OpenAI');
  }

  return messageContent;
}
