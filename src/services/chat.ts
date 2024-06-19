import { embeddings, llm } from "@/libs/openAI";
import { supabaseClient } from "@/libs/supabaseClient";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

export interface IChat {
  id?: number | undefined;
  room: number;
  role: string;
  message: string;
  created_at?: Date | undefined;
}

export async function fetchChats(roomId: number): Promise<IChat[]> {
  const { data, error } = await supabaseClient
    .from("chats")
    .select()
    .eq("room", roomId)
    .order("created_at", { ascending: true })
    .returns<IChat[]>();

  if (error) throw error;

  return data;
}

export async function postChat(chat: IChat): Promise<IChat> {
  const { data, error } = await supabaseClient
    .from("chats")
    .insert(chat)
    .select()
    .single<IChat>();

  if (error) throw error;

  return data;
}

export async function getAnswer(chat: IChat, fileId: number): Promise<IChat> {
  const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });

  const retriever = vectorStore.asRetriever({
    filter: (rpc) => rpc.filter("metadata->>file_id", "eq", fileId),
    k: 2,
  });

  const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
      If you don't know the answer, just say that you don't know, don't try to make up an answer.
      ----------------
      {context}`;

  const messages = [
    SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate("{question}"),
  ];
  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke(chat.message);

  const { data, error } = await supabaseClient
    .from("chats")
    .insert({
      role: "bot",
      room: chat.room,
      message: answer,
    })
    .select()
    .single<IChat>();

  if (error) throw error;

  return data;
}
