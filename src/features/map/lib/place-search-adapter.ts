"use client";

export type PlaceSearchResult = {
  placeId: string;
  title: string;
  subtitle: string;
};

export type PlaceDetailsResult = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
};

export type PlaceSearchAdapter = {
  isReady: boolean;
  searchPlaces: (query: string) => Promise<PlaceSearchResult[]>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetailsResult>;
};
