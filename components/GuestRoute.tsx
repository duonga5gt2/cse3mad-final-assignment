import { Redirect } from "expo-router";
import { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
}
