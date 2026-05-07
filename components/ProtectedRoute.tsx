import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { LoadingCard } from "./LoadingCard";

import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingCard />;
  }

  if (!user) {
    return <Redirect href="/(public)" />;
  }

  return <>{children}</>;
}
