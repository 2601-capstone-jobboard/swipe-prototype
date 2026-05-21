import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getJobs } from "../api/jobs";
import SwipeDeck from "../components/SwipeDeck";

export default function HomeScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobs();
        console.log("Loaded jobs:", data);
        setJobs(data);
      } catch (error) {
        console.log("Failed to load jobs:", error.message);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swipe Job Finder</Text>

      <View style={styles.deckWrapper}>
        {loading ? (
          <Text>Loading jobs...</Text>
        ) : jobs.length === 0 ? (
          <Text>No jobs loaded</Text>
        ) : (
          <SwipeDeck jobs={jobs} />
        )}
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