import { Stack } from "expo-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";

// Temporary dev toggle so you can build/test authenticated UI before backend login is wired.

export default function MainLayout() {
  const content = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      <Stack.Screen name="product-detail/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="manage-list" options={{ headerShown: false }} />
    </Stack>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
