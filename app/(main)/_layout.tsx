import { Stack } from "expo-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";

// Temporary dev toggle so you can build/test authenticated UI before backend login is wired.
const ENABLE_DEV_AUTH_BYPASS = true;

export default function MainLayout() {
  const content = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );

  if (ENABLE_DEV_AUTH_BYPASS) {
    return content;
  }

  return (
    <ProtectedRoute>
      {content}
    </ProtectedRoute>
  );
}
