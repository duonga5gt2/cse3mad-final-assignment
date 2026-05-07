// app/(public)/_layout.tsx
import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forget-password" options={{ headerShown: false }} />
      <Stack.Screen name="profile-image" options={{ headerShown: false }} />
    </Stack>
  );
}
