import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";
const INPUT_BG = "#D6DBFF";
const MAP_PLACEHOLDER = "#E8ECFF";

const IMAGE_SLOTS = 3;

export default function PublishScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [images, setImages] = useState<(string | null)[]>(
    Array.from({ length: IMAGE_SLOTS }, () => null)
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const pickImageForSlot = useCallback(async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to add listing photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      Alert.alert("Upload failed", "We couldn't read that image. Please try another one.");
      return;
    }

    setImages((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });
  }, []);

  function clearImageSlot(index: number) {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  async function onPublishPress() {
    const missing =
      !title.trim() ||
      !price.trim() ||
      !description.trim() ||
      !pickupLocation.trim();

    if (missing) {
      Alert.alert(
        "Missing information",
        "Please fill in title, price, description, and pickup location."
      );
      return;
    }

    const hasPhoto = images.some((uri) => Boolean(uri));
    if (!hasPhoto) {
      Alert.alert("Add photos", "Add at least one product photo to publish.");
      return;
    }

    setIsPublishing(true);
    try {
      // Placeholder until Firestore + Storage are wired.
      await new Promise((r) => setTimeout(r, 400));
      Alert.alert(
        "Listing ready",
        "Your listing details are valid. Backend publishing will hook up here later."
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>New listing</Text>
          <Text style={styles.screenSubtitle}>
            Add details buyers need — photos appear on the product page.
          </Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="What are you selling?"
            placeholderTextColor={MUTED}
            style={styles.input}
            value={title}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setPrice}
            placeholder="e.g. 120"
            placeholderTextColor={MUTED}
            style={styles.input}
            value={price}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Condition, size, included accessories..."
            placeholderTextColor={MUTED}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={description}
          />

          <Text style={styles.label}>Pickup location</Text>
          <TextInput
            onChangeText={setPickupLocation}
            placeholder="Suburb or landmark for meet-up"
            placeholderTextColor={MUTED}
            style={styles.input}
            value={pickupLocation}
          />

          <View style={styles.mapPlaceholder} accessibilityLabel="Map preview placeholder">
            <MaterialIcons color={BRAND} name="map" size={28} />
            <Text style={styles.mapPlaceholderTitle}>Map preview</Text>
            <Text style={styles.mapPlaceholderHint}>
              Google Maps can plug in here later to confirm the pin.
            </Text>
          </View>

          <Text style={styles.label}>Photos (up to {IMAGE_SLOTS})</Text>
          <View style={styles.photoRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.photoSlot}>
                {uri ? (
                  <>
                    <Image contentFit="cover" source={{ uri }} style={styles.photoImage} />
                    <Pressable
                      accessibilityLabel={`Remove photo ${index + 1}`}
                      android_ripple={{ color: "rgba(255,255,255,0.35)" }}
                      hitSlop={6}
                      onPress={() => clearImageSlot(index)}
                      style={({ pressed }) => [
                        styles.removePhoto,
                        pressed && styles.removePhotoPressed,
                      ]}
                    >
                      <MaterialIcons color="#FFFFFF" name="close" size={18} />
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    accessibilityLabel={`Add photo ${index + 1}`}
                    android_ripple={{ color: "rgba(0, 87, 189, 0.18)" }}
                    onPress={() => pickImageForSlot(index)}
                    style={({ pressed }) => [
                      styles.addPhoto,
                      pressed && styles.addPhotoPressed,
                    ]}
                  >
                    {({ pressed }) => (
                      <>
                        <MaterialIcons
                          color={pressed ? "#004A9E" : BRAND}
                          name="add-a-photo"
                          size={28}
                        />
                        <Text
                          style={[
                            styles.addPhotoText,
                            pressed && styles.addPhotoTextPressed,
                          ]}
                        >
                          Add
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isPublishing}
            onPress={onPublishPress}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              isPublishing && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isPublishing ? "Publishing..." : "Publish listing"}
            </Text>
            <MaterialIcons color="#FFFFFF" name="publish" size={22} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: CARD_TEXT,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 15,
    color: MUTED,
    marginBottom: 22,
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: CARD_TEXT,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: CARD_TEXT,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  mapPlaceholder: {
    backgroundColor: MAP_PLACEHOLDER,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D7FF",
  },
  mapPlaceholderTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  mapPlaceholderHint: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
  },
  photoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
    justifyContent: "space-between",
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D7FF",
    maxWidth: "33.333%",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  addPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#F0F3FF",
  },
  addPhotoPressed: {
    backgroundColor: "#C8D6FF",
  },
  addPhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND,
  },
  addPhotoTextPressed: {
    color: "#004A9E",
  },
  removePhoto: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoPressed: {
    backgroundColor: "rgba(180,35,24,0.92)",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: "#1E2A8F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
