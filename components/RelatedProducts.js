import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { Image } from "expo-image";
import * as Animatable from "react-native-animatable";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const RELATED_COUNT = 6;

// Same seed all day: related lists stay stable within a day, and the server
// can reuse its cached shuffle across every user and product page.
const DAILY_SEED = `related-${new Date().toDateString().replace(/\s/g, "-")}`;

const zoomIn = { 0: { scale: 0.9 }, 1: { scale: 1 } };
const zoomOut = { 0: { scale: 1 }, 1: { scale: 0.9 } };

const ITEM_STYLE = { marginRight: 20 };
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 70 };

const LatestItem = memo(({ isActive, item }) => (
  <Animatable.View
    style={ITEM_STYLE}
    animation={isActive ? zoomIn : zoomOut}
    duration={500}
  >
    <TouchableOpacity
      style={{
        width: 100,
        height: 130,
        backgroundColor: "#f0f0f0",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 3,
      }}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "preview/[product]",
          params: { product: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={{ uri: `${API_URL}/thumb/${item.image[0]}` }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={item._id}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: 10,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ color: "#fff", fontSize: 10, fontWeight: "600", marginBottom: 4 }}
        >
          {item.productName}
        </Text>
        <Text style={{ color: "#f5f5f5", fontSize: 10 }}>
          Ksh. {item.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  </Animatable.View>
));

const RelatedProducts = ({ currentItemId, category }) => {
  const [products, setProducts] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      return;
    }

    const controller = new AbortController();

    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: String(RELATED_COUNT + 2), // spare items in case the current one is included
          seed: DAILY_SEED,
          category,
          exact: "1", // exact `type` match, like the old `product.type === category`
        });

        const res = await fetch(`${API_URL}/get_approved_products?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();

        const items = (Array.isArray(json) ? json : json.products ?? [])
          .filter((p) => p._id !== currentItemId)
          .slice(0, RELATED_COUNT);

        setProducts(items);
        setActiveItem(items[0]?._id ?? null);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Error fetching related:", err);
      }
    };

    fetchRelated();
    return () => controller.abort(); // cancel if category/product changes or screen unmounts
  }, [category, currentItemId]);

  // FlatList doesn't allow these to change between renders, so keep them stable
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveItem(viewableItems[0].key);
  }).current;

  const renderItem = useCallback(
    ({ item }) => <LatestItem item={item} isActive={activeItem === item._id} />,
    [activeItem]
  );

  const keyExtractor = useCallback((p) => p._id, []);

  if (products.length === 0) return null;

  return (
    <View className="p-4 px-2" style={{ backgroundColor: "#fff" }}>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={activeItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        initialNumToRender={4}
        windowSize={3}
      />
    </View>
  );
};

export default RelatedProducts;