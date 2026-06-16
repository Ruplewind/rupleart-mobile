import {
  View,
  Text,
  TouchableOpacity,
  Share,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import useCart from '../../context/CartContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import RelatedProducts from '../../components/RelatedProducts';

const { width } = Dimensions.get('window');

// ── Dot Indicators ────────────────────────────────────────────────────────────
const Dots = ({ total, active }) => (
  <View className="flex-row justify-center items-center gap-1.5 mt-3">
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          width: i === active ? 18 : 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: i === active ? '#581C87' : '#D1D5DB',
          transition: 'width 0.2s',
        }}
      />
    ))}
  </View>
);

// ── Star Rating ───────────────────────────────────────────────────────────────
const Stars = () => (
  <View className="flex-row gap-0.5">
    {[1, 2, 3, 4].map(s => (
      <AntDesign key={s} name="star" size={13} color="#F59E0B" />
    ))}
    <AntDesign name="staro" size={13} color="#D1D5DB" />
  </View>
);

// ── Info Chip ─────────────────────────────────────────────────────────────────
const Chip = ({ label, value, icon }) => (
  <View className="bg-purple-50 rounded-2xl px-4 py-3 flex-1">
    <View className="flex-row items-center gap-1 mb-1">
      <MaterialIcons name={icon} size={12} color="#7C3AED" />
      <Text className="text-purple-400 text-xs font-montserrat-light uppercase tracking-wide">{label}</Text>
    </View>
    <Text className="text-gray-800 text-sm font-montserrat-semibold" numberOfLines={2}>{value}</Text>
  </View>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Preview = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const handleShare = async () => {
    try {
      const url = `https://rupleart.com/preview/${item._id}`;
      await Share.share({
        message: `Check out this artwork: ${item.productName} — Ksh ${item.price.toLocaleString()}\n${url}`,
        url,
        title: item.productName,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleScroll = e => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const scrollTo = index => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50">

      {/* ── Carousel ── */}
      <View className="bg-white" style={{ paddingBottom: 12 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {item.image.map((img, i) => (
            <Image
              key={i}
              source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${img}` }}
              style={{ width, height: 320 }}
              contentFit="contain"
            />
          ))}
        </ScrollView>

        {/* Arrows */}
        {activeIndex > 0 && (
          <TouchableOpacity
            onPress={() => scrollTo(activeIndex - 1)}
            className="absolute top-36 left-3 bg-purple-950 rounded-full p-2.5"
            style={{ opacity: 0.85 }}
          >
            <AntDesign name="left" size={16} color="white" />
          </TouchableOpacity>
        )}
        {activeIndex < item.image.length - 1 && (
          <TouchableOpacity
            onPress={() => scrollTo(activeIndex + 1)}
            className="absolute top-36 right-3 bg-purple-950 rounded-full p-2.5"
            style={{ opacity: 0.85 }}
          >
            <AntDesign name="right" size={16} color="white" />
          </TouchableOpacity>
        )}

        {/* Image counter pill */}
        {item.image.length > 1 && (
          <View className="absolute top-3 right-3 bg-black/40 rounded-full px-2.5 py-1">
            <Text className="text-white text-xs font-montserrat-semibold">
              {activeIndex + 1}/{item.image.length}
            </Text>
          </View>
        )}

        {/* Dots */}
        {item.image.length > 1 && <Dots total={item.image.length} active={activeIndex} />}
      </View>

      {/* ── Product Info Card ── */}
      <View className="bg-white rounded-t-3xl -mt-3 px-5 pt-5 pb-6 shadow-sm">

        {/* Top row: stars + share */}
        <View className="flex-row justify-between items-center mb-4">
          <Stars />
          <TouchableOpacity
            onPress={handleShare}
            className="w-9 h-9 rounded-full bg-purple-50 items-center justify-center"
          >
            <Entypo name="share" size={16} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* ID + Name + Price */}
        <Text className="text-purple-400 text-xs font-montserrat-light mb-1">#{item.productId}</Text>
        <Text className="text-gray-800 text-2xl font-montserrat-black leading-tight mb-1">
          {item.productName}
        </Text>
        <Text className="text-purple-700 font-montserrat-semibold text-xs mb-4 uppercase tracking-wide">
          {item.type}
        </Text>

        {/* Price Banner */}
        <View className="bg-purple-950 rounded-2xl px-5 py-3 flex-row justify-between items-center mb-5">
          <Text className="text-purple-300 text-xs font-montserrat-light">Price</Text>
          <Text className="text-white text-2xl font-montserrat-black">
            Ksh {item.price.toLocaleString()}
          </Text>
        </View>

        {/* Info chips */}
        <View className="flex-row gap-2 mb-5">
          <Chip label="Size" value={item.size} icon="straighten" />
          <Chip label="Category" value={item.type} icon="category" />
        </View>

        {/* Description */}
        <Text className="text-gray-400 text-xs font-montserrat-light uppercase tracking-wide mb-2">Description</Text>
        <Text className="text-gray-700 text-sm leading-6 font-montserrat-regular mb-6">
          {item.description}
        </Text>

        {/* Divider */}
        <View className="h-px bg-gray-100 mb-5" />

        {/* Quantity */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-gray-700 font-montserrat-semibold text-sm">Quantity</Text>
          <View className="flex-row items-center bg-purple-50 rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={decreaseQuantity}
              className="w-10 h-10 items-center justify-center"
              style={{ backgroundColor: quantity === 1 ? '#F3F4F6' : '#EDE9FE' }}
            >
              <Text className="text-lg font-bold text-purple-900">−</Text>
            </TouchableOpacity>
            <Text className="text-gray-800 font-montserrat-semibold text-base w-10 text-center">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={increaseQuantity}
              className="w-10 h-10 items-center justify-center bg-purple-200"
            >
              <Text className="text-lg font-bold text-purple-900">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          className="bg-purple-950 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
          activeOpacity={0.88}
          onPress={() => addToCart({ ...item, quantity })}
        >
          <MaterialIcons name="shopping-cart" size={18} color="white" />
          <Text className="text-white text-base font-montserrat-semibold">
            Add to Cart · {quantity > 1 ? `×${quantity}` : ''}  Ksh {(item.price * quantity).toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Related Products ── */}
      <View className="mt-4 pb-10">
        <View className="flex-row items-center gap-2 px-5 mb-3">
          <View className="w-7 h-7 rounded-full bg-purple-100 items-center justify-center">
            <MaterialIcons name="storefront" size={14} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-sm">Related Products</Text>
          <View className="flex-1 h-px bg-gray-100" />
        </View>
        <View className="px-5">
          <RelatedProducts category={item.type} />
        </View>
      </View>

    </ScrollView>
  );
};

export default Preview;