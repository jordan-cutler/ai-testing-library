import { OpenAI } from 'openai';
import { ENV } from 'src/config/env';

const openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

export type ChatCompletionMessageParam = Parameters<
  typeof openai.chat.completions.create
>[0]['messages'][number];

export type ChatFunction = NonNullable<Parameters<
  typeof openai.chat.completions.create
>[0]['functions']>[number];

export type ChatFunctionCall = NonNullable<
  Parameters<typeof openai.chat.completions.create>[0]['function_call']
>;

export async function runCompletion({
  model = 'gpt-4',
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

export async function callGPTWithFunctions({
  prompt,
  functionSchemas,
  functionCall,
  model = 'gpt-4',
}: {
  prompt: string;
  functionSchemas: ChatFunction[];
  functionCall: ChatFunctionCall;
  model?: string;
}) {
  if (functionSchemas.length === 0) {
    throw new Error('At least one function schema is required');
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    functions: functionSchemas,
    function_call: functionCall,
  });

  const functionCallResponse = response.choices[0]?.message?.function_call;

  if (!functionCallResponse) {
    throw new Error('No function call arguments received from OpenAI');
  }

  return JSON.parse(functionCallResponse.arguments);
}
