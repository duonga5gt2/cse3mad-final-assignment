import { StyleSheet, Text, View } from 'react-native';

export default function AuthenticatedHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.copy}>
        This tab is now reserved for signed-in content. We can replace it with the real dashboard
        screen next.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#242C51',
    marginBottom: 12,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6C759E',
    textAlign: 'center',
    maxWidth: 320,
  },
});
