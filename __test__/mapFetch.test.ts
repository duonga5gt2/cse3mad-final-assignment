import { beforeEach, describe, expect, it, jest } from "@jest/globals";

function mockFetchResponse(body: unknown) {
  return {
    json: () => Promise.resolve(body),
    ok: true,
  } as Response;
}

describe("autocompleteAddress", () => {
  const fetchMock = jest.fn<() => Promise<Response>>();

  beforeEach(() => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_MAP_KEY = "test-map-key";
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  it("requests Google autocomplete suggestions restricted to Sydney", async () => {
    const { autocompleteAddress } = jest.requireActual<
      typeof import("../lib/mapFetch")
    >("../lib/mapFetch");
    const suggestions = [
      {
        placePrediction: {
          place: "places/mock-place",
          placeId: "mock-place",
          text: { text: "Central Station, Sydney NSW, Australia" },
        },
      },
    ];

    fetchMock.mockResolvedValueOnce(mockFetchResponse({ suggestions }));

    await expect(autocompleteAddress("central")).resolves.toEqual(suggestions);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:autocomplete",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "test-map-key",
        },
        body: JSON.stringify({
          input: "central",
          includedRegionCodes: ["au"],
          languageCode: "en",
          locationRestriction: {
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
          },
          regionCode: "AU",
        }),
      }),
    );
  });
});
