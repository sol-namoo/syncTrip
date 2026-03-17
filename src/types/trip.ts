import type { Database } from "@/types/database";

export type TripRecord = Database["public"]["Tables"]["trips"]["Row"];
export type TripMemberRole = Database["public"]["Tables"]["trip_members"]["Row"]["role"];
