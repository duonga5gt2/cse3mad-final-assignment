import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { GuestRoute } from "@/components/GuestRoute";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const SUBTLE = "#6C759E";
const BG = "#F7F5FF";

export default function ProfileImageScreen() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  async function onUploadPress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to upload a profile image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert("Upload failed", "We couldn't read that image. Please try another one.");
      return;
    }

    setSelectedImageUri(asset.uri);
  }

  function onSkipPress() {
  }

  function onFinishPress() {

  }

  return (
    <GuestRoute>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.back()}
            >
              <Feather color={BRAND} name="arrow-left" size={24} />
            </Pressable>
            <Text style={styles.stepTitle}>Profile Setup</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.content}>
            <Text style={styles.title}>Add a Profile Photo</Text>
            
            <View style={styles.avatarShell}>
              {selectedImageUri ? (
                <Image contentFit="cover" source={{ uri: selectedImageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather color="#B0B5D9" name="user" size={96} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <MaterialIcons color={BRAND} name="photo-camera" size={20} />
              </View>
              <View style={styles.plusBadge}>
                <Feather color="#FFFFFF" name="plus" size={20} />
              </View>
            </View>

            <Pressable
              accessibilityLabel="Upload profile photo"
              accessibilityRole="button"
              onPress={onUploadPress}
              style={({ pressed }) => [styles.uploadButton, pressed && styles.uploadButtonPressed]}
            >
              <Text style={styles.uploadButtonText}>Upload Photo</Text>
              <Feather color="#FFFFFF" name="upload" size={18} />
            </Pressable>

            <Pressable
              accessibilityLabel="Skip photo and finish signup"
              accessibilityRole="button"
              onPress={onSkipPress}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Finish signup"
              accessibilityRole="button"
              onPress={onFinishPress}
              style={styles.finishButton}
            >
              <Text style={styles.finishText}>Finish sign up</Text>
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <MaterialIcons color="#9AA1C6" name="lock" size={14} />
            <Text style={styles.footerCopy}>PRIVATE & SECURE ENCRYPTION</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GuestRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    minHeight: "100%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 44,
    paddingHorizontal: 4,
  },
  stepTitle: {
    color: SUBTLE,
    fontSize: 33,
    fontWeight: "600",
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0FF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 54,
  },
  title: {
    color: CARD_TEXT,
    fontSize: 52,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 16,
    color: SUBTLE,
    fontSize: 30,
    lineHeight: 42,
    textAlign: "center",
    maxWidth: 620,
  },
  avatarShell: {
    marginTop: 34,
    width: 280,
    height: 280,
    borderRadius: 32,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#D9DDF5",
  },
  avatarPlaceholder: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#D9DDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
  },
  plusBadge: {
    position: "absolute",
    right: 38,
    bottom: 36,
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND,
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  uploadButton: {
    marginTop: 36,
    height: 56,
    width: "100%",
    maxWidth: 358,
    borderRadius: 12,
    backgroundColor: BRAND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  uploadButtonPressed: {
    opacity: 0.92,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  skipButton: {
    marginTop: 18,
    paddingVertical: 6,
  },
  skipText: {
    color: BRAND,
    fontSize: 16,
    fontWeight: "700",
  },
  finishButton: {
    marginTop: 12,
    paddingVertical: 6,
  },
  finishText: {
    color: CARD_TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  footerCopy: {
    color: "#9AA1C6",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
