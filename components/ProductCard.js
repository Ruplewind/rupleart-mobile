import React, { memo } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";

const ProductCard = ({ item, onOpen, onAddToCart }) => (
  <Pressable style={styles.card} onPress={() => onOpen(item)}>
    <Image
      source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/thumb/${item.image[0]}` }}
      style={styles.image}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
      recyclingKey={item._id}
    />
    <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
      {item.productName}
    </Text>
    <Text style={styles.price}>Ksh {item.price.toLocaleString()}</Text>
    <Pressable style={styles.addToCartButton} onPress={() => onAddToCart(item)}>
      <Text style={styles.buttonText}>Add to Cart</Text>
    </Pressable>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: "49%",
    height: 220, // fixed height makes layout cheap and predictable
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 10,
    marginBottom: 5,
    overflow: "hidden",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#EEE", // plain placeholder instead of blurhash
  },
  productName: { color: "black", fontSize: 14, textAlign: "center", marginBottom: 4 },
  price: { color: "gray", fontSize: 12, textAlign: "center", marginBottom: 5 },
  addToCartButton: {
    backgroundColor: "#4A148C",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 12, fontWeight: "bold" },
});

export default memo(ProductCard);