import "server-only";

import dayjs from "dayjs";
import { createClient } from "@/lib/supabase/server";
import { buildReadonlyItinerarySnapshot, buildTicketRenderData } from "@/features/ticket3d/lib/build-ticket-data";
import type { Database } from "@/types/database";
import type { PublicTicketPageData } from "@/types/ticket";
import type { TripDestination } from "@/types/trip";
import type { BoardColumn, TripPlaceCard, TripDayRow, WorkspaceSnapshot } from "@/types/workspace";

type PublicShareRow = {
  trip_id: string;
  share_code: string;
  message: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  title: string;
  destination: string | null;
  destinations: Database["public"]["Tables"]["trips"]["Row"]["destinations"];
  start_date: string | null;
  end_date: string | null;
  member_count: number;
};

type PublicTripItemRow = Database["public"]["Tables"]["trip_items"]["Row"];
type PublicTripDayRow = Omit<TripDayRow, "position"> & {
  position?: number | null;
  day_position?: number | null;
};

function parseTripDestinations(
  value: Database["public"]["Tables"]["trips"]["Row"]["destinations"]
): TripDestination[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is TripDestination => {
    return (
      Array.isArray(entry) &&
      entry.length >= 2 &&
      typeof entry[0] === "string" &&
      typeof entry[1] === "string"
    );
  });
}

function toTripPlaceCard(item: PublicTripItemRow): TripPlaceCard {
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

function buildBoardColumns(days: TripDayRow[], cards: TripPlaceCard[]): BoardColumn[] {
  return days.map((day) => ({
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
  }));
}

function normalizeTripDays(days: PublicTripDayRow[]): TripDayRow[] {
  return days.map((day) => ({
    ...day,
    position: day.position ?? day.day_position ?? 0,
  }));
}

export async function getPublicTicketPageData(
  shareCode: string
): Promise<PublicTicketPageData | null> {
  const supabase = await createClient();
  const [{ data: shareRows, error: shareError }, { data: days, error: daysError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.rpc("get_public_trip_share_settings", {
        p_share_code: shareCode,
      }),
      supabase.rpc("get_public_trip_days", {
        p_share_code: shareCode,
      }),
      supabase.rpc("get_public_trip_items", {
        p_share_code: shareCode,
      }),
    ]);

  if (shareError) {
    if (
      shareError.message.includes("Could not find the function") ||
      shareError.message.includes("function public.get_public_trip_share_settings") ||
      shareError.message.includes("does not exist")
    ) {
      throw new Error(
        "공개 공유 조회용 RPC가 아직 DB에 적용되지 않았습니다. `20260324000100_add_public_share_read_functions.sql`를 실행해 주세요."
      );
    }

    if (shareError.message.toLowerCase().includes("permission denied")) {
      throw new Error(
        "공개 공유 조회 권한이 없습니다. `get_public_trip_share_settings/get_public_trip_days/get_public_trip_items` 함수의 grant execute가 적용되었는지 확인해 주세요."
      );
    }

    throw new Error(shareError.message);
  }

  if (daysError) {
    throw new Error(daysError.message);
  }

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const share = shareRows?.[0] as PublicShareRow | undefined;

  if (!share) {
    return null;
  }

  const normalizedDays = Array.isArray(days)
    ? normalizeTripDays(days as PublicTripDayRow[])
    : [];
  const cards = Array.isArray(items)
    ? (items as PublicTripItemRow[]).map((item) => toTripPlaceCard(item))
    : [];
  const columns = buildBoardColumns(normalizedDays, cards);
  const snapshot: WorkspaceSnapshot = {
    trip: {
      id: share.trip_id,
      title: share.title,
      destination: share.destination,
      destinations: parseTripDestinations(share.destinations),
      startDate: share.start_date ?? "",
      endDate: share.end_date ?? "",
      createdAt: share.created_at,
      updatedAt: share.updated_at,
    },
    members: [],
    columns,
    cards,
  };

  return {
    share: {
      trip_id: share.trip_id,
      share_code: share.share_code,
      message: share.message,
      updated_by: share.updated_by,
      created_at: share.created_at,
      updated_at: share.updated_at,
    } as PublicTicketPageData["share"],
    render: buildTicketRenderData({
      snapshot,
      actor: null,
      message: share.message,
      shareCode: share.share_code,
      issuedAt: share.updated_at,
    }),
    itinerary: buildReadonlyItinerarySnapshot(snapshot),
  };
}
