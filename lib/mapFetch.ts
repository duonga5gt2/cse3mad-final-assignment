const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_MAP_KEY;

const SYDNEY_LOCATION_RESTRICTION = {
  rectangle: {
    low: {
      latitude: -34.1183,
      longitude: 150.5209,
    },
    high: {
      latitude: -33.5781,
      longitude: 151.343,
    },
  },
};

function getGoogleApiKey() {
  if (!GOOGLE_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_MAP_KEY environment variable.");
  }

  return GOOGLE_API_KEY;
}

export type AddressAutocompleteSuggestion = {
  placePrediction?: {
    place?: string;
    placeId?: string;
    text?: {
      text?: string;
    };
  };
};

export async function autocompleteAddress(input: string) {
  if (!input || input.length < 3) return [];

  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": getGoogleApiKey(),
      },
      body: JSON.stringify({
        input: input,
        includedRegionCodes: ["au"],
        locationRestriction: SYDNEY_LOCATION_RESTRICTION,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Failed to autocomplete address.");
  }

  return (data.suggestions || []) as AddressAutocompleteSuggestion[];
}

type GooglePlaceDetailsResponse = {
  id: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

export type PlaceLatLng = {
  placeId: string;
  address: string;
  latitude: number;
  longitude: number;
};

export async function getPlaceLatLng(placeId: string): Promise<PlaceLatLng> {
  const placeResource = placeId.startsWith("places/")
    ? placeId
    : `places/${placeId}`;

  const response = await fetch(
    `https://places.googleapis.com/v1/${placeResource}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": getGoogleApiKey(),
        "X-Goog-FieldMask": "id,formattedAddress,location",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch place details: ${response.status}`);
  }

  const data: GooglePlaceDetailsResponse = await response.json();

  return {
    placeId: data.id,
    address: data.formattedAddress,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };
}
