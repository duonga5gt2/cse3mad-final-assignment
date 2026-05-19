import MapScreen from "@/components/ui/map";
import { auth } from "@/firebase";
import { GET, PATCH } from "@/lib/fetchFormat";
import {
  AddressAutocompleteSuggestion,
  autocompleteAddress,
  getPlaceLatLng,
  PlaceLatLng,
} from "@/lib/mapFetch";
import { uploadProductImage } from "@/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";
const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";
const INPUT_BG = "#D6DBFF";
const IMAGE_SLOTS = 3;

type ProductDetailApiRow = {
  title: string;
  price: number | string;
  description?: string | null;
  pick_up_location_text?: string | null;
  pick_up_latitude?: number | string | null;
  pick_up_longitude?: number | string | null;
  product_photo_url_1?: string | null;
  product_photo_url_2?: string | null;
  product_photo_url_3?: string | null;
};

type ImageSlot = {
  uri: string | null;
  isLocal: boolean;
};

function emptyImageSlots() {
  return Array.from({ length: IMAGE_SLOTS }, () => ({
    uri: null,
    isLocal: false,
  }));
}

export default function EditProductScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const prodId = useMemo(() => {
    const raw = params.id;
    return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  }, [params.id]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [placeLatLng, setPlaceLatLng] = useState<PlaceLatLng | null>(null);
  const [images, setImages] = useState<ImageSlot[]>(emptyImageSlots);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressAutocompleteSuggestion[]
  >([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProduct() {
      if (!/^\d+$/.test(prodId)) {
        setLoadError("Invalid product id.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("Missing auth token.");
        }

        const response = await GET<ProductDetailApiRow>(
          `${API_BASE_URL}/products/${encodeURIComponent(prodId)}`,
          token,
        );

        if (!response.ok) {
          throw new Error(response.error);
        }

        const product = response.data;
        const latitude = Number(product.pick_up_latitude);
        const longitude = Number(product.pick_up_longitude);
        const locationText = product.pick_up_location_text?.trim() ?? "";

        if (isActive) {
          setTitle(product.title);
          setPrice(String(product.price));
          setDescription(product.description ?? "");
          setPickupLocation(locationText);
          setImages([
            { uri: product.product_photo_url_1 ?? null, isLocal: false },
            { uri: product.product_photo_url_2 ?? null, isLocal: false },
            { uri: product.product_photo_url_3 ?? null, isLocal: false },
          ]);

          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            setPlaceLatLng({
              address: locationText || "Pickup location",
              latitude,
              longitude,
              placeId: "existing",
            });
          }
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load product.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isActive = false;
    };
  }, [prodId]);

  useEffect(() => {
    const trimmedLocation = pickupLocation.trim();

    if (
      trimmedLocation.length < 3 ||
      isSelectingSuggestion ||
      trimmedLocation === placeLatLng?.address
    ) {
      setAddressSuggestions([]);
      setIsSearchingAddress(false);
      return;
    }

    let isActive = true;
    setIsSearchingAddress(true);
    setAddressError("");

    const timeoutId = setTimeout(async () => {
      try {
        const suggestions = await autocompleteAddress(trimmedLocation);

        if (isActive) {
          setAddressSuggestions(suggestions);
        }
      } catch (error) {
        if (isActive) {
          setAddressSuggestions([]);
          setAddressError(
            error instanceof Error
              ? error.message
              : "Could not search pickup locations.",
          );
        }
      } finally {
        if (isActive) {
          setIsSearchingAddress(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isSelectingSuggestion, pickupLocation, placeLatLng?.address]);

  async function pickImageForSlot(index: number) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to update listing photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    setImages((current) => {
      const next = [...current];
      next[index] = { uri, isLocal: true };
      return next;
    });
  }

  async function selectAddressSuggestion(
    suggestion: AddressAutocompleteSuggestion,
  ) {
    const placePrediction = suggestion.placePrediction;
    const placeId = placePrediction?.placeId ?? placePrediction?.place;

    if (!placeId) {
      Alert.alert("Location unavailable", "Please try another pickup location.");
      return;
    }

    setIsSelectingSuggestion(true);
    setAddressError("");

    try {
      const selectedPlace = await getPlaceLatLng(placeId);
      setPlaceLatLng(selectedPlace);
      setPickupLocation(selectedPlace.address);
      setAddressSuggestions([]);
    } catch (error) {
      Alert.alert(
        "Location unavailable",
        error instanceof Error
          ? error.message
          : "We couldn't load that pickup location.",
      );
    } finally {
      setIsSelectingSuggestion(false);
    }
  }

  async function saveProduct() {
    const numericPrice = Number(price.trim());

    if (
      !title.trim() ||
      !price.trim() ||
      !description.trim() ||
      !pickupLocation.trim() ||
      !placeLatLng
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in title, price, description, and choose a pickup location.",
      );
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert("Invalid price", "Please enter a valid price greater than 0.");
      return;
    }

    try {
      setIsSaving(true);

      const currentUser = auth.currentUser;
      const token = await currentUser?.getIdToken(true);

      if (!currentUser || !token) {
        throw new Error("Missing auth token.");
      }

      const body: Record<string, unknown> = {
        description: description.trim(),
        latitude: placeLatLng.latitude,
        longitude: placeLatLng.longitude,
        pickUpLocationText: pickupLocation.trim(),
        price: numericPrice,
        title: title.trim(),
      };

      const uploadedUrls = await Promise.all(
        images.map((slot, index) =>
          slot.uri && slot.isLocal
            ? uploadProductImage(currentUser.uid, prodId, slot.uri, index + 1)
            : Promise.resolve(null),
        ),
      );

      uploadedUrls.forEach((url, index) => {
        if (url) {
          body[`productPhotoUrl${index + 1}`] = url;
        }
      });

      const response = await PATCH(
        `${API_BASE_URL}/products/${encodeURIComponent(prodId)}`,
        token,
        body,
      );

      if (!response.ok) {
        throw new Error(response.error);
      }

      Alert.alert("Listing updated", "Your product details have been saved.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error
          ? error.message
          : "Unable to update this listing.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons color={BRAND} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit listing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator color={BRAND} size="large" />
          ) : null}

          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

          {!isLoading && !loadError ? (
            <>
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

              {isSearchingAddress ? (
                <Text style={styles.addressStatus}>Searching locations...</Text>
              ) : null}
              {addressError ? (
                <Text style={styles.addressError}>{addressError}</Text>
              ) : null}
              {addressSuggestions.length > 0 ? (
                <View style={styles.suggestionList}>
                  {addressSuggestions.map((suggestion, index) => {
                    const placePrediction = suggestion.placePrediction;
                    const suggestionText = placePrediction?.text?.text;
                    const key =
                      placePrediction?.placeId ?? placePrediction?.place ?? index;

                    if (!suggestionText) return null;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={key}
                        onPress={() => selectAddressSuggestion(suggestion)}
                        style={({ pressed }) => [
                          styles.suggestionItem,
                          pressed && styles.suggestionItemPressed,
                        ]}
                      >
                        <MaterialIcons color={BRAND} name="place" size={20} />
                        <Text style={styles.suggestionText}>
                          {suggestionText}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <View style={styles.mapContainer}>
                <MapScreen
                  coordinate={
                    placeLatLng
                      ? {
                          latitude: placeLatLng.latitude,
                          longitude: placeLatLng.longitude,
                        }
                      : undefined
                  }
                  markerTitle={placeLatLng?.address ?? "Pickup location"}
                />
              </View>

              <Text style={styles.label}>Photos</Text>
              <View style={styles.photoRow}>
                {images.map((slot, index) => (
                  <Pressable
                    accessibilityRole="button"
                    key={index}
                    onPress={() => pickImageForSlot(index)}
                    style={({ pressed }) => [
                      styles.photoSlot,
                      pressed && styles.photoSlotPressed,
                    ]}
                  >
                    {slot.uri ? (
                      <Image
                        contentFit="cover"
                        source={{ uri: slot.uri }}
                        style={styles.photoImage}
                      />
                    ) : (
                      <View style={styles.addPhoto}>
                        <MaterialIcons
                          color={BRAND}
                          name="add-a-photo"
                          size={24}
                        />
                        <Text style={styles.addPhotoText}>Add</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => void saveProduct()}
                style={({ pressed }) => [
                  styles.saveButton,
                  (pressed || isSaving) && styles.saveButtonPressed,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Text>
                <MaterialIcons color="#FFFFFF" name="save" size={22} />
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerTitle: {
    color: CARD_TEXT,
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    paddingBottom: 36,
    paddingHorizontal: 22,
  },
  label: {
    color: CARD_TEXT,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    color: CARD_TEXT,
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  addressStatus: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 10,
    marginTop: -6,
  },
  addressError: {
    color: "#B42318",
    fontSize: 13,
    marginBottom: 10,
    marginTop: -6,
  },
  suggestionList: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D0D7FF",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: -6,
    overflow: "hidden",
  },
  suggestionItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionItemPressed: {
    backgroundColor: "#EEF3FF",
  },
  suggestionText: {
    color: CARD_TEXT,
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  mapContainer: {
    backgroundColor: "#E8ECFF",
    borderColor: "#D0D7FF",
    borderRadius: 16,
    borderWidth: 1,
    height: 220,
    marginBottom: 18,
    overflow: "hidden",
  },
  photoRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 22,
  },
  photoSlot: {
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#D0D7FF",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    maxWidth: "33.333%",
    overflow: "hidden",
  },
  photoSlotPressed: {
    opacity: 0.9,
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  addPhoto: {
    alignItems: "center",
    backgroundColor: "#F0F3FF",
    flex: 1,
    gap: 6,
    justifyContent: "center",
  },
  addPhotoText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: BRAND,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonPressed: {
    opacity: 0.86,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  errorText: {
    color: "#B42318",
    fontSize: 15,
    marginTop: 16,
    textAlign: "center",
  },
});
