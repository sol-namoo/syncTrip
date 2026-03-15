import { createClient } from "@/lib/supabase/client";

export interface Trip {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function getMyTrips(): Promise<Trip[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Trip[];
}
