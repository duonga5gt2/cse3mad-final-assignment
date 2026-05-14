import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/product-card";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";

type TabKey = "listings" | "pending";

type ManageRow = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerPhone?: string;
};

const MOCK_LISTINGS: ManageRow[] = [
  {
    id: "ml-1",
    title: "Eames Lounge Chair",
    price: "$4,850",
    imageUri:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "You",
    sellerLastName: "",
  },
  {
    id: "ml-2",
    title: "Ceramic Table Lamp",
    price: "$120",
    imageUri:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "You",
    sellerLastName: "",
  },
];

const MOCK_PENDING: ManageRow[] = [
  {
    id: "mp-1",
    title: "Vintage Camera Lens",
    price: "$790",
    imageUri:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Ava",
    sellerLastName: "Patel",
    sellerPhone: "+61400555666",
  },
  {
    id: "mp-2",
    title: "Leather Weekender Bag",
    price: "$340",
    imageUri:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "James",
    sellerLastName: "Ortiz",
    sellerPhone: "+61400777888",
  },
];

function smsUrl(phone: string, body?: string): string {
  const trimmed = phone.replace(/[^\d+]/g, "");
  if (!trimmed) return "sms:";
  const encodedBody = body ? encodeURIComponent(body) : "";
  if (Platform.OS === "ios") {
    return encodedBody ? `sms:${trimmed}&body=${encodedBody}` : `sms:${trimmed}`;
  }
  return encodedBody ? `sms:${trimmed}?body=${encodedBody}` : `sms:${trimmed}`;
}

function goBackToProfile() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(main)/(tabs)/profile");
  }
}

export default function ManageListScreen() {
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string | string[] }>();

  const initialTab = useMemo((): TabKey => {
    const raw = Array.isArray(tabParam) ? tabParam[0] : tabParam;
    return raw === "pending" ? "pending" : "listings";
  }, [tabParam]);

  const [tab, setTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const rows = tab === "listings" ? MOCK_LISTINGS : MOCK_PENDING;

  const contactSeller = useCallback((item: ManageRow) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "SMS on device only",
        "Open this screen on your phone to message the seller.",
      );
      return;
    }
    if (!item.sellerPhone?.trim()) {
      Alert.alert("Contact unavailable", "No phone number for this seller.");
      return;
    }
    const url = smsUrl(item.sellerPhone, `Hi, I'm interested in: ${item.title}`);
    void Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the messaging app."),
    );
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to profile"
          accessibilityRole="button"
          hitSlop={10}
          onPress={goBackToProfile}
          style={styles.backBtn}
        >
          <MaterialIcons color={BRAND} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Sydney Exchange</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        style={styles.scrollView}
      >
        <Text style={styles.screenTitle}>Manage listings</Text>
        <Text style={styles.subtitle}>
          {"Switch between your published products and items you're interested in."}
        </Text>

        <View style={styles.tabRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: tab === "listings" }}
            onPress={() => setTab("listings")}
            style={[styles.tab, tab === "listings" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "listings" && styles.tabTextActive]}>
              My listings
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: tab === "pending" }}
            onPress={() => setTab("pending")}
            style={[styles.tab, tab === "pending" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "pending" && styles.tabTextActive]}>
              Pending
            </Text>
          </Pressable>
        </View>

        {rows.map((item) => (
          <View key={item.id} style={styles.cardBlock}>
            <ProductCard
              avatarUrl={item.avatarUrl}
              imageUri={item.imageUri}
              price={item.price}
              sellerFirstName={item.sellerFirstName}
              sellerLastName={item.sellerLastName}
              title={item.title}
            />

            {tab === "listings" ? (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert(
                      "Edit listing",
                      "Hook this to your edit flow (e.g. publish screen with prod id) when ready.",
                    )
                  }
                  style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                >
                  <MaterialIcons color="#FFFFFF" name="edit" size={20} />
                  <Text style={styles.primaryActionText}>Edit listing</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert(
                      "Remove listing",
                      "Confirm with your teammate, then call DELETE on the listing API.",
                    )
                  }
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryActionText}>Remove listing</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => contactSeller(item)}
                  style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                >
                  <MaterialIcons color="#FFFFFF" name="sms" size={20} />
                  <Text style={styles.primaryActionText}>Contact seller</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    Alert.alert(
                      "Not interested",
                      "Remove this from your pending list when the API is wired.",
                    )
                  }
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryActionText}>
                    {"I'm no longer interested"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        {rows.length === 0 ? (
          <Text style={styles.empty}>Nothing here yet.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  headerSpacer: { width: 44 },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: CARD_TEXT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    marginBottom: 18,
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E4E8FF",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: BRAND,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A5383",
  },
  tabTextActive: {
    color: BRAND,
  },
  cardBlock: {
    marginBottom: 22,
    alignItems: "center",
  },
  actions: {
    width: "92%",
    maxWidth: 380,
    marginTop: 12,
    gap: 10,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: BRAND,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B8C4FF",
    backgroundColor: "#EEF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.9,
  },
  empty: {
    textAlign: "center",
    color: MUTED,
    fontSize: 15,
    marginTop: 12,
  },
});
