import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const BRAND = "#0057BD";
const CARD_TEXT = "#242C51";
const SUBTLE = "#515981";

export function LoadingCard() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={BRAND} />
        <Text style={styles.title}>Loading</Text>
        <Text style={styles.subtitle}>Checking your session...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F5FF",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: CARD_TEXT,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  title: {
    marginTop: 18,
    color: CARD_TEXT,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: SUBTLE,
    fontSize: 14,
    textAlign: "center",
  },
});
