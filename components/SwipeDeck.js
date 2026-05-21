import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function SwipeDeck({ jobs = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentJob = jobs[currentIndex];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-18deg", "0deg", "18deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.25],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.25, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }

  function forceSwipe(direction) {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => handleSwipeComplete(direction));
  }

  function handleSwipeComplete(direction) {
    const swipedJob = jobs[currentIndex];

    if (!swipedJob) return;

    if (direction === "right") {
      console.log("Saved job:", swipedJob.title);
    }

    if (direction === "left") {
      console.log("Passed job:", swipedJob.title);
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }

  function openApplyLink() {
    if (currentJob?.applyUrl) {
      Linking.openURL(currentJob.applyUrl);
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        position.setValue({
          x: gesture.dx,
          y: gesture.dy,
        });
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function renderCard(job) {
    if (!job) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.company}>{job.company}</Text>
        <Text style={styles.title}>{job.title}</Text>

        <Text style={styles.location}>{job.location}</Text>
        <Text style={styles.salary}>{job.salary}</Text>

        <Text style={styles.description} numberOfLines={5}>
          {job.description}
        </Text>

        <View style={styles.skillsContainer}>
          {job.skills?.map((skill) => (
            <View key={skill} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.clearance}>
          Clearance: {job.securityClearance || "Not listed"}
        </Text>

        {job.applyUrl ? (
          <TouchableOpacity style={styles.applyButton} onPress={openApplyLink}>
            <Text style={styles.applyButtonText}>View Job</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  function renderCards() {
    if (currentIndex >= jobs.length) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No more jobs</Text>
          <Text style={styles.emptyText}>
            Try changing your search filters later.
          </Text>
        </View>
      );
    }

    return jobs
      .map((job, index) => {
        if (index < currentIndex) {
          return null;
        }

        if (index === currentIndex) {
          return (
            <Animated.View
              key={job.id || index}
              style={[styles.cardWrapper, animatedCardStyle]}
              {...panResponder.panHandlers}
            >
              <Animated.View
                style={[
                  styles.badge,
                  styles.likeBadge,
                  { opacity: likeOpacity },
                ]}
              >
                <Text style={[styles.badgeText, styles.likeText]}>SAVE</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.badge,
                  styles.nopeBadge,
                  { opacity: nopeOpacity },
                ]}
              >
                <Text style={[styles.badgeText, styles.nopeText]}>PASS</Text>
              </Animated.View>

              {renderCard(job)}
            </Animated.View>
          );
        }

        return (
          <Animated.View
            key={job.id || index}
            style={[
              styles.cardWrapper,
              {
                top: 10 * (index - currentIndex),
                transform: [{ scale: 1 - 0.04 * (index - currentIndex) }],
              },
            ]}
          >
            {renderCard(job)}
          </Animated.View>
        );
      })
      .reverse();
  }

  return (
    <View style={styles.deckContainer}>
      <View style={styles.cardsContainer}>{renderCards()}</View>

      {currentJob ? (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => forceSwipe("left")}
          >
            <Text style={styles.passButtonText}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => forceSwipe("right")}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },

  cardsContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    justifyContent: "center",
  },

  cardWrapper: {
    position: "absolute",
    width: "90%",
    maxWidth: 380,
    alignSelf: "center",
  },

  card: {
    width: "100%",
    minHeight: 480,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    padding: 24,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  company: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },

  location: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },

  salary: {
    fontSize: 17,
    color: "#15803d",
    fontWeight: "800",
    marginBottom: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    marginBottom: 14,
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  skillPill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },

  skillText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 12,
  },

  clearance: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "700",
    marginBottom: 14,
  },

  applyButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: "center",
  },

  applyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },

  badge: {
    position: "absolute",
    top: 40,
    zIndex: 10,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  likeBadge: {
    left: 24,
    borderColor: "#22c55e",
    transform: [{ rotate: "-15deg" }],
  },

  nopeBadge: {
    right: 24,
    borderColor: "#ef4444",
    transform: [{ rotate: "15deg" }],
  },

  badgeText: {
    fontSize: 26,
    fontWeight: "900",
  },

  likeText: {
    color: "#22c55e",
  },

  nopeText: {
    color: "#ef4444",
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 35,
  },

  actionButton: {
    width: 120,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },

  passButton: {
    backgroundColor: "#fee2e2",
  },

  saveButton: {
    backgroundColor: "#dcfce7",
  },

  passButtonText: {
    color: "#b91c1c",
    fontSize: 18,
    fontWeight: "800",
  },

  saveButtonText: {
    color: "#15803d",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyCard: {
    width: "90%",
    maxWidth: 380,
    minHeight: 460,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  emptyTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
});