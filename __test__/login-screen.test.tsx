import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import LoginScreen from "../app/(public)/index";

// Fake login function — we control it in tests instead of calling Firebase.
const mockLogin = jest.fn<() => Promise<void>>();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Link only navigates; for unit tests we render children without routing.
jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("renders the login heading and submit button", () => {
    const screen = render(<LoginScreen />);

    expect(screen.getByText("Log in")).toBeTruthy();
    expect(screen.getByText("Access account")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
  });

  it("shows an error when email or password is empty", async () => {
    const screen = render(<LoginScreen />);

    fireEvent.press(screen.getByLabelText("Access account"));

    expect(screen.getByText("Please enter your email and password.")).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("calls login with trimmed lowercase email and password", async () => {
    mockLogin.mockResolvedValue(undefined);

    const screen = render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("name@example.com"),
      "  User@Example.COM  ",
    );
    fireEvent.changeText(screen.getByPlaceholderText("Enter password"), "MyPass123!");

    fireEvent.press(screen.getByLabelText("Access account"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "MyPass123!");
  });
});
