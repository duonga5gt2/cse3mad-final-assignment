// app/(public)/_layout.tsx
import { LoadingCard } from "@/components/LoadingCard";
import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

export default function PublicLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingCard />;

  // if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forget-password" options={{ headerShown: false }} />
      <Stack.Screen name="profile-image" options={{ headerShown: false }} />
    </Stack>
  );
}
