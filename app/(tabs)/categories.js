import { View, Text, ScrollView, ActivityIndicator, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useCart from '../../context/CartContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PAGE_SIZE = 10;

// ProductCard
const ProductCard = ({ item }) => {
  const { addToCart } = useCart();
  return (
    <Pressable
      onPress={() => router.push({ pathname: 'preview/[product]', params: { product: JSON.stringify(item) } })}
      style={{ width: '49%', marginBottom: 8 }}
      className="bg-white rounded-lg overflow-hidden"
      android_ripple={{ color: '#EDE9FE' }}
    >
      <Image
        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
        style={{ width: '100%', height: 130 }}
        contentFit="cover"
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
};

// CategorySection
const CategorySection = ({ categoryName, index, allProducts }) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const rowBg = index % 2 === 0 ? 'bg-purple-50' : 'bg-violet-50';

  // All matching products, newest first
  const allInCategory = allProducts
    .filter(p => p.type?.toLowerCase().trim() === categoryName.toLowerCase().trim())
    .reverse();

  const total = allInCategory.length;
  const displayed = allInCategory.slice(0, page * PAGE_SIZE);
  const hasMore = displayed.length < total;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(prev => !prev);
  };

  const loadMore = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPage(prev => prev + 1);
  };

  const showLess = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPage(1);
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
        <View className="flex-row items-center gap-2">
          <View className="bg-purple-200 rounded-full px-2 py-0.5">
            <Text className="text-purple-800 text-xs">{total} item{total !== 1 ? 's' : ''}</Text>
          </View>
          <AntDesign name={open ? 'up' : 'down'} size={13} color="#7C3AED" />
        </View>
      </Pressable>

      {/* Body */}
      {open && (
        <View className="bg-white px-3 pt-3 pb-3">
          {total === 0 ? (
            <View className="items-center py-6">
              <Text className="text-gray-400 text-xs font-montserrat-light">No products in this category</Text>
            </View>
          ) : (
            <>
              <Text className="text-gray-400 text-xs font-montserrat-light mb-3">
                Showing {displayed.length} of {total}
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {displayed.map(item => (
                  <ProductCard key={item._id} item={item} />
                ))}
              </View>

              {/* Pagination buttons */}
              {(hasMore || page > 1) && (
                <View className="flex-row gap-2 mt-3">
                  {page > 1 && (
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
                      onPress={loadMore}
                      className="flex-1 bg-purple-950 rounded-xl py-2.5 items-center"
                      android_ripple={{ color: '#6D28D9' }}
                    >
                      <Text className="text-white text-xs font-montserrat-semibold">
                        Load More ({total - displayed.length} left)
                      </Text>
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`).then(r => r.json()),
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_approved_products`).then(r => r.json()),
    ])
      .then(([cats, products]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setAllProducts(Array.isArray(products) ? products : []);
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
        <View className="bg-purple-950 rounded-full px-2 py-0.5 ml-1">
          <Text className="text-white text-xs">{categories.length}</Text>
        </View>
      </View>

      {categories.map((item, index) => (
        <CategorySection
          key={item._id ?? index}
          categoryName={item.category}
          index={index}
          allProducts={allProducts}
        />
      ))}
    </ScrollView>
  );
};

export default Categories;