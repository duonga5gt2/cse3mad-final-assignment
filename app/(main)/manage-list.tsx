import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/product-card";
import { auth } from "@/firebase";
import { DELETE, GET } from "@/lib/fetchFormat";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";
const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";

type TabKey = "listings" | "pending";

type ManageRow = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl?: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerPhone?: string;
};

type ManageApiRow = {
  prod_id: number;
  title: string;
  price: number | string;
  product_photo_url_1?: string | null;
  seller_first_name?: string | null;
  seller_last_name?: string | null;
  seller_avatar_url?: string | null;
  seller_phone_number?: string | null;
};

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

function mapManageRow(row: ManageApiRow, tab: TabKey): ManageRow {
  return {
    id: String(row.prod_id),
    title: row.title,
    price: formatPrice(row.price),
    imageUri: row.product_photo_url_1 || FALLBACK_IMAGE,
    avatarUrl: row.seller_avatar_url?.trim() || undefined,
    sellerFirstName: row.seller_first_name?.trim() || (tab === "listings" ? "Owner" : "Seller"),
    sellerLastName: row.seller_last_name?.trim() || "",
    sellerPhone: row.seller_phone_number?.trim() || undefined,
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
  const [rows, setRows] = useState<ManageRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removingListingId, setRemovingListingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((current) => current + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;

    async function loadRows() {
      try {
        setIsLoading(true);
        setLoadError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const endpoint = tab === "listings" ? "listings" : "pending";
        const response = await GET<ManageApiRow[]>(
          `${API_BASE_URL}/me/${endpoint}`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }

        if (isActive) {
          setRows(response.data.map((row) => mapManageRow(row, tab)));
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load products.",
          );
          setRows([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadRows();

    return () => {
      isActive = false;
    };
  }, [focusRefreshKey, tab]);

  const refreshRows = useCallback(() => {
    setFocusRefreshKey((current) => current + 1);
  }, []);

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

  const removePendingInterest = useCallback((item: ManageRow) => {
    Alert.alert(
      "Remove pending item",
      `Remove "${item.title}" from your pending list?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setRemovingId(item.id);

                const token = await auth.currentUser?.getIdToken();

                if (!token) {
                  throw new Error("Missing auth token.");
                }

                const response = await DELETE(
                  `${API_BASE_URL}/me/pending/${encodeURIComponent(item.id)}`,
                  token,
                );

                if (!response.ok) {
                  throw new Error(response.error);
                }

                setRows((currentRows) =>
                  currentRows.filter((row) => row.id !== item.id),
                );
                refreshRows();
              } catch (error) {
                Alert.alert(
                  "Remove failed",
                  error instanceof Error
                    ? error.message
                    : "Unable to remove pending item.",
                );
              } finally {
                setRemovingId(null);
              }
            })();
          },
        },
      ],
    );
  }, [refreshRows]);

  const removeListing = useCallback((item: ManageRow) => {
    Alert.alert(
      "Remove listing",
      `Permanently remove "${item.title}" from your listings?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setRemovingListingId(item.id);

                const token = await auth.currentUser?.getIdToken();

                if (!token) {
                  throw new Error("Missing auth token.");
                }

                const response = await DELETE(
                  `${API_BASE_URL}/products/${encodeURIComponent(item.id)}`,
                  token,
                );

                if (!response.ok) {
                  throw new Error(response.error);
                }

                setRows((currentRows) =>
                  currentRows.filter((row) => row.id !== item.id),
                );
                refreshRows();
              } catch (error) {
                Alert.alert(
                  "Remove failed",
                  error instanceof Error
                    ? error.message
                    : "Unable to remove listing.",
                );
              } finally {
                setRemovingListingId(null);
              }
            })();
          },
        },
      ],
    );
  }, [refreshRows]);

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

        {isLoading ? (
          <ActivityIndicator color={BRAND} size="large" />
        ) : null}

        {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}

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
                    router.push(
                      `/(main)/edit-product/${encodeURIComponent(item.id)}`,
                    )
                  }
                  style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                >
                  <MaterialIcons color="#FFFFFF" name="edit" size={20} />
                  <Text style={styles.primaryActionText}>Edit listing</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={removingListingId === item.id}
                  onPress={() => removeListing(item)}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryActionText}>
                    {removingListingId === item.id
                      ? "Removing..."
                      : "Remove listing"}
                  </Text>
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
                  disabled={removingId === item.id}
                  onPress={() => removePendingInterest(item)}
                  style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryActionText}>
                    {removingId === item.id
                      ? "Removing..."
                      : "I'm no longer interested"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        {!isLoading && !loadError && rows.length === 0 ? (
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
