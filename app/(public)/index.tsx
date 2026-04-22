import { Feather, MaterialIcons } from "@expo/vector-icons";
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

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const SUBTLE = "#515981";
const INPUT_BG = "#D6DBFF";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GuestRoute>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>Sydney Exchange</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phoneFrame}>
            <Text style={styles.heroTitle}>Log in</Text>
            <Text style={styles.heroSubtitle}>
              Enter your credentials to continue
            </Text>

            <Text style={styles.sectionLabel}>Email address</Text>
            <View style={styles.inputShell}>
              <MaterialIcons name="email" size={20} color={MUTED} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={MUTED}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>

            <Text style={styles.sectionLabel}>Password</Text>
            <View style={styles.inputShell}>
              <MaterialIcons name="lock" size={20} color={MUTED} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={MUTED}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <Pressable
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
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

            <View style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Access account</Text>
              <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.supportBlock}>
              <Text style={styles.supportTitle}>Need help signing in?</Text>
              <Text style={styles.supportText}>
                Reset your password or contact support if you are having trouble
                accessing your account.
              </Text>
            </View>

            <Text style={styles.footerCopy}>
              By continuing, you agree to our Terms of Use and acknowledge our
              Privacy Policy.
            </Text>
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
    marginBottom: 36,
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
    marginBottom: 24,
  },
  textInput: {
    color: MUTED,
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
  },
  primaryButton: {
    marginTop: 8,
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
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  supportBlock: {
    marginTop: 30,
    marginBottom: 30,
  },
  supportTitle: {
    color: SUBTLE,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  supportText: {
    color: SUBTLE,
    fontSize: 15,
    lineHeight: 24,
  },
  footerCopy: {
    color: "#A3ABD7",
    fontSize: 13,
    lineHeight: 22,
  },
});
