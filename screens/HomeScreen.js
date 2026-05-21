import { View, Text, StyleSheet } from "react-native";
import SwipeDeck from "../components/SwipeDeck";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swipe Job Finder</Text>

      <View style={styles.deckWrapper}>
        <SwipeDeck />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  deckWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
});