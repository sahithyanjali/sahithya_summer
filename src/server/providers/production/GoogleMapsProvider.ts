import type { IMapsProvider, ProviderMetadata, GeocodeResult, DistanceResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class GoogleMapsProvider implements IMapsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "GOOGLE_MAPS_PLATFORM",
    isMock: false,
    version: "1.0.0"
  };

  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GoogleMapsProvider requires GOOGLE_MAPS_API_KEY");
    }
    this.apiKey = apiKey;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status === "OK" && data.results.length > 0) {
        const item = data.results[0];
        return {
          lat: item.geometry.location.lat,
          lng: item.geometry.location.lng,
          formattedAddress: item.formatted_address,
          placeId: item.place_id
        };
      }
      return null;
    } catch (err) {
      logger.error("Google Maps geocode failed", err);
      return null;
    }
  }

  async calculateDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<DistanceResult> {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
        const element = data.rows[0].elements[0];
        return {
          distanceKm: Math.round((element.distance.value / 1000) * 10) / 10,
          durationMinutes: Math.round(element.duration.value / 60)
        };
      }
    } catch (err) {
      logger.error("Google Maps distance calculation failed", err);
    }

    // Mathematical fallback if API fails
    const R = 6371;
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return {
      distanceKm: Math.round(R * c * 10) / 10,
      durationMinutes: Math.round(R * c * 2.5)
    };
  }
}
