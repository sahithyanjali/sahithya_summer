import type { IMapsProvider, ProviderMetadata, GeocodeResult, DistanceResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockMapsProvider implements IMapsProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_MAPS_PROVIDER",
    isMock: true,
    version: "1.0.0"
  };

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    logger.info("MockMapsProvider: Simulated geocoding", { address });
    // Deterministic Karnataka coordinates for Seva centers
    return {
      lat: 12.9716,
      lng: 77.5946,
      formattedAddress: `${address}, Karnataka, India`,
      placeId: `mock_place_${Date.now()}`
    };
  }

  async calculateDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<DistanceResult> {
    // Haversine formula calculation for realistic distance
    const R = 6371; // Earth radius in km
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 10) / 10;
    const durationMinutes = Math.round(distanceKm * 2.2); // ~30 km/h average city transit

    return {
      distanceKm: Math.max(1, distanceKm),
      durationMinutes: Math.max(5, durationMinutes)
    };
  }
}
