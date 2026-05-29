"use server";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

export type PlaceSuggestion = {
  placeId: string;
  primary: string;
  secondary: string;
};

export type PlaceDetails = {
  lat: number;
  lng: number;
  address: string;
  district: string;
};

type SearchResult = { suggestions: PlaceSuggestion[] } | { error: string };
type DetailsResult = PlaceDetails | { error: string };

type GAutocompleteResp = {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text?: { text: string };
      structuredFormat?: {
        mainText?: { text: string };
        secondaryText?: { text: string };
      };
    };
  }[];
};

type GComponent = { types?: string[]; longText?: string; shortText?: string };
type GDetailsResp = {
  location?: { latitude: number; longitude: number };
  formattedAddress?: string;
  addressComponents?: GComponent[];
  displayName?: { text: string };
};

function apiKey(): string {
  const k = process.env.GOOGLE_MAPS_API_KEY;
  if (!k) throw new Error("Missing GOOGLE_MAPS_API_KEY in environment.");
  return k;
}

export async function searchPlaces(input: string): Promise<SearchResult> {
  const q = input.trim();
  if (q.length < 2) return { suggestions: [] };

  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey(),
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: ["ng"],
        locationBias: {
          circle: {
            center: { latitude: 6.5244, longitude: 3.3792 },
            radius: 50000,
          },
        },
      }),
    });

    if (!res.ok) {
      return { error: `Place search failed (${res.status}).` };
    }

    const data = (await res.json()) as GAutocompleteResp;
    const suggestions: PlaceSuggestion[] = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
      .map((p) => ({
        placeId: p.placeId,
        primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
      }));

    return { suggestions };
  } catch {
    return { error: "Place search is unavailable." };
  }
}

const DISTRICT_TYPES = [
  "sublocality_level_1",
  "sublocality",
  "neighborhood",
  "locality",
  "administrative_area_level_2",
];

function pickDistrict(components: GComponent[]): string {
  for (const type of DISTRICT_TYPES) {
    const match = components.find((c) => (c.types ?? []).includes(type));
    if (match) return match.longText ?? match.shortText ?? "";
  }
  return "";
}

export async function getPlaceDetails(placeId: string): Promise<DetailsResult> {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey(),
          "X-Goog-FieldMask":
            "location,formattedAddress,addressComponents,displayName",
        },
      },
    );

    if (!res.ok) {
      return { error: `Place details failed (${res.status}).` };
    }

    const data = (await res.json()) as GDetailsResp;
    const lat = data.location?.latitude;
    const lng = data.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return { error: "No coordinates for that place." };
    }

    const district = pickDistrict(data.addressComponents ?? []);
    return {
      lat,
      lng,
      address: district || data.displayName?.text || "",
      district,
    };
  } catch {
    return { error: "Place details are unavailable." };
  }
}
