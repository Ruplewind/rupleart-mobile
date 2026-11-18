import { View, Text, ScrollView, ActivityIndicator, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useCart from '../../context/CartContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const PAGE_SIZE = 10;
// One seed per app launch: stable order within a session, new order each launch
const SESSION_SEED = Math.random().toString(36).slice(2);

// ProductCard
const ProductCard = memo(({ item }) => {
  const { addToCart } = useCart();
  return (
    <Pressable
      onPress={() => router.push({ pathname: 'preview/[product]', params: { product: JSON.stringify(item) } })}
      style={{ width: '49%', marginBottom: 8 }}
      className="bg-white rounded-lg overflow-hidden"
      android_ripple={{ color: '#EDE9FE' }}
    >
      <Image
        source={{ uri: `${API_URL}/thumb/${item.image[0]}` }}
        style={{ width: '100%', height: 130, backgroundColor: '#EEE' }}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        recyclingKey={item._id}
      />
      <View className="p-2">
        <Text className="text-gray-800 text-sm text-center mb-1" numberOfLines={1} ellipsizeMode="tail">
          {item.productName}
        </Text>
        <Text className="text-gray-400 text-xs text-center mb-2">
          Ksh {item.price.toLocaleString()}
        </Text>
        <Pressable
          onPress={() => addToCart({ ...item, quantity: 1 })}
          className="bg-purple-950 rounded-md py-1.5 items-center"
          android_ripple={{ color: '#6D28D9' }}
        >
          <Text className="text-white text-xs font-bold">Add to Cart</Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

// CategorySection: fetches its own products, only once opened
const CategorySection = ({ categoryName, index }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  const rowBg = index % 2 === 0 ? 'bg-purple-50' : 'bg-violet-50';

  const fetchPage = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        page: String(pageRef.current),
        limit: String(PAGE_SIZE),
        seed: SESSION_SEED,
        category: categoryName,
        exact: '1',
      });
      const res = await fetch(`${API_URL}/get_approved_products?${params}`);
      if (!res.ok) throw new Error('Request failed');
      const json = await res.json();

      const batch = Array.isArray(json) ? json : json.products ?? [];
      setHasMore(Array.isArray(json) ? batch.length === PAGE_SIZE : Boolean(json.hasMore));
      pageRef.current += 1;
      setItems(prev => {
        const seen = new Set(prev.map(p => p._id));
        return [...prev, ...batch.filter(p => !seen.has(p._id))];
      });
      setLoaded(true);
    } catch {
      setError(true);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [categoryName]);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !open;
    setOpen(next);
    if (next && !loaded) fetchPage(); // first open only
  };

  const showLess = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prev => prev.slice(0, PAGE_SIZE));
    pageRef.current = 2;
    setHasMore(true);
  };

  return (
    <View className="mb-2 rounded-2xl overflow-hidden" style={{ shadowColor: '#6B21A8', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
      {/* Header */}
      <Pressable
        onPress={toggle}
        android_ripple={{ color: '#EDE9FE' }}
        className={`${rowBg} flex-row items-center justify-between px-4 py-4`}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-7 h-7 rounded-full bg-purple-200 items-center justify-center">
            <MaterialIcons name="category" size={14} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-sm">{categoryName}</Text>
        </View>
        <AntDesign name={open ? 'up' : 'down'} size={13} color="#7C3AED" />
      </Pressable>

      {/* Body */}
      {open && (
        <View className="bg-white px-3 pt-3 pb-3">
          {!loaded && loading && (
            <View className="items-center py-6">
              <ActivityIndicator color="#7C3AED" />
            </View>
          )}

          {!loaded && error && (
            <View className="items-center py-6">
              <Text className="text-gray-400 text-xs font-montserrat-light mb-2">Couldn't load products</Text>
              <Pressable onPress={fetchPage} className="bg-purple-50 px-4 py-2 rounded-xl">
                <Text className="text-purple-700 text-xs font-montserrat-semibold">Retry</Text>
              </Pressable>
            </View>
          )}

          {loaded && items.length === 0 && (
            <View className="items-center py-6">
              <Text className="text-gray-400 text-xs font-montserrat-light">No products in this category</Text>
            </View>
          )}

          {items.length > 0 && (
            <>
              <View className="flex-row flex-wrap justify-between">
                {items.map(item => (
                  <ProductCard key={item._id} item={item} />
                ))}
              </View>

              {(hasMore || items.length > PAGE_SIZE) && (
                <View className="flex-row gap-2 mt-3">
                  {items.length > PAGE_SIZE && (
                    <Pressable
                      onPress={showLess}
                      className="flex-1 border border-purple-300 rounded-xl py-2.5 items-center"
                      android_ripple={{ color: '#EDE9FE' }}
                    >
                      <Text className="text-purple-700 text-xs font-montserrat-semibold">Show Less</Text>
                    </Pressable>
                  )}
                  {hasMore && (
                    <Pressable
                      onPress={fetchPage}
                      disabled={loading}
                      className="flex-1 bg-purple-950 rounded-xl py-2.5 items-center"
                      android_ripple={{ color: '#6D28D9' }}
                    >
                      {loading
                        ? <ActivityIndicator color="white" size="small" />
                        : <Text className="text-white text-xs font-montserrat-semibold">
                            {error ? 'Retry' : 'Load More'}
                          </Text>}
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

// Main
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/get_categories`)
      .then(r => r.json())
      .then(cats => {
        setCategories(Array.isArray(cats) ? cats : []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError(true); });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="text-gray-400 text-sm mt-3 font-montserrat-light">Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <MaterialIcons name="wifi-off" size={40} color="#D1D5DB" />
        <Text className="text-gray-500 font-montserrat-semibold mt-4 mb-1">Couldn't load data</Text>
        <Text className="text-gray-400 text-xs text-center font-montserrat-light">Check your connection and relaunch</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
          <MaterialIcons name="grid-view" size={16} color="#6B21A8" />
        </View>
        <Text className="text-gray-800 font-montserrat-semibold text-base">Browse by Category</Text>
      </View>

      {categories.map((item, index) => (
        <CategorySection
          key={item._id ?? index}
          categoryName={item.category}
          index={index}
        />
      ))}
    </ScrollView>
  );
};

export default Categories;