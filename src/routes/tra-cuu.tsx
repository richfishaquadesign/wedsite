import { createFileRoute } from "@tanstack/react-router";
import { OrderTrackingView } from "@/components/order-tracking-view";

type TrackSearch = { ma?: string };

export const Route = createFileRoute("/tra-cuu")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    ma: typeof search.ma === "string" ? search.ma : undefined,
  }),
  component: TraCuuPage,
});

function TraCuuPage() {
  const { ma } = Route.useSearch();
  return <OrderTrackingView initialCode={ma ?? ""} />;
}
