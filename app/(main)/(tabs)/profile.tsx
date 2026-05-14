import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/firebase";
import { GET, PATCH } from "@/lib/fetchFormat";
import { uploadAvatarImage } from "@/storage";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";
const API_BASE_URL =
  "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api";
const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80";

type PreviewItem = {
  id: string;
  title: string;
  price: string;
  imageUri: string;
};

type ProfileApiProduct = {
  prod_id: number;
  title: string;
  price: number | string;
  product_photo_url_1?: string | null;
};

type ProfileApiResponse = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phonenumber?: string | null;
  newest_selling_products?: ProfileApiProduct[] | null;
  newest_buying_products?: ProfileApiProduct[] | null;
};

type ProfileViewModel = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  pending: PreviewItem[];
  listings: PreviewItem[];
};

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

function mapPreviewItem(product: ProfileApiProduct): PreviewItem {
  return {
    id: String(product.prod_id),
    title: product.title,
    price: formatPrice(product.price),
    imageUri: product.product_photo_url_1 || FALLBACK_PRODUCT_IMAGE,
  };
}

function mapProfile(row: ProfileApiResponse): ProfileViewModel {
  return {
    firstName: row.first_name?.trim() || "User",
    lastName: row.last_name?.trim() || "",
    email: row.email?.trim() || "No email",
    phone: row.phonenumber?.trim() || "No phone number",
    avatarUrl: row.avatar_url?.trim() || FALLBACK_AVATAR,
    pending: (row.newest_buying_products ?? []).map(mapPreviewItem),
    listings: (row.newest_selling_products ?? []).map(mapPreviewItem),
  };
}

