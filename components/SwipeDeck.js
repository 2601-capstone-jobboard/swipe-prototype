import { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SwipeDeck() {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const cards = [
    { id: 1, name: "Card 1", description: "Swipe left or right" },
    { id: 2, name: "Card 2", description: "This is the next card" },
    { id: 3, name: "Card 3", description: "Last card" },
  ];

  function nextCard() {
    position.setValue({ x: 0, y: 0 });
    setIndex((prev) => prev + 1);
  }

  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > 120) {
          Animated.timing(position, {
            toValue: { x: 500, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(nextCard);
        } else if (gesture.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -500, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(nextCard);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!cards[index]) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>No more cards</Text>
      </View>
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ]}
    >
      <Text style={styles.title}>{cards[index].name}</Text>
      <Text style={styles.description}>{cards[index].description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 310,
    height: 420,
    backgroundColor: "white",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
  },
});