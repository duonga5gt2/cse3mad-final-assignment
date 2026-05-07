// app/(public)/_layout.tsx
import { GuestRoute } from "@/components/GuestRoute";
import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <GuestRoute>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="forget-password" options={{ headerShown: false }} />
        <Stack.Screen name="profile-image" options={{ headerShown: false }} />
      </Stack>
    </GuestRoute>
  );
}