function PreviewRow({ item }: { item: PreviewItem }) {
  return (
    <Pressable
      accessibilityLabel={`Open ${item.title}`}
      accessibilityRole="button"
      onPress={() =>
        router.push(`/(main)/product-detail/${encodeURIComponent(item.id)}`)
      }
      style={({ pressed }) => [
        styles.previewRow,
        pressed && styles.previewRowPressed,
      ]}
    >
      <Image contentFit="cover" source={{ uri: item.imageUri }} style={styles.previewThumb} />
      <View style={styles.previewBody}>
        <Text numberOfLines={1} style={styles.previewTitle}>
          {item.title}
        </Text>
        <Text style={styles.previewPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { logout, isEmailVerified } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<ProfileViewModel | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatarUri, setEditAvatarUri] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError("");

      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Missing auth token.");
      }

      const response = await GET<ProfileApiResponse>(
        `${API_BASE_URL}/me`,
        token,
      );

      if (!response.ok) {
        throw new Error(response.error);
      }

      setProfile(mapProfile(response.data));
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Unable to load profile.",
      );
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadActiveProfile() {
        if (isActive) {
          await loadProfile();
        }
      }

      void loadActiveProfile();

      return () => {
        isActive = false;
      };
    }, [loadProfile]),
  );

  function openEditProfile() {
    if (!profile) return;

    setEditFirstName(profile.firstName === "User" ? "" : profile.firstName);
    setEditLastName(profile.lastName);
    setEditEmail(profile.email === "No email" ? "" : profile.email);
    setEditPhone(profile.phone === "No phone number" ? "" : profile.phone);
    setEditAvatarUri(null);
    setIsEditingProfile(true);
  }

  function closeEditProfile() {
    setIsEditingProfile(false);
    setEditAvatarUri(null);
  }

  async function pickProfileImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to update your profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setEditAvatarUri(result.assets[0].uri);
    }
  }

  async function saveProfile() {
    const firstName = editFirstName.trim();
    const lastName = editLastName.trim();
    const email = editEmail.trim();
    const phoneNumber = editPhone.trim();

    if (!firstName || !lastName || !email || !phoneNumber) {
      Alert.alert(
        "Missing information",
        "Please fill in first name, last name, email, and phone number.",
      );
      return;
    }

    try {
      setIsSavingProfile(true);

      const currentUser = auth.currentUser;
      const token = await currentUser?.getIdToken();

      if (!currentUser || !token) {
        throw new Error("Missing auth token.");
      }

      const avatarUrl = editAvatarUri
        ? await uploadAvatarImage(currentUser.uid, editAvatarUri)
        : profile?.avatarUrl;

      const response = await PATCH<ProfileApiResponse>(
        `${API_BASE_URL}/me`,
        token,
        {
          firstName,
          lastName,
          email,
          phoneNumber,
          avatarUrl,
        },
      );

      if (!response.ok) {
        throw new Error(response.error);
      }

      closeEditProfile();
      await loadProfile();
      Alert.alert("Profile updated", "Your profile details have been saved.");
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function onLogoutPress() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>

        {isLoadingProfile ? (
          <ActivityIndicator color={BRAND} size="large" />
        ) : null}

        {profileError ? (
          <Text style={styles.errorText}>{profileError}</Text>
        ) : null}

        {profile ? (
          <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <Image
              contentFit="cover"
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.metaLine}>{profile.phone}</Text>
          <Text style={styles.metaLine}>{profile.email}</Text>

          <Pressable
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            onPress={openEditProfile}
            style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
          >
            <MaterialIcons color="#FFFFFF" name="edit" size={20} />
            <Text style={styles.editButtonText}>Edit profile</Text>
          </Pressable>
        </View>
        ) : null}

        {profile && isEditingProfile ? (
          <View style={styles.editPanel}>
            <Text style={styles.editPanelTitle}>Edit profile</Text>

            <Pressable
              accessibilityLabel="Choose profile photo"
              accessibilityRole="button"
              onPress={() => void pickProfileImage()}
              style={({ pressed }) => [
                styles.editAvatarButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <Image
                contentFit="cover"
                source={{ uri: editAvatarUri ?? profile.avatarUrl }}
                style={styles.editAvatarPreview}
              />
              <Text style={styles.editAvatarText}>Change photo</Text>
            </Pressable>

            <TextInput
              onChangeText={setEditFirstName}
              placeholder="First name"
              placeholderTextColor={MUTED}
              style={styles.input}
              value={editFirstName}
            />
            <TextInput
              onChangeText={setEditLastName}
              placeholder="Last name"
              placeholderTextColor={MUTED}
              style={styles.input}
              value={editLastName}
            />
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEditEmail}
              placeholder="Email"
              placeholderTextColor={MUTED}
              style={styles.input}
              value={editEmail}
            />
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setEditPhone}
              placeholder="Phone number"
              placeholderTextColor={MUTED}
              style={styles.input}
              value={editPhone}
            />

            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSavingProfile}
                onPress={closeEditProfile}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSavingProfile}
                onPress={() => void saveProfile()}
                style={({ pressed }) => [
                  styles.saveButton,
                  (pressed || isSavingProfile) && styles.saveButtonPressed,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {isSavingProfile ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                router.push({
                  pathname: "/(main)/manage-list",
                  params: { tab: "pending" },
                })
              }
            >
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHint}>{"Items you're interested in"}</Text>
          {profile?.pending.map((item) => (
            <PreviewRow item={item} key={item.id} />
          ))}
          {profile && profile.pending.length === 0 ? (
            <Text style={styles.emptyText}>No pending items yet.</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My listings</Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/(main)/manage-list")}
            >
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionHint}>{"What you're selling"}</Text>
          {profile?.listings.map((item) => (
            <PreviewRow item={item} key={item.id} />
          ))}
          {profile && profile.listings.length === 0 ? (
            <Text style={styles.emptyText}>No listings yet.</Text>
          ) : null}
        </View>

        {!isEmailVerified ? (
          <Pressable
            accessibilityLabel="Open verify email screen"
            accessibilityRole="button"
            onPress={() => router.push("/(main)/verify-email")}
            style={({ pressed }) => [styles.verifyButton, pressed && styles.verifyButtonPressed]}
          >
            <Text style={styles.verifyButtonText}>Verify email</Text>
          </Pressable>
        ) : (
          <Text style={styles.verifiedNote}>Your email is verified.</Text>
        )}

        <Pressable
          accessibilityLabel="Log out"
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={onLogoutPress}
          style={({ pressed }) => [
            styles.logoutButton,
            (pressed || isLoggingOut) && styles.logoutButtonPressed,
          ]}
        >
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: CARD_TEXT,
    marginBottom: 16,
  },
  errorText: {
    color: "#B42318",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#242C51",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    alignItems: "center",
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#E8ECFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: CARD_TEXT,
    textAlign: "center",
  },
  metaLine: {
    marginTop: 6,
    fontSize: 15,
    color: MUTED,
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    minWidth: 200,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: BRAND,
    paddingHorizontal: 24,
  },
  editButtonPressed: {
    opacity: 0.9,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  editPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#242C51",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  editPanelTitle: {
    color: CARD_TEXT,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  editAvatarButton: {
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    marginBottom: 14,
  },
  editAvatarPreview: {
    backgroundColor: "#E8ECFF",
    borderRadius: 18,
    height: 84,
    width: 84,
  },
  editAvatarText: {
    color: BRAND,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#EEF1FF",
    borderRadius: 12,
    color: CARD_TEXT,
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: "#EEF3FF",
    borderColor: "#B8C4FF",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  cancelButtonPressed: {
    opacity: 0.86,
  },
  cancelButtonText: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: BRAND,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
  },
  saveButtonPressed: {
    opacity: 0.86,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  sectionHint: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 10,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#242C51",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  previewRowPressed: {
    opacity: 0.92,
  },
  previewThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E8ECFF",
  },
  previewBody: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: CARD_TEXT,
  },
  previewPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: BRAND,
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    paddingVertical: 8,
    textAlign: "center",
  },
  verifyButton: {
    marginTop: 4,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND,
    backgroundColor: "#EEF3FF",
    paddingHorizontal: 24,
  },
  verifyButtonPressed: {
    opacity: 0.88,
  },
  verifyButtonText: {
    color: BRAND,
    fontSize: 16,
    fontWeight: "700",
  },
  verifiedNote: {
    marginTop: 12,
    fontSize: 15,
    color: "#027A48",
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 20,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: BRAND,
    paddingHorizontal: 20,
  },
  logoutButtonPressed: {
    opacity: 0.86,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
