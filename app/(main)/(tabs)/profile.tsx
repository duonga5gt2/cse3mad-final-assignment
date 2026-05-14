import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useAuth } from "@/contexts/AuthContext";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";

/** Mock profile — replace with GET /me when you wire the backend. */
const MOCK_PROFILE = {
  firstName: "Jordan",
  lastName: "Lee",
  phone: "+61 400 555 012",
  email: "jordan.lee@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
};

type PreviewItem = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
};

const MOCK_PENDING: PreviewItem[] = [
  {
    id: "p1",
    title: "Vintage Camera Lens",
    price: "$790",
    imageUri:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "p2",
    title: "Ceramic Table Lamp",
    price: "$120",
    imageUri:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80",
  },
];

const MOCK_LISTINGS: PreviewItem[] = [
  {
    id: "l1",
    title: "Lounge Chair 02",
    price: "$2,450",
    imageUri:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "l2",
    title: "Leather Weekender",
    price: "$340",
    imageUri:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80",
  },
];

function PreviewRow({ item }: { item: PreviewItem }) {
  return (
    <View style={styles.previewRow}>
      <Image contentFit="cover" source={{ uri: item.imageUri }} style={styles.previewThumb} />
      <View style={styles.previewBody}>
        <Text numberOfLines={1} style={styles.previewTitle}>
          {item.title}
        </Text>
        <Text style={styles.previewPrice}>{item.price}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { logout, isEmailVerified } = useAuth();
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
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <Image
              contentFit="cover"
              source={{ uri: MOCK_PROFILE.avatarUrl }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>
            {MOCK_PROFILE.firstName} {MOCK_PROFILE.lastName}
          </Text>
          <Text style={styles.metaLine}>{MOCK_PROFILE.phone}</Text>
          <Text style={styles.metaLine}>{MOCK_PROFILE.email}</Text>

          <Pressable
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Edit profile", "Form and API wiring can be added when you are ready.")
            }
            style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
          >
            <MaterialIcons color="#FFFFFF" name="edit" size={20} />
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert("View all", "Manage listings screen will open here when connected.")
              }
            >
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHint}>{"Items you're interested in"}</Text>
          {MOCK_PENDING.map((item) => (
            <PreviewRow item={item} key={item.id} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My listings</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert("View all", "Manage listings screen will open here when connected.")
              }
            >
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHint}>{"What you're selling"}</Text>
          {MOCK_LISTINGS.map((item) => (
            <PreviewRow item={item} key={item.id} />
          ))}
        </View>

        {!isEmailVerified ? (
          <Pressable
            accessibilityLabel="Open verify email screen"
            accessibilityRole="button"
            onPress={() => router.push("/(main)/verify-email")}
            style={({ pressed }) => [styles.verifyButton, pressed && styles.verifyButtonPressed]}
          >
            <Text style={styles.verifyButtonText}>Verify email</Text>
          </Pressable>
        ) : (
          <Text style={styles.verifiedNote}>Your email is verified.</Text>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: CARD_TEXT,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#242C51",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    alignItems: "center",
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#E8ECFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: CARD_TEXT,
    textAlign: "center",
  },
  metaLine: {
    marginTop: 6,
    fontSize: 15,
    color: MUTED,
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    minWidth: 200,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: BRAND,
    paddingHorizontal: 24,
  },
  editButtonPressed: {
    opacity: 0.9,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  sectionHint: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 10,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#242C51",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  previewThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E8ECFF",
  },
  previewBody: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  previewPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: BRAND,
  },
  verifyButton: {
    marginTop: 4,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND,
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 24,
  },
  verifyButtonPressed: {
    opacity: 0.88,
  },
  verifyButtonText: {
    color: BRAND,
    fontSize: 16,
    fontWeight: "700",
  },
  verifiedNote: {
    marginTop: 12,
    fontSize: 15,
    color: "#027A48",
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 20,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: BRAND,
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
