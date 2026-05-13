import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function onLogoutPress() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Profile and settings entry points go here.</Text>
      <Pressable
        accessibilityLabel="Log out"
        accessibilityRole="button"
        disabled={isLoggingOut}
        onPress={onLogoutPress}
        style={({ pressed }) => [
          styles.logoutButton,
          (pressed || isLoggingOut) && styles.logoutButtonPressed,
        ]}
      >
        <Text style={styles.logoutButtonText}>
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#242C51",
    marginBottom: 10,
  },
  copy: {
    fontSize: 16,
    color: "#6C759E",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 24,
    minWidth: 160,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#0057BD",
    paddingHorizontal: 20,
  },
  logoutButtonPressed: {
    opacity: 0.86,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
