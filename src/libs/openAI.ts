import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!openAIApiKey) throw new Error('OpenAI API Key not found.')

export const llm = new ChatOpenAI({
  openAIApiKey,
  modelName: "gpt-3.5-turbo",
  temperature: 0.9,
});

export const embeddings = new OpenAIEmbeddings(
  {
    openAIApiKey,
  },
  { maxRetries: 0 }
);