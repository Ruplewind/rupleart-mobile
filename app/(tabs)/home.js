import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { memo, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Carousel from "../../components/Carousel";
import SkeletonGrid from "../../components/SkeletonGrid";
import ProductCard from "../../components/ProductCard";
import useCart from "../../context/CartContext";

const PAGE_SIZE = 10;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Created once per app launch: new shuffle each launch, stable while scrolling
const SESSION_SEED = Math.random().toString(36).slice(2);

// Module-level constants keep references stable across renders
const MemoCarousel = memo(Carousel);
const CONTENT_STYLE = { paddingHorizontal: 16, paddingBottom: 120 };
const COLUMN_STYLE = { justifyContent: "space-between" };
const LIST_STYLE = { flex: 1, backgroundColor: "#fff" };
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // first page / reset
  const [loadingMore, setLoadingMore] = useState(false); // next pages
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState(null); // wire up a picker later if needed

  const debouncedSearch = useDebounce(searchQuery);

  // Refs avoid stale closures and duplicate requests while scrolling fast
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);
  const requestIdRef = useRef(0);

  // Cart: kept in a ref so handlers stay stable and cards never re-render
  // because of cart updates
  const { addToCart } = useCart();
  const addToCartRef = useRef(addToCart);
  addToCartRef.current = addToCart;

  const handleOpen = useCallback((item) => {
    router.push({
      pathname: "preview/[product]",
      params: { product: JSON.stringify(item) },
    });
  }, []);

  const handleAddToCart = useCallback((item) => {
    addToCartRef.current({ ...item, quantity: 1 });
  }, []);

  const loadProducts = useCallback(
    async (reset = false) => {
      if (!reset && (fetchingRef.current || !hasMoreRef.current)) return;

      // A reset invalidates any in-flight request (e.g. search changed)
      const requestId = reset ? ++requestIdRef.current : requestIdRef.current;

      if (reset) {
        pageRef.current = 1;
        hasMoreRef.current = true;
        setProducts([]);
        setLoading(true);
        setError(false);
        setLoadMoreError(false);
      } else {
        setLoadingMore(true);
        setLoadMoreError(false);
      }
      fetchingRef.current = true;

      try {
        const page = pageRef.current;
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          seed: SESSION_SEED,
        });
        if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
        if (selectedCategory && selectedCategory !== "All")
          params.append("category", selectedCategory);

        const res = await fetch(`${API_URL}/get_approved_products?${params}`);
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();

        if (requestId !== requestIdRef.current) return; // stale response

        const items = Array.isArray(json) ? json : json.products ?? [];
        hasMoreRef.current = Array.isArray(json)
          ? items.length === PAGE_SIZE
          : Boolean(json.hasMore);
        pageRef.current = page + 1;

        setProducts((prev) => {
          if (reset) return items;
          const seen = new Set(prev.map((p) => p._id));
          return [...prev, ...items.filter((p) => !seen.has(p._id))];
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        reset ? setError(true) : setLoadMoreError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          fetchingRef.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, selectedCategory]
  );

  // First page, and again whenever the search/category changes
  useEffect(() => {
    loadProducts(true);
  }, [loadProducts]);

  const handleEndReached = useCallback(() => {
    if (products.length === 0 || loading) return;
    loadProducts(false);
  }, [products.length, loading, loadProducts]);

  const renderItem = useCallback(
    ({ item }) => (
      <ProductCard item={item} onOpen={handleOpen} onAddToCart={handleAddToCart} />
    ),
    [handleOpen, handleAddToCart]
  );

  const keyExtractor = useCallback((item) => item._id, []);

  // Memoized so it doesn't rebuild when products/loadingMore change.
  // Passed as an element (not an inline component) so the TextInput keeps focus.
  const header = useMemo(
    () => (
      <View>
        <View
          className="mx-4 mt-4 mb-2 flex-row items-center rounded-2xl px-4"
          style={{
            height: 46,
            backgroundColor: "#F4F4F5",
            borderWidth: 1,
            borderColor: "#E5E5EA",
          }}
        >
          <EvilIcons name="search" size={17} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products or categories"
            placeholderTextColor="#9CA3AF"
            className="ml-2.5 flex-1 font-montserrat text-sm"
            style={{ color: "#111827" }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={HIT_SLOP}
              className="ml-2 rounded-full items-center justify-center"
              style={{ width: 20, height: 20, backgroundColor: "#D1D5DB" }}
            >
              <AntDesign name="close" size={11} color="#374151" />
            </TouchableOpacity>
          )}
        </View>
        {!searchQuery && !error && <MemoCarousel />}
      </View>
    ),
    [searchQuery, error]
  );

  const emptyComponent = useMemo(() => {
    if (loading) return <SkeletonGrid count={6} />;
    if (error)
      return (
        <TouchableOpacity onPress={() => loadProducts(true)}>
          <Text className="mt-10 text-center font-montserrat-light text-sm">
            Error fetching data. Tap to retry.
          </Text>
        </TouchableOpacity>
      );
    return (
      <Text className="mt-10 text-center font-montserrat-light text-sm text-gray-500">
        {searchQuery
          ? `No products found for "${searchQuery}"`
          : "No products available"}
      </Text>
    );
  }, [loading, error, searchQuery, loadProducts]);

  const footer = loadingMore ? (
    <ActivityIndicator color="black" size="small" style={{ marginVertical: 16 }} />
  ) : loadMoreError ? (
    <TouchableOpacity onPress={() => loadProducts(false)}>
      <Text className="my-4 text-center font-montserrat-light text-sm">
        Couldn't load more. Tap to retry.
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <FlatList
      style={LIST_STYLE}
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={COLUMN_STYLE}
      contentContainerStyle={CONTENT_STYLE}
      ListHeaderComponent={header}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={footer}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.6}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={50}
      windowSize={7}
    />
  );
}