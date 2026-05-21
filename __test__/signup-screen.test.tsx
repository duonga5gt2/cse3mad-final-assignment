import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Alert, TextInput } from "react-native";

import SignupScreen from "../app/(public)/signup";

const mockSignup = jest.fn<(email: string, password: string) => Promise<string>>();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signup: mockSignup,
  }),
}));

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/firebase", () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(() => Promise.resolve("test-token")),
    },
  },
}));

jest.mock("@/storage", () => ({
  uploadAvatarImage: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/lib/fetchFormat", () => ({
  POST: jest.fn(() => Promise.resolve({ ok: true })),
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

function fillSignupForm(
  screen: ReturnType<typeof render>,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  },
) {
  const inputs = screen.UNSAFE_getAllByType(TextInput);
  expect(inputs.length).toBe(5);
  fireEvent.changeText(inputs[0], data.firstName);
  fireEvent.changeText(inputs[1], data.lastName);
  fireEvent.changeText(inputs[2], data.email);
  fireEvent.changeText(inputs[3], data.phone);
  fireEvent.changeText(inputs[4], data.password);
}

describe("SignupScreen", () => {
  let alertSpy: ReturnType<typeof jest.spyOn<typeof Alert, "alert">>;

  beforeEach(() => {
    mockSignup.mockReset();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("renders the create account heading and submit button", () => {
    const screen = render(<SignupScreen />);

    expect(screen.getByText("Create Account")).toBeTruthy();
    expect(screen.getByText("Finish sign up")).toBeTruthy();
    expect(screen.getByText("Login")).toBeTruthy();
    expect(screen.getByText("Upload photo")).toBeTruthy();
  });

  it("shows an alert when required fields are empty", () => {
    const screen = render(<SignupScreen />);

    fireEvent.press(screen.getByLabelText("Finish sign up"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Missing information",
      "Please fill in all fields to continue.",
    );
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("calls signup when all fields are valid", async () => {
    mockSignup.mockResolvedValue("test-uid");

    const screen = render(<SignupScreen />);

    fillSignupForm(screen, {
      firstName: "Jane",
      lastName: "Doe",
      email: "user@example.com",
      phone: "0400000000",
      password: "MyPass123!",
    });

    fireEvent.press(screen.getByLabelText("Finish sign up"));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1);
    });

    expect(mockSignup).toHaveBeenCalledWith("user@example.com", "MyPass123!");
  });
});
