"use client";

import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import type {
  PlaceDetailsResult,
  PlaceSearchAdapter,
  PlaceSearchResult,
} from "@/features/map/lib/place-search-adapter";

function getPhotoUrl(
  photo: google.maps.places.PlacePhoto | undefined
): string | null {
  if (!photo) {
    return null;
  }

  return photo.getUrl({
    maxWidth: 640,
    maxHeight: 480,
  });
}

export function useGooglePlaceSearchAdapter(): PlaceSearchAdapter {
  const placesLibrary = useMapsLibrary("places");

  return useMemo<PlaceSearchAdapter>(() => {
    if (!placesLibrary) {
      return {
        isReady: false,
        searchPlaces: async () => [],
        getPlaceDetails: async () => {
          throw new Error("Google Places library is not ready.");
        },
      };
    }

    const autocompleteService = new placesLibrary.AutocompleteService();
    const placesService = new placesLibrary.PlacesService(document.createElement("div"));

    return {
      isReady: true,
      async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
        const normalized = query.trim();

        if (!normalized) {
          return [];
        }

        const predictions = await autocompleteService.getPlacePredictions({
          input: normalized,
          types: ["establishment"],
        });

        return (predictions.predictions ?? []).map((prediction) => ({
          placeId: prediction.place_id,
          title:
            prediction.structured_formatting?.main_text ?? prediction.description,
          subtitle:
            prediction.structured_formatting?.secondary_text ?? prediction.description,
        }));
      },
      async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
        const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
          placesService.getDetails(
            {
              placeId,
              fields: [
                "place_id",
                "name",
                "formatted_address",
                "geometry.location",
                "photos",
              ],
            },
            (result, status) => {
              if (
                status !== google.maps.places.PlacesServiceStatus.OK ||
                !result ||
                !result.geometry?.location ||
                !result.place_id ||
                !result.name ||
                !result.formatted_address
              ) {
                reject(new Error("Failed to load place details."));
                return;
              }

              resolve(result);
            }
          );
        });

        return {
          placeId: place.place_id!,
          name: place.name!,
          address: place.formatted_address!,
          lat: place.geometry!.location!.lat(),
          lng: place.geometry!.location!.lng(),
          imageUrl: getPhotoUrl(place.photos?.[0]),
        };
      },
    };
  }, [placesLibrary]);
}
