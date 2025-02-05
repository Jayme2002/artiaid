import OpenAI from 'openai/index.mjs';
import { counselorPrompts } from './counselorPrompts';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing OpenAI API key. Please ensure VITE_OPENAI_API_KEY is set in your .env file.'
  );
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

export const getChatCompletion = async (messages: any[], counselorName?: string) => {
  try {
    const systemMessage = counselorName && counselorPrompts[counselorName]
      ? { role: 'system', content: counselorPrompts[counselorName].systemPrompt }
      : { role: 'system', content: 'You are a helpful AI counselor.' };

    const completion = await openai.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
};