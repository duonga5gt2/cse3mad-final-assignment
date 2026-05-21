import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import type * as ReactNative from "react-native";

import ProductDetailScreen from "../app/(main)/product-detail/[id]";

// Product detail imports auth from firebase.ts, which needs AsyncStorage (native-only).
jest.mock("@/firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve("test-token")),
    },
  },
}));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: "mock-1" }),
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

describe("Product detail  contact seller SMS (integration)", () => {
  let openUrlSpy: ReturnType<typeof jest.spyOn<typeof Linking, "openURL">>;

  beforeEach(() => {
    openUrlSpy = jest
      .spyOn(Linking, "openURL")
      .mockImplementation(() => Promise.resolve());
    Platform.OS = "ios";
  });

  afterEach(() => {
    openUrlSpy.mockRestore();
  });

  it("opens SMS with seller phone and listing title for mock product", async () => {
    const screen = render(<ProductDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText("Eames Lounge Chair")).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText("Chat with seller via SMS"));

    await waitFor(() => {
      expect(openUrlSpy).toHaveBeenCalledTimes(1);
    });

    const url = openUrlSpy.mock.calls[0]?.[0] as string;
    expect(url).toContain("sms:");
    expect(url).toContain("61400111222");
    expect(url).toContain(encodeURIComponent("Hi, I'm interested in: Eames Lounge Chair"));
  });
});
