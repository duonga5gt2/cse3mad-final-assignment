import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/product-card";

type Product = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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

export default function AuthenticatedHomeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((product) => product.title.toLowerCase().includes(query));
  }, [searchTerm]);

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

        <Text style={styles.sectionEyebrow}>TRENDING</Text>
        <Text style={styles.sectionTitle}>Trending Products</Text>

        <View style={styles.listingsContainer}>
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

        {visibleProducts.length === 0 ? (
          <Text style={styles.emptyState}>
            No products found. Try a different keyword.
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
