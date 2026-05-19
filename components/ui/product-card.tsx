import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ProductCardSize = "default" | "compact";

/** `stack` = image on top (Home). `row` = slim horizontal row (e.g. Chat → SMS entry). */
export type ProductCardLayout = "stack" | "row";

type ProductCardProps = {
  imageUri: string;
  title: string;
  price: string;
  avatarUrl?: string;
  sellerFirstName: string;
  sellerLastName: string;
  onPress?: () => void;
  /** `default` = home-style taller card; `compact` = shorter stack (ignored when `layout="row"`). */
  size?: ProductCardSize;
  layout?: ProductCardLayout;
};

function getInitials(firstName: string, lastName: string) {
  const firstInitial = firstName.trim().charAt(0);
  const lastInitial = lastName.trim().charAt(0);
  const initials = `${firstInitial}${lastInitial}`.trim();

  return initials.toUpperCase() || "SE";
}

function SellerAvatar({
  avatarUrl,
  firstName,
  lastName,
  style,
  textStyle,
}: {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  style: object;
  textStyle: object;
}) {
  if (avatarUrl?.trim()) {
    return <Image contentFit="cover" source={{ uri: avatarUrl }} style={style} />;
  }

  return (
    <View style={[style, styles.avatarFallback]}>
      <Text style={textStyle}>{getInitials(firstName, lastName)}</Text>
    </View>
  );
}

export function ProductCard({
  imageUri,
  title,
  price,
  avatarUrl,
  sellerFirstName,
  sellerLastName,
  onPress,
  size = "default",
  layout = "stack",
}: ProductCardProps) {
  if (layout === "row") {
    return (
      <Pressable
        accessibilityLabel={`Message seller about ${title}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.rowCard, pressed && styles.cardPressed]}
      >
        <Image contentFit="cover" source={{ uri: imageUri }} style={styles.rowThumb} />
        <View style={styles.rowBody}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.rowPrice}>
            {price}
          </Text>
          <View style={styles.rowSeller}>
            <SellerAvatar
              avatarUrl={avatarUrl}
              firstName={sellerFirstName}
              lastName={sellerLastName}
              style={styles.rowAvatar}
              textStyle={styles.rowAvatarText}
            />
            <Text numberOfLines={1} style={styles.rowSellerName}>
              {sellerFirstName} {sellerLastName}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  const compact = size === "compact";

  return (
    <Pressable
      accessibilityLabel={`Open product ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        contentFit="cover"
        source={{ uri: imageUri }}
        style={[styles.image, compact ? styles.imageCompact : styles.imageDefault]}
      />
      <View style={compact ? styles.contentCompact : styles.contentDefault}>
        <Text
          numberOfLines={1}
          style={[styles.title, compact ? styles.titleCompact : styles.titleDefault]}
        >
          {title}
        </Text>
        <View
          style={[
            styles.sellerRow,
            compact ? styles.sellerRowCompact : styles.sellerRowDefault,
          ]}
        >
          <SellerAvatar
            avatarUrl={avatarUrl}
            firstName={sellerFirstName}
            lastName={sellerLastName}
            style={[styles.avatar, compact ? styles.avatarCompact : styles.avatarDefault]}
            textStyle={compact ? styles.avatarTextCompact : styles.avatarTextDefault}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.sellerName,
              compact ? styles.sellerNameCompact : styles.sellerNameDefault,
            ]}
          >
            {sellerFirstName} {sellerLastName}
          </Text>
        </View>
        <Text style={[styles.price, compact ? styles.priceCompact : styles.priceDefault]}>
          {price}
        </Text>
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
  rowCard: {
    width: "92%",
    alignSelf: "center",
    maxWidth: 380,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#242C51",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  rowThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#E8ECFF",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    justifyContent: "center",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#242C51",
  },
  rowPrice: {
    color: "#0057BD",
    fontSize: 14,
    fontWeight: "800",
  },
  rowSeller: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
  },
  rowAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DDE4FF",
  },
  rowAvatarText: {
    color: "#0057BD",
    fontSize: 9,
    fontWeight: "800",
  },
  rowSellerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0057BD",
  },
  image: {
    width: "100%",
    backgroundColor: "#E8ECFF",
  },
  imageDefault: {
    aspectRatio: 1.1,
  },
  imageCompact: {
    aspectRatio: 1.75,
  },
  contentDefault: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  contentCompact: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  title: {
    color: "#242C51",
    fontWeight: "700",
  },
  titleDefault: {
    fontSize: 28,
  },
  titleCompact: {
    fontSize: 20,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerRowDefault: {
    gap: 8,
    marginTop: -2,
  },
  sellerRowCompact: {
    gap: 6,
    marginTop: 0,
  },
  avatar: {
    backgroundColor: "#DDE4FF",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarDefault: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarCompact: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarTextDefault: {
    color: "#0057BD",
    fontSize: 12,
    fontWeight: "800",
  },
  avatarTextCompact: {
    color: "#0057BD",
    fontSize: 9,
    fontWeight: "800",
  },
  sellerName: {
    flex: 1,
    color: "#6C759E",
    fontWeight: "600",
  },
  sellerNameDefault: {
    fontSize: 14,
  },
  sellerNameCompact: {
    fontSize: 13,
  },
  price: {
    color: "#0057BD",
    fontWeight: "800",
  },
  priceDefault: {
    fontSize: 34,
  },
  priceCompact: {
    fontSize: 22,
  },
});
