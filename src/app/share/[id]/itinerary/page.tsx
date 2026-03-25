import { notFound } from "next/navigation";
import { ReadonlyItineraryView } from "@/features/share/components/readonly-itinerary-view";
import { getPublicTicketPageData } from "@/features/share/lib/public-queries";

export default async function ShareItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicTicketPageData(id);

  if (!data) {
    notFound();
  }

  return <ReadonlyItineraryView data={data} />;
}
