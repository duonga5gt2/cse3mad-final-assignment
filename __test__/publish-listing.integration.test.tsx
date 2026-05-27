import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import type * as ReactNative from "react-native";

import PublishScreen from "../app/(main)/(tabs)/publish";

const mockPost = jest.fn<
  (url: string, token: string | null | undefined, body?: Record<string, unknown>) => Promise<{
    ok: boolean;
    data?: { prod_id: number };
    error?: string;
  }>
>();

const mockPatch = jest.fn<
  (url: string, token: string | null | undefined, body?: Record<string, unknown>) => Promise<{
    ok: boolean;
    data?: Record<string, unknown>;
    error?: string;
  }>
>();

const mockRefreshCurrentUser = jest.fn<() => Promise<{ uid: string; emailVerified: boolean }>>();
const mockAutocompleteAddress = jest.fn<(input: string) => Promise<unknown[]>>();
const mockGetPlaceLatLng = jest.fn<
  () => Promise<{
    placeId: string;
    address: string;
    latitude: number;
    longitude: number;
  }>
>();

const mockUploadProductImage = jest.fn<
  () => Promise<string>
>();

jest.mock("@/firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve("test-token")),
    },
  },
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    refreshCurrentUser: mockRefreshCurrentUser,
  }),
}));

jest.mock("@/lib/fetchFormat", () => ({
  POST: (url: string, token: string | null | undefined, body?: Record<string, unknown>) =>
    mockPost(url, token, body),
  PATCH: (url: string, token: string | null | undefined, body?: Record<string, unknown>) =>
    mockPatch(url, token, body),
  GET: jest.fn(),
}));

jest.mock("@/lib/mapFetch", () => ({
  autocompleteAddress: (input: string) => mockAutocompleteAddress(input),
  getPlaceLatLng: () => mockGetPlaceLatLng(),
}));

jest.mock("@/storage", () => ({
  uploadProductImage: () => mockUploadProductImage(),
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" as const }),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: "file:///test-photo.jpg" }],
    }),
  ),
}));

jest.mock("expo-image", () => {
  const { Image } = jest.requireActual<typeof ReactNative>("react-native");
  return { Image };
});

jest.mock("@/components/ui/map", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } = jest.requireActual<typeof ReactNative>("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View),
  };
});

const MOCK_PLACE = {
  placeId: "place-1",
  address: "Surry Hills, Sydney NSW, Australia",
  latitude: -33.884,
  longitude: 151.209,
};

const MOCK_SUGGESTION = {
  placePrediction: {
    placeId: "place-1",
    text: { text: "Surry Hills, Sydney NSW, Australia" },
  },
};

describe("Publish listing (integration)", () => {
  let alertSpy: jest.SpiedFunction<typeof Alert.alert>;

  beforeEach(() => {
    jest.useFakeTimers();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockPost.mockReset();
    mockPatch.mockReset();
    mockRefreshCurrentUser.mockReset();
    mockAutocompleteAddress.mockReset();
    mockGetPlaceLatLng.mockReset();
    mockUploadProductImage.mockReset();

    mockRefreshCurrentUser.mockResolvedValue({
      uid: "test-user-id",
      emailVerified: true,
    });
    mockAutocompleteAddress.mockResolvedValue([MOCK_SUGGESTION]);
    mockGetPlaceLatLng.mockResolvedValue(MOCK_PLACE);
    mockPost.mockResolvedValue({ ok: true, data: { prod_id: 42 } });
    mockPatch.mockResolvedValue({ ok: true, data: {} });
    mockUploadProductImage.mockResolvedValue("https://example.com/photo1.jpg");
  });

  afterEach(() => {
    jest.useRealTimers();
    alertSpy.mockRestore();
  });

  it("shows an alert when required fields are missing", () => {
    const screen = render(<PublishScreen />);

    fireEvent.press(screen.getByText("Publish listing"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Missing information",
      "Please fill in title, price, description, and choose a pickup location.",
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("creates a listing via POST and uploads photos via PATCH", async () => {
    const screen = render(<PublishScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("What are you selling?"),
      "Desk Lamp",
    );
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 120"), "120");
    fireEvent.changeText(
      screen.getByPlaceholderText("Condition, size, included accessories..."),
      "Good condition.",
    );

    await act(async () => {
      fireEvent.changeText(
        screen.getByPlaceholderText("Suburb or landmark for meet-up"),
        "Surry Hills",
      );
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(screen.getByText("Surry Hills, Sydney NSW, Australia")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Surry Hills, Sydney NSW, Australia"));

    await waitFor(() => {
      expect(mockGetPlaceLatLng).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByLabelText("Add photo 1"));

    await waitFor(() => {
      expect(screen.getByLabelText("Remove photo 1")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Publish listing"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      "test-token",
      expect.objectContaining({
        title: "Desk Lamp",
        price: 120,
        description: "Good condition.",
        pickUpLocationText: MOCK_PLACE.address,
        latitude: MOCK_PLACE.latitude,
        longitude: MOCK_PLACE.longitude,
      }),
    );

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledTimes(1);
    });

    expect(mockPatch).toHaveBeenCalledWith(
      expect.stringContaining("/products/42"),
      "test-token",
      expect.objectContaining({
        productPhotoUrl1: "https://example.com/photo1.jpg",
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Listing published",
      "Your listing and photos have been uploaded.",
    );
  });
});
