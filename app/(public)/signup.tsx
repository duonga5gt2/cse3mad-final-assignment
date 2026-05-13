import { auth } from "@/firebase";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { POST } from "@/lib/fetchFormat";
import { uploadAvatarImage } from "@/storage";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const SUBTLE = "#515981";
const INPUT_BG = "#D6DBFF";
const ERROR = "#B42318";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function onUploadPress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to upload a profile image.",
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
      Alert.alert(
        "Upload failed",
        "We couldn't read that image. Please try another one.",
      );
      return;
    }

    setSelectedImageUri(asset.uri);
  }

  async function onSignupPress() {
    const missing =
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim();

    if (missing) {
      Alert.alert(
        "Missing information",
        "Please fill in all fields to continue.",
      );
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);

    if (!emailIsValid) {
      Alert.alert(
        "Invalid email format",
        "Please enter a valid email address (example: name@gmail.com).",
      );
      return;
    }

    const passwordTrimmed = password.trim();
    const passwordIsValid =
      passwordTrimmed.length >= 8 &&
      /[A-Z]/.test(passwordTrimmed) &&
      /[a-z]/.test(passwordTrimmed) &&
      /\d/.test(passwordTrimmed) &&
      /[^A-Za-z0-9]/.test(passwordTrimmed);

    if (!passwordIsValid) {
      Alert.alert(
        "Invalid password",
        "Use at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const cred = await signup(email, password);
      const avatarUrl = await uploadAvatarImage(cred, selectedImageUri);
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Missing auth token.");
      }

      const response = await POST(
        "https://australia-southeast1-cse3mad-final-assignment.cloudfunctions.net/api/users",
        token,
        {
          firstName,
          lastName,
          email: emailTrimmed,
          phoneNumber: phone,
          avatarUrl,
        },
      );

      console.log(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registerNewUser() {}

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Sydney Exchange</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phoneFrame}>
            <Text style={styles.heroTitle}>Create Account</Text>

            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Text style={styles.sectionLabel}>First Name</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.textInput}
                  />
                </View>
              </View>
              <View style={styles.nameField}>
                <Text style={styles.sectionLabel}>Last Name</Text>
                <View style={styles.inputShell}>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Email</Text>
            <View style={styles.inputShell}>
              <MaterialIcons name="email" size={20} color={MUTED} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.sectionLabel}>Phone Number</Text>
            <View style={styles.inputShell}>
              <MaterialIcons name="phone" size={20} color={MUTED} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.sectionLabel}>Password</Text>
            <View style={[styles.inputShell, styles.inputShellLast]}>
              <MaterialIcons name="lock" size={20} color={MUTED} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <Pressable
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowPassword((current) => !current)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={MUTED}
                />
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Profile Photo</Text>
            <View style={styles.photoSection}>
              <Pressable
                accessibilityLabel="Upload profile photo"
                accessibilityRole="button"
                onPress={onUploadPress}
                style={styles.avatarShell}
              >
                {selectedImageUri ? (
                  <Image
                    contentFit="cover"
                    source={{ uri: selectedImageUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather color="#9AA1C6" name="user" size={46} />
                  </View>
                )}
                <View style={styles.plusBadge}>
                  <Feather color="#FFFFFF" name="plus" size={17} />
                </View>
              </Pressable>

              <Pressable
                accessibilityLabel="Choose profile photo"
                accessibilityRole="button"
                onPress={onUploadPress}
                style={({ pressed }) => [
                  styles.photoButton,
                  pressed && styles.photoButtonPressed,
                ]}
              >
                <MaterialIcons color={BRAND} name="photo-camera" size={19} />
                <Text style={styles.photoButtonText}>
                  {selectedImageUri ? "Change photo" : "Upload photo"}
                </Text>
              </Pressable>
            </View>

            {!!errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Finish sign up"
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}
              onPress={onSignupPress}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Creating account..." : "Finish sign up"}
              </Text>
              <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Already have an account?{" "}
              </Text>
              <Link href="/" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.loginLink}>Login</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F5FF",
  },
  topBar: {
    height: 76,
    justifyContent: "center",
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFFF",
    backgroundColor: "rgba(247,245,255,0.92)",
  },
  headerTitle: {
    color: BRAND,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 32,
  },
  phoneFrame: {
    width: "100%",
    maxWidth: 358,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 28,
    shadowColor: "#242C51",
    shadowOpacity: 0.08,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  heroTitle: {
    color: CARD_TEXT,
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 10,
  },
  heroSubtitle: {
    color: SUBTLE,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  nameField: {
    flex: 1,
    minWidth: 0,
  },
  sectionLabel: {
    color: SUBTLE,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputShell: {
    minHeight: 55,
    borderRadius: 12,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  inputShellLast: {
    marginBottom: 20,
  },
  textInput: {
    color: CARD_TEXT,
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarShell: {
    width: 132,
    height: 132,
    borderRadius: 24,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D9DDF5",
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D9DDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadge: {
    position: "absolute",
    right: 10,
    bottom: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND,
    shadowColor: BRAND,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  photoButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCD3FF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoButtonPressed: {
    opacity: 0.8,
  },
  photoButtonText: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: ERROR,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 8,
    height: 56,
    width: "100%",
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
  primaryButtonPressed: {
    opacity: 0.86,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loginPrompt: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  loginPromptText: {
    color: SUBTLE,
    fontSize: 15,
    lineHeight: 22,
  },
  loginLink: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
});
