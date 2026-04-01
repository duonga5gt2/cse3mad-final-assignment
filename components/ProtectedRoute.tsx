import { Redirect } from "expo-router";
import { ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}
