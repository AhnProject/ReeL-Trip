import { describe, it, expect } from "vitest";
import { filterPlacesWithCoordinates } from "./TravelMapView";
import type { PlaceResponse } from "@/domains/place/api";

function makePlace(overrides: Partial<PlaceResponse>): PlaceResponse {
  return {
    id: 1,
    spaceId: 1,
    name: "테스트 장소",
    category: null,
    address: null,
    region: null,
    country: null,
    latitude: null,
    longitude: null,
    priceDesc: null,
    priceMin: null,
    priceMax: null,
    currency: null,
    hours: null,
    hoursStructured: null,
    thumbnailUrl: null,
    sourceUrl: null,
    sourcePlatform: null,
    tags: [],
    menu: [],
    confidence: null,
    createdBy: 1,
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-01-01T00:00:00",
    ...overrides,
  };
}

describe("filterPlacesWithCoordinates", () => {
  it("keeps only places with both latitude and longitude", () => {
    const places = [
      makePlace({ id: 1, latitude: 37.5, longitude: 127.0 }),
      makePlace({ id: 2, latitude: null, longitude: 127.0 }),
      makePlace({ id: 3, latitude: 37.5, longitude: null }),
      makePlace({ id: 4, latitude: null, longitude: null }),
    ];

    const result = filterPlacesWithCoordinates(places);

    expect(result.map((p) => p.id)).toEqual([1]);
  });

  it("returns an empty array (not an error) when no places have coordinates", () => {
    const places = [makePlace({ id: 1 }), makePlace({ id: 2 })];

    expect(filterPlacesWithCoordinates(places)).toEqual([]);
  });

  it("returns all places when every place has coordinates", () => {
    const places = [
      makePlace({ id: 1, latitude: 37.5, longitude: 127.0 }),
      makePlace({ id: 2, latitude: 35.1, longitude: 129.0 }),
    ];

    expect(filterPlacesWithCoordinates(places)).toHaveLength(2);
  });
});
