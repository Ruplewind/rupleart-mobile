import { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2-column grid, adjust to match your Products layout

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={{ opacity, width: CARD_WIDTH, marginBottom: 16 }}>
      <View
        style={{
          width: "100%",
          height: CARD_WIDTH,
          borderRadius: 12,
          backgroundColor: "#E5E5EA",
          marginBottom: 8,
        }}
      />
      <View style={{ width: "70%", height: 12, borderRadius: 6, backgroundColor: "#E5E5EA", marginBottom: 6 }} />
      <View style={{ width: "40%", height: 12, borderRadius: 6, backgroundColor: "#E5E5EA" }} />
    </Animated.View>
  );
}

export default function SkeletonGrid({ count = 6 }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginTop: 12,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}