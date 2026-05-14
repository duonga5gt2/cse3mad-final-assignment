import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type Product = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
};

type ProductApiRow = {
  prod_id: number;
  title: string;
  price: number | string;
  product_photo_url_1?: string | null;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80";
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

function mapProduct(row: ProductApiRow): Product {
  return {
    id: String(row.prod_id),
    title: row.title,
    price: formatPrice(row.price),
    imageUri: row.product_photo_url_1 || FALLBACK_IMAGE,
    avatarUrl: row.avatar_url || FALLBACK_AVATAR,
    sellerFirstName: row.first_name || "Seller",
    sellerLastName: row.last_name || "",
  };
}

export default function AuthenticatedHomeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((current) => current + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;
    const query = searchTerm.trim();

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoadingProducts(true);
        setProductError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const url =
          query.length >= 2
            ? `${API_BASE_URL}/search-products?q=${encodeURIComponent(query)}`
            : `${API_BASE_URL}/trending`;
        const response = await GET<ProductApiRow[]>(url, token);

        if (!response.ok) {
          throw new Error(response.error);
        }

        if (isActive) {
          setVisibleProducts(response.data.map(mapProduct));
        }
      } catch (error) {
        if (isActive) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load products.";
          setProductError(message);
          setVisibleProducts([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingProducts(false);
        }
      }
    }, query.length >= 2 ? 350 : 0);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [focusRefreshKey, searchTerm]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroText}>
          Discover exceptional <Text style={styles.heroAccent}>products</Text>
        </Text>

        <View style={styles.searchShell}>
          <MaterialIcons color="#8D95C8" name="search" size={20} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchTerm}
            placeholder="Search curated listings..."
            placeholderTextColor="#8D95C8"
            style={styles.searchInput}
            value={searchTerm}
          />
        </View>

        <Text style={styles.sectionEyebrow}>
          {searchTerm.trim().length >= 2 ? "SEARCH" : "TRENDING"}
        </Text>
        <Text style={styles.sectionTitle}>
          {searchTerm.trim().length >= 2 ? "Search Results" : "Trending Products"}
        </Text>

        <View style={styles.listingsContainer}>
          {isLoadingProducts ? (
            <ActivityIndicator color="#0057BD" size="large" />
          ) : null}

          {productError ? (
            <Text style={styles.emptyState}>{productError}</Text>
          ) : null}

          {visibleProducts.map((product) => (
            <ProductCard
              avatarUrl={product.avatarUrl}
              imageUri={product.imageUri}
              key={product.id}
              price={product.price}
              sellerFirstName={product.sellerFirstName}
              sellerLastName={product.sellerLastName}
              title={product.title}
            />
          ))}
        </View>

        {!isLoadingProducts && !productError && visibleProducts.length === 0 ? (
          <Text style={styles.emptyState}>
            {searchTerm.trim().length >= 2
              ? "No products found. Try a different keyword."
              : "No trending products yet."}
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
    paddingTop: 22,
    paddingBottom: 30,
    backgroundColor: "#F7F5FF",
    gap: 12,
  },
  heroText: {
    color: "#242C51",
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 56,
    marginTop: 6,
  },
  heroAccent: {
    color: "#5E8EF5",
  },
  searchShell: {
    marginTop: 8,
    minHeight: 52,
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
  sectionEyebrow: {
    marginTop: 6,
    color: "#5E8EF5",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  sectionTitle: {
    color: "#242C51",
    fontSize: 36,
    fontWeight: "700",
    marginTop: -2,
  },
  listingsContainer: {
    marginTop: 8,
    gap: 14,
  },
  emptyState: {
    marginTop: 8,
    color: "#6C759E",
    fontSize: 15,
    textAlign: "center",
    paddingBottom: 8,
  },
});
