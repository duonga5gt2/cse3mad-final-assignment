import { StyleSheet, Text, View } from "react-native";

export default function PublishScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publish</Text>
      <Text style={styles.copy}>Create your listing UI here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#242C51",
    marginBottom: 10,
  },
  copy: {
    fontSize: 16,
    color: "#6C759E",
  },
});
