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

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const MUTED = "#6C759E";
const SUBTLE = "#515981";
const INPUT_BG = "#D6DBFF";

export default function SignupScreen() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

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
                        <Text style={styles.heroTitle}>Create Account</Text>
                        <Text style={styles.heroSubtitle}>
                            Join our community of curators today.
                        </Text>

                        <View style={styles.nameRow}>
                            <View style={styles.nameField}>
                                <Text style={styles.sectionLabel}>First Name</Text>
                                <View style={styles.inputShell}>
                                    <TextInput
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="Alex"
                                        placeholderTextColor={MUTED}
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
                                        placeholder="Rivers"
                                        placeholderTextColor={MUTED}
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
                                placeholder="alex@example.com"
                                placeholderTextColor={MUTED}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                style={styles.textInput}
                            />
                        </View>

                        <Text style={styles.sectionLabel}>Phone Number</Text>
                        <View style={[styles.inputShell, styles.inputShellLast]}>
                            <MaterialIcons name="phone" size={20} color={MUTED} />
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+1 (555) 000-0000"
                                placeholderTextColor={MUTED}
                                keyboardType="phone-pad"
                                style={styles.textInput}
                            />
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Create account"
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.primaryButtonPressed,
                            ]}
                        >
                            <Text style={styles.primaryButtonText}>Create Account</Text>
                            <MaterialIcons name="arrow-forward" size={22} color="#FFFFFF" />
                        </Pressable>

                        <View style={styles.loginPrompt}>
                            <Text style={styles.loginPromptText}>Already have an account? </Text>
                            <Link href="/" asChild>
                                <Pressable hitSlop={8}>
                                    <Text style={styles.loginLink}>Login</Text>
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
        marginBottom: 24,
    },
    textInput: {
        color: CARD_TEXT,
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
    primaryButtonPressed: {
        opacity: 0.92,
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