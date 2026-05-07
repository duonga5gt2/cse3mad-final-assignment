import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GuestRoute } from "@/components/GuestRoute";
import { useAuth } from "@/contexts/AuthContext";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const SUBTLE = "#515981";
const INPUT_BG = "#D6DBFF";
const ERROR = "#B42318";
const SUCCESS = "#027A48";

export default function ForgetPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function onResetPress() {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      await resetPassword(email.trim());
      setSuccessMessage("Reset link sent. Please check your email.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GuestRoute>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Sydney Exchange</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phoneFrame}>
            <Text style={styles.heroTitle}>Forgot Password</Text>
            <Text style={styles.heroSubtitle}>
              Enter your email and we will send you a reset password link.
            </Text>

            <Text style={styles.sectionLabel}>Email address</Text>
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

            {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            <Pressable
              accessibilityLabel="Send password reset link"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={onResetPress}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Text>
              <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.backToLoginRow}>
              <Text style={styles.backCopy}>Remember your password? </Text>
              <Link href="/" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.backLink}>Back to login</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GuestRoute>
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
    marginBottom: 12,
  },
  textInput: {
    color: CARD_TEXT,
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
  },
  errorText: {
    color: ERROR,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  successText: {
    color: SUCCESS,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 10,
    height: 56,
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
    opacity: 0.9,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  backToLoginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  backCopy: {
    color: SUBTLE,
    fontSize: 15,
    lineHeight: 22,
  },
  backLink: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
});
