import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ProductCardProps = {
  imageUri: string;
  title: string;
  price: string;
  avatarUrl: string;
  sellerFirstName: string;
  sellerLastName: string;
};

export function ProductCard({
  imageUri,
  title,
  price,
  avatarUrl,
  sellerFirstName,
  sellerLastName,
}: ProductCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Open product ${title}`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image contentFit="cover" source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.sellerRow}>
          <Image contentFit="cover" source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text numberOfLines={1} style={styles.sellerName}>
            {sellerFirstName} {sellerLastName}
          </Text>
        </View>
        <Text style={styles.price}>{price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    alignSelf: "center",
    maxWidth: 380,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#242C51",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.96,
  },
  image: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#E8ECFF",
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  title: {
    color: "#242C51",
    fontSize: 28,
    fontWeight: "700",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -2,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DDE4FF",
  },
  sellerName: {
    flex: 1,
    color: "#6C759E",
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    color: "#0057BD",
    fontSize: 34,
    fontWeight: "800",
  },
});
