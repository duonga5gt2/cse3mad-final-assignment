import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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
import { GET, POST } from "@/lib/fetchFormat";

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
const MOCK_TRENDING_PRODUCTS: Product[] = [
  {
    id: "mock-1",
    title: "Eames Lounge Chair",
    price: "$4,850",
    imageUri:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Emma",
    sellerLastName: "Rivers",
  },
  {
    id: "mock-2",
    title: "Nomos Metro Watch",
    price: "$3,200",
    imageUri:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Noah",
    sellerLastName: "Chen",
  },
  {
    id: "mock-3",
    title: "Vintage Camera Lens",
    price: "$790",
    imageUri:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Ava",
    sellerLastName: "Patel",
  },
];

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
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [focusRefreshKey, setFocusRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusRefreshKey((current) => current + 1);
    }, []),
  );

  useEffect(() => {
    let isActive = true;

    async function loadTrendingProducts() {
      try {
        setIsLoadingTrending(true);
        setProductError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const response = await GET<ProductApiRow[]>(
          `${API_BASE_URL}/trending`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }

        if (isActive) {
          const products = response.data.map(mapProduct);
          setTrendingProducts(
            products.length > 0 ? products : MOCK_TRENDING_PRODUCTS,
          );
        }
      } catch (error) {
        if (isActive) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load products.";
          setProductError(message);
          setTrendingProducts(MOCK_TRENDING_PRODUCTS);
        }
      } finally {
        if (isActive) {
          setIsLoadingTrending(false);
        }
      }
    }

    void loadTrendingProducts();

    return () => {
      isActive = false;
    };
  }, [focusRefreshKey]);

  useEffect(() => {
    let isActive = true;
    const query = searchTerm.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearchingProducts(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingProducts(true);
        setSearchError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const response = await GET<ProductApiRow[]>(
          `${API_BASE_URL}/search-products?q=${encodeURIComponent(query)}`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }

        if (isActive) {
          setSearchResults(response.data.map(mapProduct));
        }
      } catch (error) {
        if (isActive) {
          setSearchError(
            error instanceof Error
              ? error.message
              : "Unable to search products.",
          );
          setSearchResults([]);
        }
      } finally {
        if (isActive) {
          setIsSearchingProducts(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const openProduct = useCallback((productId: string) => {
    router.push(`/(main)/product-detail/${encodeURIComponent(productId)}`);

    if (!productId.startsWith("mock-")) {
      void (async () => {
        const token = await auth.currentUser?.getIdToken();

        if (token) {
          await POST(
            `${API_BASE_URL}/products/${encodeURIComponent(productId)}/trending`,
            token,
            { clicks: 1 },
          );
        }
      })().catch(() => {
        // Opening the product should not be blocked by analytics-style tracking.
      });
    }
  }, []);

  const showSearchDropdown = searchTerm.trim().length >= 2;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroText}>
          Discover exceptional <Text style={styles.heroAccent}>products</Text>
        </Text>

        <View style={styles.searchArea}>
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

          {showSearchDropdown ? (
            <View style={styles.searchDropdown}>
              {isSearchingProducts ? (
                <View style={styles.searchDropdownStatus}>
                  <ActivityIndicator color="#0057BD" />
                  <Text style={styles.searchDropdownStatusText}>Searching...</Text>
                </View>
              ) : null}

              {searchError ? (
                <Text style={styles.searchDropdownMessage}>{searchError}</Text>
              ) : null}

              {!isSearchingProducts &&
              !searchError &&
              searchResults.length === 0 ? (
                <Text style={styles.searchDropdownMessage}>No matches found.</Text>
              ) : null}

              {searchResults.length > 0 ? (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={styles.searchResultsScroll}
                  contentContainerStyle={styles.searchResultsContent}
                >
                  {searchResults.map((product) => (
                    <ProductCard
                      avatarUrl={product.avatarUrl}
                      imageUri={product.imageUri}
                      key={product.id}
                      layout="row"
                      onPress={() => void openProduct(product.id)}
                      price={product.price}
                      sellerFirstName={product.sellerFirstName}
                      sellerLastName={product.sellerLastName}
                      title={product.title}
                    />
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionEyebrow}>TRENDING</Text>
        <Text style={styles.sectionTitle}>Trending Products</Text>

        <View style={styles.listingsContainer}>
          {isLoadingTrending ? (
            <ActivityIndicator color="#0057BD" size="large" />
          ) : null}

          {productError ? (
            <Text style={styles.emptyState}>{productError}</Text>
          ) : null}

          {trendingProducts.map((product) => (
            <ProductCard
              avatarUrl={product.avatarUrl}
              imageUri={product.imageUri}
              key={product.id}
              onPress={() => void openProduct(product.id)}
              price={product.price}
              sellerFirstName={product.sellerFirstName}
              sellerLastName={product.sellerLastName}
              title={product.title}
            />
          ))}
        </View>

        {!isLoadingTrending && !productError && trendingProducts.length === 0 ? (
          <Text style={styles.emptyState}>No trending products yet.</Text>
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
  searchArea: {
    position: "relative",
    zIndex: 2,
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
  searchDropdown: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D0D7FF",
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    maxHeight: 320,
    overflow: "hidden",
    paddingVertical: 10,
    shadowColor: "#242C51",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  searchDropdownStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  searchDropdownStatusText: {
    color: "#6C759E",
    fontSize: 14,
    fontWeight: "600",
  },
  searchDropdownMessage: {
    color: "#6C759E",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: "center",
  },
  searchResultsScroll: {
    maxHeight: 240,
  },
  searchResultsContent: {
    gap: 8,
    paddingBottom: 2,
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
