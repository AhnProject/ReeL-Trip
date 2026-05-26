import { apiRequest } from "@/lib/api-client";

export interface PlaceResponse {
  id: number;
  spaceId: number;
  name: string;
  category: string | null;
  address: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  priceDesc: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string | null;
  hours: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  tags: string[];
  menu: string[];
  confidence: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddPlacePayload {
  spaceId: number;
  name: string;
  category?: string;
  address?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  priceDesc?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  hours?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  tags?: string[];
  menu?: string[];
  confidence?: string;
}

export function listPlaces(spaceId: number, token: string) {
  return apiRequest<PlaceResponse[]>(`/api/places?spaceId=${spaceId}`, {}, token);
}

export function getPlace(id: number, token: string) {
  return apiRequest<PlaceResponse>(`/api/places/${id}`, {}, token);
}

export function addPlace(payload: AddPlacePayload, token: string) {
  return apiRequest<PlaceResponse>("/api/places", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function deletePlace(id: number, token: string) {
  return apiRequest<void>(`/api/places/${id}`, { method: "DELETE" }, token);
}
