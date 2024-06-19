import { supabaseClient } from "@/libs/supabaseClient";

export interface IRoom {
  id?: number | undefined;
  created_at?: Date | undefined;
}

export async function fetchRooms(): Promise<IRoom[]> {
  const { data, error } = await supabaseClient
    .from("rooms")
    .select()
    .order("created_at", { ascending: false })
    .returns<IRoom[]>();

  if (error) throw error;

  return data;
}

export async function createRoom(): Promise<IRoom> {
  const { data, error } = await supabaseClient
    .from("rooms")
    .insert({})
    .select()
    .single<IRoom>();

  if (error) throw error;

  return data;
}

// export async function setRoomFile(room: IRoom, fileId: number): Promise<IRoom> {
//   const { data, error } = await supabaseClient
//     .from("rooms")
//     .update({
//       file: room.file === fileId ? null : fileId,
//     })
//     .eq("id", room.id)
//     .select()
//     .single<IRoom>();

//   if (error) throw error;

//   return data;
// }
