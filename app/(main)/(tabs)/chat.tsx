import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/product-card";
import { auth } from "@/firebase";
import { GET } from "@/lib/fetchFormat";

type ChatMode = "buying" | "selling";

type ChatListing = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
  contactPhone?: string | null;
};

type ChatApiRow = {
  prod_id: number;
  title: string;
  price: number | string;
  product_photo_url_1?: string | null;
  seller_first_name?: string | null;
  seller_last_name?: string | null;
  seller_phone_number?: string | null;
  buyer_first_name?: string | null;
  buyer_last_name?: string | null;
  buyer_phone_number?: string | null;
};

const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";

function formatPrice(price: number | string) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return `$${price}`;
  }

  return new Intl.NumberFormat("en-AU", {
    currency: "AUD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(numericPrice);
}

function mapChat(row: ChatApiRow, mode: ChatMode): ChatListing {
  const firstName =
    mode === "buying" ? row.seller_first_name : row.buyer_first_name;
  const lastName =
    mode === "buying" ? row.seller_last_name : row.buyer_last_name;
  const phone =
    mode === "buying" ? row.seller_phone_number : row.buyer_phone_number;

  return {
    id: String(row.prod_id),
    title: row.title,
    price: formatPrice(row.price),
    imageUri: row.product_photo_url_1 || FALLBACK_IMAGE,
    avatarUrl: FALLBACK_AVATAR,
    sellerFirstName: firstName?.trim() || (mode === "buying" ? "Seller" : "Buyer"),
    sellerLastName: lastName?.trim() || "",
    contactPhone: phone?.trim() || null,
  };
}

function smsUrl(phone: string, body?: string): string {
  const trimmed = phone.replace(/[^\d+]/g, "");
  if (!trimmed) return "sms:";
  const encodedBody = body ? encodeURIComponent(body) : "";
  if (Platform.OS === "ios") {
    return encodedBody ? `sms:${trimmed}&body=${encodedBody}` : `sms:${trimmed}`;
  }
  return encodedBody ? `sms:${trimmed}?body=${encodedBody}` : `sms:${trimmed}`;
}

export default function ChatScreen() {
  const [activeMode, setActiveMode] = useState<ChatMode>("buying");
  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState<ChatListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((current) => current + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;

    async function loadChats() {
      try {
        setIsLoading(true);
        setLoadError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const response = await GET<ChatApiRow[]>(
          `${API_BASE_URL}/chats/${activeMode}`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }

        if (isActive) {
          setListings(response.data.map((row) => mapChat(row, activeMode)));
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load chats.",
          );
          setListings([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadChats();

    return () => {
      isActive = false;
    };
  }, [activeMode, focusRefreshKey]);

  const visibleListings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        `${item.sellerFirstName} ${item.sellerLastName}`
          .toLowerCase()
          .includes(q),
    );
  }, [listings, searchTerm]);

  const openSms = useCallback(async (listing: ChatListing) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "SMS on device only",
        "Open this screen in Expo Go on your phone to message people via SMS.",
      );
      return;
    }

    if (!listing.contactPhone?.trim()) {
      Alert.alert("Contact unavailable", "No phone number for this chat yet.");
      return;
    }

    const body = `Hi, I'm messaging about: ${listing.title}`;
    const url = smsUrl(listing.contactPhone, body);

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Something went wrong", "Could not open the messaging app.");
    }
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Messages</Text>
        <Text style={styles.subtitle}>
          Tap a listing to open SMS. Chat history stays in your messages app.
        </Text>

        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveMode("buying")}
            style={({ pressed }) => [
              styles.filterChip,
              activeMode === "buying" && styles.filterChipActive,
              pressed && styles.filterChipPressed,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                activeMode === "buying" && styles.filterChipTextActive,
              ]}
            >
              Buying
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveMode("selling")}
            style={({ pressed }) => [
              styles.filterChip,
              activeMode === "selling" && styles.filterChipActive,
              pressed && styles.filterChipPressed,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                activeMode === "selling" && styles.filterChipTextActive,
              ]}
            >
              Selling
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchShell}>
          <MaterialIcons color="#8D95C8" name="search" size={20} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchTerm}
            placeholder="Search products..."
            placeholderTextColor="#8D95C8"
            style={styles.searchInput}
            value={searchTerm}
          />
        </View>

        <View style={styles.listings}>
          {isLoading ? <ActivityIndicator color="#0057BD" size="large" /> : null}

          {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}

          {visibleListings.map((listing) => (
            <ProductCard
              avatarUrl={listing.avatarUrl}
              imageUri={listing.imageUri}
              key={listing.id}
              layout="row"
              onPress={() => void openSms(listing)}
              price={listing.price}
              sellerFirstName={listing.sellerFirstName}
              sellerLastName={listing.sellerLastName}
              title={listing.title}
            />
          ))}
        </View>

        {!isLoading && !loadError && visibleListings.length === 0 ? (
          <Text style={styles.empty}>
            {activeMode === "buying"
              ? "No buying chats yet."
              : "No selling chats yet."}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  screenTitle: {
    color: "#242C51",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6C759E",
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "#E7ECFF",
    borderColor: "#C9D4FF",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#0057BD",
    borderColor: "#0057BD",
  },
  filterChipPressed: {
    opacity: 0.86,
  },
  filterChipText: {
    color: "#4A5383",
    fontSize: 14,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  searchShell: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#DCE3FF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#4A5383",
    fontSize: 15,
    paddingVertical: 0,
  },
  listings: {
    gap: 10,
    marginTop: 4,
  },
  empty: {
    color: "#6C759E",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 12,
  },
});
