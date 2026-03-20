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

async function getPredictionDetails(
  placesService: google.maps.places.PlacesService,
  placeId: string
) {
  return new Promise<google.maps.places.PlaceResult | null>((resolve) => {
    placesService.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "formatted_address",
          "rating",
          "user_ratings_total",
          "photos",
        ],
      },
      (result, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !result) {
          resolve(null);
          return;
        }

        resolve(result);
      }
    );
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

        const topPredictions = (predictions.predictions ?? []).slice(0, 16);
        const detailedResults = await Promise.all(
          topPredictions.map(async (prediction) => {
            const detail = await getPredictionDetails(
              placesService,
              prediction.place_id
            );

            return {
              placeId: prediction.place_id,
              title:
                detail?.name ??
                prediction.structured_formatting?.main_text ??
                prediction.description,
              subtitle:
                detail?.formatted_address ??
                prediction.structured_formatting?.secondary_text ??
                prediction.description,
              imageUrl: getPhotoUrl(detail?.photos?.[0]),
              rating: typeof detail?.rating === "number" ? detail.rating : null,
              ratingCount:
                typeof detail?.user_ratings_total === "number"
                  ? detail.user_ratings_total
                  : null,
            };
          })
        );

        return detailedResults;
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
