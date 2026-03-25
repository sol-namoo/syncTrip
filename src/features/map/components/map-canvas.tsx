"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  type MapCameraChangedEvent,
  useMap,
} from "@vis.gl/react-google-maps";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapRouteSegment } from "@/features/map/lib/build-route-segments";
import { cn } from "@/lib/utils";

type MapMarkerViewModel = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  isSelected: boolean;
};

function getAverageCenter(markers: MapMarkerViewModel[]) {
  if (markers.length === 0) {
    return { lat: 37.5665, lng: 126.978 };
  }

  const total = markers.reduce(
    (accumulator, marker) => ({
      lat: accumulator.lat + marker.lat,
      lng: accumulator.lng + marker.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / markers.length,
    lng: total.lng / markers.length,
  };
}

function SelectedMarkerPanner({
  marker,
}: {
  marker: Pick<MapMarkerViewModel, "lat" | "lng"> | null;
}) {
  const map = useMap();
  const previousMarkerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !marker) {
      return;
    }

    const nextKey = `${marker.lat}:${marker.lng}`;

    if (previousMarkerRef.current === nextKey) {
      return;
    }

    map.panTo({
      lat: marker.lat,
      lng: marker.lng,
    });
    previousMarkerRef.current = nextKey;
  }, [map, marker]);

  return null;
}

function MapPolylines({ segments }: { segments: MapRouteSegment[] }) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) {
      return;
    }

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));

    polylinesRef.current = segments.map(
      (segment) =>
        new google.maps.Polyline({
          path: segment.points,
          strokeColor: segment.color,
          strokeOpacity: 0,
          strokeWeight: 3.2,
          geodesic: true,
          icons: [
            {
              icon: {
                path: "M 0,-1 0,1",
                strokeOpacity: 1,
                strokeColor: segment.color,
                scale: 3.2,
              },
              offset: "0",
              repeat: "12px",
            },
          ],
          map,
        })
    );

    return () => {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, segments]);

  return null;
}

function MapZoomControls() {
  const map = useMap("workspace-map");

  if (!map) {
    return null;
  }

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => {
          const currentZoom = map.getZoom() ?? 13;
          map.setZoom(Math.min(currentZoom + 1, 20));
        }}
        className="inline-flex size-10 items-center justify-center rounded-xl border border-[color:var(--color-border-card)] bg-white text-[color:var(--color-ink)] shadow-sm transition-colors hover:bg-[color:var(--color-bg-page)]"
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => {
          const currentZoom = map.getZoom() ?? 13;
          map.setZoom(Math.max(currentZoom - 1, 3));
        }}
        className="inline-flex size-10 items-center justify-center rounded-xl border border-[color:var(--color-border-card)] bg-white text-[color:var(--color-ink)] shadow-sm transition-colors hover:bg-[color:var(--color-bg-page)]"
      >
        <Minus className="size-4" />
      </button>
    </div>
  );
}

export function MapCanvas({
  markers,
  segments,
  onSelectMarker,
}: {
  markers: MapMarkerViewModel[];
  segments: MapRouteSegment[];
  onSelectMarker: (markerId: string) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
  const defaultCenter = useMemo(() => getAverageCenter(markers), [markers]);
  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.isSelected) ?? null,
    [markers]
  );
  const [zoom, setZoom] = useState(13);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#edf3e7_0%,#f6f0e6_100%)] px-6 text-center">
        <div>
          <p className="text-base font-semibold text-[color:var(--foreground)]">
            Google Maps API key가 없습니다.
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>를 설정하면 지도 캔버스가
            표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={apiKey} libraries={["places"]}>
        <Map
          id="workspace-map"
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          className="h-full w-full"
          onCameraChanged={(event: MapCameraChangedEvent) => {
            setZoom(event.detail.zoom);
          }}
        >
          <SelectedMarkerPanner marker={selectedMarker} />
          <MapPolylines segments={segments} />
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.name}
              onClick={() => onSelectMarker(marker.id)}
            >
              <Pin
                background={marker.color}
                borderColor={marker.isSelected ? "#0f172a" : "#ffffff"}
                glyphColor="#ffffff"
                scale={marker.isSelected ? 1.3 : 1.02}
              />
            </AdvancedMarker>
          ))}
        </Map>
        <MapZoomControls />
      </APIProvider>
      <div
        className={cn(
          "pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-medium text-[color:var(--muted-foreground)] shadow-sm backdrop-blur"
        )}
      >
        Zoom {zoom.toFixed(1)}
      </div>
    </div>
  );
}
