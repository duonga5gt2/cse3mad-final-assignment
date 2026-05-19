import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

import {
  ProductDetailContent,
  type ProductDetailContentProps,
} from "@/components/ui/product-detail-content";
import { auth } from "@/firebase";
import { GET, POST } from "@/lib/fetchFormat";

const BRAND = "#0057BD";
const BG = "#F7F5FF";
const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";

type DetailBundle = {
  content: ProductDetailContentProps;
  sellerPhone: string | null;
};

/** Matches `MOCK_TRENDING_PRODUCTS` on Home — used to test detail without API. */
const MOCK_DETAIL_BY_ID: Record<string, DetailBundle> = {
  "mock-1": {
    sellerPhone: "+61400111222",
    content: {
      title: "Eames Lounge Chair",
      priceLabel: "$4,850",
      description:
        "Iconic mid-century lounge chair in excellent condition. Walnut shell with black leather cushions. Perfect for a reading nook or living room centerpiece.",
      mainImageUri:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      secondaryImageUriLeft:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      secondaryImageUriRight:
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
      sellerAvatarUri:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      sellerFirstName: "Emma",
      sellerLastName: "Rivers",
      sellerMemberSinceLabel: "Member since 2023",
      pickupLocationLabel: "Surry Hills, Sydney",
    },
  },
  "mock-2": {
    sellerPhone: "+61400333444",
    content: {
      title: "Nomos Metro Watch",
      priceLabel: "$3,200",
      description:
        "German mechanical watch with clean Bauhaus dial. Recently serviced; keeps excellent time. Includes original box and papers.",
      mainImageUri:
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
      secondaryImageUriLeft:
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
      secondaryImageUriRight:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
      sellerAvatarUri:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      sellerFirstName: "Noah",
      sellerLastName: "Chen",
      sellerMemberSinceLabel: "Member since 2022",
      pickupLocationLabel: "Chippendale, Sydney",
    },
  },
  "mock-3": {
    sellerPhone: "+61400555666",
    content: {
      title: "Vintage Camera Lens",
      priceLabel: "$790",
      description:
        "Classic prime lens, glass is clear with minimal dust. Ideal for film or adapted digital bodies. Front and rear caps included.",
      mainImageUri:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
      secondaryImageUriLeft:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
      secondaryImageUriRight:
        "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
      sellerAvatarUri:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
      sellerFirstName: "Ava",
      sellerLastName: "Patel",
      sellerMemberSinceLabel: "Member since 2024",
      pickupLocationLabel: "Newtown, Sydney",
    },
  },
};

type ProductDetailApiRow = {
  title: string;
  price: number | string;
  description?: string | null;
  pick_up_location_text?: string | null;
  product_photo_url_1?: string | null;
  product_photo_url_2?: string | null;
  product_photo_url_3?: string | null;
  seller_first_name?: string | null;
  seller_last_name?: string | null;
  seller_avatar_url?: string | null;
  seller_phone_number?: string | null;
  pick_up_latitude?: number | string | null;
  pick_up_longitude?: number | string | null;
};

function formatPrice(price: number | string) {
  const n = Number(price);
  if (!Number.isFinite(n)) return `$${price}`;
  return new Intl.NumberFormat("en-AU", {
    currency: "AUD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(n);
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

function mapApiRowToBundle(row: ProductDetailApiRow): DetailBundle {
  const main =
    row.product_photo_url_1?.trim() ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";
  const left = row.product_photo_url_2?.trim() || main;
  const right = row.product_photo_url_3?.trim() || main;
  const latitude = Number(row.pick_up_latitude);
  const longitude = Number(row.pick_up_longitude);
  const pickupCoordinate =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : undefined;

  const content: ProductDetailContentProps = {
    title: row.title,
    priceLabel: formatPrice(row.price),
    description: (row.description ?? "").trim() || "No description provided.",
    mainImageUri: main,
    secondaryImageUriLeft: left,
    secondaryImageUriRight: right,
    sellerAvatarUri:
      row.seller_avatar_url?.trim() ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: row.seller_first_name?.trim() || "Seller",
    sellerLastName: row.seller_last_name?.trim() || "",
    pickupLocationLabel: (row.pick_up_location_text ?? "").trim() || "Pickup location TBC",
    pickupCoordinate,
  };

  return {
    content,
    sellerPhone: row.seller_phone_number?.trim() || null,
  };
}

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = useMemo(() => {
    const raw = params.id;
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw ?? "";
  }, [params.id]);

  const [bundle, setBundle] = useState<DetailBundle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setBundle(null);

      if (!id) {
        if (active) {
          setLoadError("Missing product id.");
          setLoading(false);
        }
        return;
      }

      const mock = MOCK_DETAIL_BY_ID[id];
      if (mock) {
        if (active) {
          setBundle(mock);
          setLoading(false);
        }
        return;
      }

      if (!/^\d+$/.test(id)) {
        if (active) {
          setLoadError("Product not found.");
          setLoading(false);
        }
        return;
      }

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not signed in.");

        const res = await GET<ProductDetailApiRow>(
          `${API_BASE_URL}/products/${encodeURIComponent(id)}`,
          token,
        );
        if (!res.ok) throw new Error(res.error);

        if (active) setBundle(mapApiRowToBundle(res.data));
      } catch (e) {
        if (active) {
          setLoadError(e instanceof Error ? e.message : "Unable to load product.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const openSellerSms = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert("SMS on device only", "Open this screen on your phone to message the seller.");
      return;
    }
    const phone = bundle?.sellerPhone;
    const title = bundle?.content.title ?? "this listing";
    if (!phone) {
      Alert.alert("Contact unavailable", "No phone number for this seller yet.");
      return;
    }

    if (/^\d+$/.test(id)) {
      try {
        setIsCreatingChat(true);
        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Not signed in.");
        }

        const response = await POST(
          `${API_BASE_URL}/products/${encodeURIComponent(id)}/chats`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }
      } catch (error) {
        Alert.alert(
          "Could not start chat",
          error instanceof Error
            ? error.message
            : "Unable to create chat for this product.",
        );
        return;
      } finally {
        setIsCreatingChat(false);
      }
    }

    const url = smsUrl(phone, `Hi, I'm interested in: ${title}`);
    void Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the messaging app."),
    );
  }, [bundle, id]);

  const contentProps = bundle
    ? {
        ...bundle.content,
        chatButtonLabel: isCreatingChat ? "Starting chat..." : undefined,
        isChatWithSellerDisabled: isCreatingChat,
        onChatWithSellerPress: () => void openSellerSms(),
      }
    : null;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(main)/(tabs)/home");
          }}
          style={styles.backBtn}
        >
          <MaterialIcons color={BRAND} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Sydney Exchange</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={BRAND} size="large" />
          </View>
        ) : null}

        {!loading && loadError ? (
          <Text style={styles.errorText}>{loadError}</Text>
        ) : null}

        {!loading && !loadError && contentProps ? (
          <ProductDetailContent {...contentProps} />
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
    color: "#242C51",
  },
  headerSpacer: { width: 44 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centered: {
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: "#B42318",
    textAlign: "center",
  },
});
