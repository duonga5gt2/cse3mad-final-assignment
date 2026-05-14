import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ProductDetailContentProps = {
  title: string;
  /** Whole dollars, e.g. "$1,450" or "A$1,450" — no cents. */
  priceLabel: string;
  description: string;
  mainImageUri: string;
  secondaryImageUriLeft: string;
  secondaryImageUriRight: string;
  sellerAvatarUri: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerMemberSinceLabel?: string;
  pickupLocationLabel: string;
  onChatWithSellerPress?: () => void;
};

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const MAP_BG = "#E8ECFF";

export function ProductDetailContent({
  title,
  priceLabel,
  description,
  mainImageUri,
  secondaryImageUriLeft,
  secondaryImageUriRight,
  sellerAvatarUri,
  sellerFirstName,
  sellerLastName,
  sellerMemberSinceLabel,
  pickupLocationLabel,
  onChatWithSellerPress,
}: ProductDetailContentProps) {
  const canChat = Boolean(onChatWithSellerPress);

  return (
    <View style={styles.root}>
      <Image contentFit="cover" source={{ uri: mainImageUri }} style={styles.mainImage} />

      <View style={styles.thumbRow}>
        <Image
          contentFit="cover"
          source={{ uri: secondaryImageUriLeft || mainImageUri }}
          style={styles.thumb}
        />
        <Image
          contentFit="cover"
          source={{ uri: secondaryImageUriRight || mainImageUri }}
          style={styles.thumb}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{priceLabel}</Text>
      </View>

      <View style={styles.sellerCard}>
        <Image contentFit="cover" source={{ uri: sellerAvatarUri }} style={styles.sellerAvatar} />
        <View style={styles.sellerText}>
          <Text style={styles.sellerName}>
            {sellerFirstName} {sellerLastName}
          </Text>
          {sellerMemberSinceLabel ? (
            <Text style={styles.sellerMeta}>{sellerMemberSinceLabel}</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionHeading}>Description</Text>
      <Text style={styles.body}>{description}</Text>

      <Text style={styles.sectionHeading}>Pickup location</Text>
      <View style={styles.mapShell} accessibilityLabel="Map preview">
        <MaterialIcons color={BRAND} name="place" size={36} />
        {pickupLocationLabel ? (
          <View style={styles.mapLabel}>
            <Text numberOfLines={2} style={styles.mapLabelText}>
              {pickupLocationLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityLabel="Chat with seller via SMS"
        accessibilityRole="button"
        disabled={!canChat}
        onPress={onChatWithSellerPress}
        style={({ pressed }) => [
          styles.chatButton,
          !canChat && styles.chatButtonDisabled,
          pressed && canChat && styles.chatButtonPressed,
        ]}
      >
        <MaterialIcons color={canChat ? "#FFFFFF" : "#9AA3C9"} name="sms" size={22} />
        <Text style={[styles.chatButtonText, !canChat && styles.chatButtonTextDisabled]}>
          Chat with seller
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 0,
    paddingBottom: 16,
  },
  mainImage: {
    width: "100%",
    aspectRatio: 1.05,
    borderRadius: 16,
    backgroundColor: "#DDE4FF",
  },
  thumbRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  thumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#DDE4FF",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: CARD_TEXT,
    lineHeight: 28,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: BRAND,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E8FF",
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8ECFF",
  },
  sellerText: {
    flex: 1,
    minWidth: 0,
  },
  sellerName: {
    fontSize: 17,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  sellerMeta: {
    marginTop: 4,
    fontSize: 14,
    color: MUTED,
  },
  sectionHeading: {
    marginTop: 22,
    fontSize: 17,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  body: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
  },
  mapShell: {
    marginTop: 10,
    height: 168,
    borderRadius: 16,
    backgroundColor: MAP_BG,
    borderWidth: 1,
    borderColor: "#D0D7FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mapLabel: {
    position: "absolute",
    left: 12,
    bottom: 12,
    maxWidth: "85%",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mapLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: CARD_TEXT,
  },
  chatButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
  },
  chatButtonPressed: {
    opacity: 0.9,
  },
  chatButtonDisabled: {
    backgroundColor: "#DCE3FF",
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chatButtonTextDisabled: {
    color: "#9AA3C9",
  },
});
