import "server-only";

import dayjs from "dayjs";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  BoardColumn,
  TripPlaceCard,
  TripDayRow,
  WorkspaceMember,
  WorkspaceSnapshot,
} from "@/types/workspace";

type TripSelect = Pick<
  Database["public"]["Tables"]["trips"]["Row"],
  "id" | "title" | "destination" | "start_date" | "end_date" | "created_at" | "updated_at"
>;

type MemberSelect = Pick<
  Database["public"]["Tables"]["trip_members"]["Row"],
  "user_id" | "role"
>;

type TripDaySelect = TripDayRow;
type TripItemSelect = Database["public"]["Tables"]["trip_items"]["Row"];

function toTripPlaceCard(item: TripItemSelect): TripPlaceCard {
  return {
    id: item.id,
    tripId: item.trip_id,
    placeId: item.place_id,
    name: item.name,
    address: item.address,
    lat: item.lat,
    lng: item.lng,
    imageUrl: item.image_url,
    note: item.note,
    listType: item.list_type,
    tripDayId: item.trip_day_id,
    orderIndex: item.order_index,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function buildBoardColumns(days: TripDaySelect[], cards: TripPlaceCard[]): BoardColumn[] {
  const columns: BoardColumn[] = [
    {
      id: "bucket",
      title: "장소 바구니",
      date: null,
      dateLabel: null,
      tripDayId: null,
      position: null,
      cardIds: cards
        .filter((card) => card.listType === "bucket")
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((card) => card.id),
    },
  ];

  for (const day of days) {
    columns.push({
      id: `day-${day.id}`,
      title: day.title ?? "",
      date: day.date,
      dateLabel: dayjs(day.date).format("M/D"),
      tripDayId: day.id,
      position: day.position,
      cardIds: cards
        .filter((card) => card.listType === "day" && card.tripDayId === day.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((card) => card.id),
    });
  }

  return columns;
}

export async function getWorkspaceSnapshot(
  tripId: string
): Promise<WorkspaceSnapshot | null> {
  const supabase = await createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, created_at, updated_at")
    .eq("id", tripId)
    .maybeSingle()
    .overrideTypes<TripSelect | null, { merge: false }>();

  if (tripError) {
    throw new Error(tripError.message);
  }

  if (!trip) {
    return null;
  }

  const [
    { data: members, error: membersError },
    { data: days, error: daysError },
    { data: items, error: itemsError },
  ] =
    await Promise.all([
      supabase
        .from("trip_members")
        .select("user_id, role")
        .eq("trip_id", tripId)
        .overrideTypes<MemberSelect[], { merge: false }>(),
      supabase
        .from("trip_days")
        .select("id, trip_id, date, title, position, created_at, updated_at")
        .eq("trip_id", tripId)
        .order("position", { ascending: true })
        .overrideTypes<TripDaySelect[], { merge: false }>(),
      supabase
        .from("trip_items")
        .select(
          "id, trip_id, place_id, name, address, lat, lng, image_url, note, list_type, trip_day_id, order_index, created_by, created_at, updated_at"
        )
        .eq("trip_id", tripId)
        .order("trip_day_id", { ascending: true, nullsFirst: true })
        .order("order_index", { ascending: true })
        .overrideTypes<TripItemSelect[], { merge: false }>(),
    ]);

  if (membersError) {
    throw new Error(membersError.message);
  }

  if (daysError) {
    throw new Error(daysError.message);
  }

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const cards = Array.isArray(items) ? items.map((item) => toTripPlaceCard(item)) : [];
  const workspaceMembers: WorkspaceMember[] = Array.isArray(members)
    ? members.map((member) => ({
        userId: member.user_id,
        role: member.role,
      }))
    : [];

  return {
    trip: {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
    },
    members: workspaceMembers,
    cards,
    columns: buildBoardColumns(Array.isArray(days) ? days : [], cards),
  };
}
