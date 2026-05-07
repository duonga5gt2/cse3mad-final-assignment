import { Redirect } from "expo-router";
import { ReactNode } from "react";

import { LoadingCard } from "@/components/LoadingCard";
import { useAuth } from "@/contexts/AuthContext";

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingCard />;
  }

  if (user) {
    console.log("Redirected!");
    return <Redirect href="/(main)/(tabs)/home" />;
  }

  return <>{children}</>;
}
