import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import type { ReactNode } from "react";

import ForgetPasswordScreen from "../app/(public)/forget-password";

const mockResetPassword = jest.fn<() => Promise<void>>();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
  }),
}));

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
}));

describe("ForgetPasswordScreen", () => {
  beforeEach(() => {
    mockResetPassword.mockReset();
  });

  it("renders the forgot password heading and submit button", () => {
    const screen = render(<ForgetPasswordScreen />);

    expect(screen.getByText("Forgot Password")).toBeTruthy();
    expect(screen.getByText("Send reset link")).toBeTruthy();
    expect(screen.getByText("Back to login")).toBeTruthy();
  });

  it("shows an error when email is empty", async () => {
    const screen = render(<ForgetPasswordScreen />);

    fireEvent.press(screen.getByLabelText("Send password reset link"));

    expect(screen.getByText("Please enter your email address.")).toBeTruthy();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });
});
