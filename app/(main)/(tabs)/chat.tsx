import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ui/product-card";

/** Listing on Chat tab — entry point to native SMS; seller phone from backend later. */
type ChatListing = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerPhone?: string;
};

const MOCK_LISTINGS: ChatListing[] = [
  {
    id: "1",
    title: "Mid-century Modern Lounge Chair",
    price: "$4,850",
    imageUri:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Elena",
    sellerLastName: "Rossi",
    sellerPhone: "+61400111222",
  },
  {
    id: "2",
    title: "Nomos Metro Watch",
    price: "$3,200",
    imageUri:
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Noah",
    sellerLastName: "Chen",
    sellerPhone: "+61400333444",
  },
  {
    id: "3",
    title: "Vintage Camera Lens",
    price: "$790",
    imageUri:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Ava",
    sellerLastName: "Patel",
  },
  {
    id: "4",
    title: "Ceramic Table Lamp",
    price: "$120",
    imageUri:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    sellerFirstName: "Mia",
    sellerLastName: "Walsh",
    sellerPhone: "+61400555666",
  },
  {
    id: "5",
    title: "Leather Weekender Bag",
    price: "$340",
    imageUri:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80",
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

export default function ChatScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const visibleListings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return MOCK_LISTINGS;
    return MOCK_LISTINGS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        `${item.sellerFirstName} ${item.sellerLastName}`.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const openSellerSms = useCallback(async (listing: ChatListing) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "SMS on device only",
        "Open this screen in Expo Go on your phone to message sellers via SMS."
      );
      return;
    }

    if (!listing.sellerPhone?.trim()) {
      Alert.alert(
        "Contact unavailable",
        "Seller phone number is not on this listing yet. This will come from your backend later."
      );
      return;
    }

    const body = `Hi, I'm interested in: ${listing.title}`;
    const url = smsUrl(listing.sellerPhone, body);

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
          Tap a listing to open SMS with the seller. Chat history stays in your messages app.
        </Text>

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
          {visibleListings.map((listing) => (
            <ProductCard
              avatarUrl={listing.avatarUrl}
              imageUri={listing.imageUri}
              key={listing.id}
              layout="row"
              onPress={() => void openSellerSms(listing)}
              price={listing.price}
              sellerFirstName={listing.sellerFirstName}
              sellerLastName={listing.sellerLastName}
              title={listing.title}
            />
          ))}
        </View>

        {visibleListings.length === 0 ? (
          <Text style={styles.empty}>No products match your search.</Text>
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
