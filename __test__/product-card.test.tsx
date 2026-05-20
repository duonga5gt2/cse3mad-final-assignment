import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import type * as ReactNative from "react-native";

import { ProductCard } from "../components/ui/product-card";

jest.mock("expo-image", () => {
  const { Image } = jest.requireActual<typeof ReactNative>("react-native");

  return { Image };
});

describe("ProductCard", () => {
  it("renders product details and calls onPress when selected", () => {
    const onPress = jest.fn();

    const screen = render(
      <ProductCard
        avatarUrl="https://example.com/avatar.jpg"
        imageUri="https://example.com/product.jpg"
        onPress={onPress}
        price="$40"
        sellerFirstName="Alex"
        sellerLastName="Nguyen"
        title="Desk Lamp"
      />,
    );

    expect(screen.getByText("Desk Lamp")).toBeTruthy();
    expect(screen.getByText("$40")).toBeTruthy();
    expect(screen.getByText("Alex Nguyen")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Open product Desk Lamp"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
