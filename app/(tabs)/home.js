import { Link } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
} from "react-native";
import { Text, View } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import Dropdown from "../../components/DropDown";
import Products from "../../components/Products";
import LatestArtworks from "../../components/LatestArtworks";
import DropDownPicker from "react-native-dropdown-picker";
import Carousel from "../../components/Carousel";
import SkeletonGrid from "../../components/SkeletonGrid";
import EvilIcons from '@expo/vector-icons/EvilIcons';

const PAGE_SIZE = 10;

export default function Home() {
  const { logout, fullName } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const priorityOrder = [
    "Home/office decor",
    "Lighting & illumination",
    "Fashion & design",
    "Painting"
  ];

  const sortCategories = (categoriesArray) => {
    const priorityCategories = [];
    const otherCategories = [];

    categoriesArray.forEach(cat => {
      const trimmedCategory = cat.category.trim();
      const priorityIndex = priorityOrder.findIndex(p => p.toLowerCase() === trimmedCategory.toLowerCase());

      if (priorityIndex !== -1) {
        priorityCategories.push({ ...cat, priorityIndex });
      } else {
        otherCategories.push(cat);
      }
    });

    priorityCategories.sort((a, b) => a.priorityIndex - b.priorityIndex);
    const sortedPriority = priorityCategories.map(({ priorityIndex, ...cat }) => cat);

    return [...sortedPriority, ...otherCategories];
  };

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(sortCategories(data));
        setCategoriesLoading(false);
      })
      .catch(() => {
        setCategoriesLoading(false);
        setError(true);
      })
  }, [])

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_approved_products`)
      .then((res) => res.json())
      .then((res) => {
        let data = res.reverse()
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(true)
      })
  }, [])

  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [open, setOpen] = useState(false);
  const scrollViewRef = useRef(null);

  // Filter by search query first
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const productName = (product.productName || product.name || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      return productName.includes(query) || category.includes(query);
    });
  }, [products, searchQuery]);

  // Reset pagination whenever the search query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // Only render a growing slice — this is what keeps scrolling smooth with many products
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      if (!hasMore || loadingMore) return;

      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const distanceFromBottom =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (distanceFromBottom < 300) {
        setLoadingMore(true);
        // small timeout keeps the spinner from flashing on fast devices
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));
          setLoadingMore(false);
        }, 150);
      }
    },
    [hasMore, loadingMore, filteredProducts.length]
  );

  return (
    <ScrollView
      className="flex-1 bg-white"
      scrollViewProps={{
        scrollEnabled: true,
        nestedScrollEnabled: true
      }}
      ref={scrollViewRef}
      onScroll={handleScroll}
      scrollEventThrottle={100}
    >
      {/* Search bar */}
      <View
        className="mx-4 mt-4 mb-2 flex-row items-center rounded-2xl px-4"
        style={{
          height: 46,
          backgroundColor: isDark ? "#1c1c1e" : "#F4F4F5",
          borderWidth: 1,
          borderColor: isDark ? "#2c2c2e" : "#E5E5EA",
        }}
      >
        <EvilIcons name="search" size={17} color={isDark ? "#8E8E93" : "#9CA3AF"} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products or categories"
          placeholderTextColor={isDark ? "#8E8E93" : "#9CA3AF"}
          className="ml-2.5 flex-1 font-montserrat text-sm"
          style={{ color: isDark ? "#F5F5F5" : "#111827" }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="ml-2 rounded-full items-center justify-center"
            style={{
              width: 20,
              height: 20,
              backgroundColor: isDark ? "#3a3a3c" : "#D1D5DB",
            }}
          >
            <AntDesign name="close" size={11} color={isDark ? "#F5F5F5" : "#374151"} />
          </TouchableOpacity>
        )}
      </View>

      {!loading && error && (
        <Text className="mt-10 text-center font-montserrat-light text-sm">
          Error Fetching Data. Relaunch app.
        </Text>
      )}

      {!error && loading && <SkeletonGrid count={6} />}

      {!error && !loading && (
        <>
          {!searchQuery && <Carousel />}

          {searchQuery.length > 0 && filteredProducts.length === 0 && (
            <Text className="mt-10 text-center font-montserrat-light text-sm text-gray-500">
              No products found for "{searchQuery}"
            </Text>
          )}

          <Products
            products={visibleProducts}
            category={selectedCategory}
            scrollViewRef={scrollViewRef}
            className=""
          />

          {loadingMore && (
            <ActivityIndicator color="black" size="small" style={{ marginVertical: 16 }} />
          )}
        </>
      )}
    </ScrollView>
  );
}