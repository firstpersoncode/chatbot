import { embeddings } from "@/libs/openAI";
import { supabaseClient } from "@/libs/supabaseClient";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

export interface IFile {
  id?: number | undefined;
  name: string;
  created_at?: Date | undefined;
}

export async function fetchFiles(): Promise<IFile[]> {
  const { data, error } = await supabaseClient
    .from("files")
    .select()
    .order("created_at", { ascending: false })
    .returns<IFile[]>();

  if (error) throw error;

  return data;
}

export async function saveFile(file: File): Promise<IFile> {
  const { data, error } = await supabaseClient
    .from("files")
    .insert({ name: file.name })
    .select()
    .single<IFile>();

  if (error) throw error;

  const loader = new WebPDFLoader(file);
  const output = await loader.load();
  const docs = output.map((d) => ({
    ...d,
    metadata: { ...d.metadata, file_id: data.id },
  }));

  await SupabaseVectorStore.fromDocuments(docs, embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });

  return data;
}
