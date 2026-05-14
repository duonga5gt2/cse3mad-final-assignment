import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const BG = "#F7F5FF";
const CALLOUT_BG = "#E8ECFF";

export default function VerifyEmailScreen() {
  const {
    user,
    loading,
    isEmailVerified,
    sendVerificationEmail,
    refreshCurrentUser,
  } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  /** After first successful send, label switches from "Send link" to "Resend link". */
  const [verificationEmailSentOnce, setVerificationEmailSentOnce] = useState(false);

  const email = user?.email?.trim() ?? "";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (isEmailVerified) {
      router.replace("/(main)/(tabs)/home");
    }
  }, [loading, user, isEmailVerified]);

  const openEmailApp = useCallback(async () => {
    const url = email ? `mailto:${encodeURIComponent(email)}` : "mailto:";
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open email", "Install or configure a mail app, or open your inbox in the browser.");
    }
  }, [email]);

  const onSendOrResendPress = useCallback(async () => {
    try {
      setIsResending(true);
      await sendVerificationEmail();
      const isResend = verificationEmailSentOnce;
      setVerificationEmailSentOnce(true);
      Alert.alert(
        "Email sent",
        isResend
          ? "We sent another verification link. Check your inbox."
          : "We sent a verification link. Check your inbox."
      );
    } catch (e) {
      Alert.alert(
        verificationEmailSentOnce ? "Could not resend" : "Could not send",
        e instanceof Error ? e.message : "Please try again in a moment."
      );
    } finally {
      setIsResending(false);
    }
  }, [sendVerificationEmail, verificationEmailSentOnce]);

  const onCheckVerificationPress = useCallback(async () => {
    try {
      setIsChecking(true);
      const refreshedUser = await refreshCurrentUser();
      await refreshedUser?.getIdToken(true);

      if (refreshedUser?.emailVerified) {
        router.replace("/(main)/(tabs)/home");
        return;
      }

      Alert.alert(
        "Not verified yet",
        "We still can't see the verification. Open the email link, then check again.",
      );
    } catch (e) {
      Alert.alert(
        "Could not check",
        e instanceof Error ? e.message : "Please try again in a moment.",
      );
    } finally {
      setIsChecking(false);
    }
  }, [refreshCurrentUser]);

  if (loading || !user || isEmailVerified) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={BRAND} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back to profile"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(main)/(tabs)/profile");
            }
          }}
          style={styles.backButton}
        >
          <MaterialIcons color={BRAND} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.brand}>Sydney Exchange</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialIcons color={BRAND} name="mark-email-read" size={40} />
          </View>

          <Text style={styles.heading}>Check your inbox</Text>

          <Text style={styles.body}>
            {verificationEmailSentOnce ? (
              <>
                We&apos;ve sent a verification link to{" "}
                <Text style={styles.emailEmphasis}>{email || "your email"}</Text>. Open the link in
                that message to verify your account.
              </>
            ) : (
              <>
                Tap <Text style={styles.bodyStrong}>Send link</Text> below and we&apos;ll email a
                verification link to{" "}
                <Text style={styles.emailEmphasis}>{email || "your email"}</Text>.
              </>
            )}
          </Text>

          <Pressable
            accessibilityLabel="Open email app"
            accessibilityRole="button"
            onPress={() => void openEmailApp()}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <MaterialIcons color="#FFFFFF" name="open-in-new" size={22} />
            <Text style={styles.primaryButtonText}>Open email app</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Check email verification"
            accessibilityRole="button"
            disabled={isChecking}
            onPress={() => void onCheckVerificationPress()}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || isChecking) && styles.secondaryButtonPressed,
            ]}
          >
            {isChecking ? (
              <ActivityIndicator color={BRAND} />
            ) : (
              <>
                <MaterialIcons color={BRAND} name="verified" size={20} />
                <Text style={styles.secondaryButtonText}>I&apos;ve verified</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.resendPrompt}>Didn&apos;t receive the email?</Text>

          <Pressable
            accessibilityLabel={
              verificationEmailSentOnce ? "Resend verification email" : "Send verification email"
            }
            accessibilityRole="button"
            disabled={isResending}
            onPress={() => void onSendOrResendPress()}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || isResending) && styles.secondaryButtonPressed,
            ]}
          >
            {isResending ? (
              <ActivityIndicator color={BRAND} />
            ) : (
              <>
                <MaterialIcons
                  color={BRAND}
                  name={verificationEmailSentOnce ? "refresh" : "send"}
                  size={20}
                />
                <Text style={styles.secondaryButtonText}>
                  {verificationEmailSentOnce ? "Resend link" : "Send link"}
                </Text>
              </>
            )}
          </Pressable>

          {Platform.OS !== "web" ? (
            <View style={styles.hintBox}>
              <MaterialIcons color={BRAND} name="schedule" size={18} />
              <Text style={styles.hintText}>
                The link may expire after a short time for security. If it does, tap Send link or
                Resend link below.
              </Text>
            </View>
          ) : null}

          <View style={styles.hintBox}>
            <MaterialIcons color={BRAND} name="inbox" size={18} />
            <Text style={styles.hintText}>
              If you don&apos;t see it, check spam or promotions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarSpacer: {
    width: 44,
  },
  brand: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: BRAND,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: "#242C51",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  iconCircle: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: CALLOUT_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: CARD_TEXT,
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
    textAlign: "center",
    marginBottom: 24,
  },
  emailEmphasis: {
    color: CARD_TEXT,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  bodyStrong: {
    fontWeight: "700",
    color: CARD_TEXT,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BRAND,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendPrompt: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#B8C4FF",
    backgroundColor: "#EEF1FF",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  secondaryButtonPressed: {
    opacity: 0.88,
  },
  secondaryButtonText: {
    color: BRAND,
    fontSize: 15,
    fontWeight: "700",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: CALLOUT_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
});
