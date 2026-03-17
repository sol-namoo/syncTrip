"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useEffect, useMemo, useState } from "react";
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

export function MapCanvas({
  markers,
  onSelectMarker,
}: {
  markers: MapMarkerViewModel[];
  onSelectMarker: (markerId: string) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";
  const defaultCenter = useMemo(() => getAverageCenter(markers), [markers]);
  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.isSelected) ?? null,
    [markers]
  );
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    setCenter(defaultCenter);
  }, [defaultCenter]);

  useEffect(() => {
    if (!selectedMarker) {
      return;
    }

    setCenter({
      lat: selectedMarker.lat,
      lng: selectedMarker.lng,
    });
  }, [selectedMarker]);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_100%)] px-6 text-center">
        <div>
          <p className="text-base font-semibold text-gray-900">
            Google Maps API key가 없습니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>를 설정하면 지도 캔버스가
            표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <Map
        center={center}
        zoom={zoom}
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
              scale={marker.isSelected ? 1.25 : 1}
            />
          </AdvancedMarker>
        ))}
      </Map>
      <div
        className={cn(
          "pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur"
        )}
      >
        Zoom {zoom.toFixed(1)}
      </div>
    </APIProvider>
  );
}
