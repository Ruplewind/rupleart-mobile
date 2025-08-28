import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
  ScrollView,
  Dimensions
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCart from '../../context/CartContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import RelatedProducts from '../../components/RelatedProducts';

const { width } = Dimensions.get('window');

const Preview = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleShare = async () => {
    try {
      const url = `https://rupleart.com/preview/${item._id}`;
      const message = `Check out this amazing artwork: ${item.productName} for Ksh. ${item.price.toLocaleString()}!\n${url}`;

      await Share.share({ message, url, title: item.productName });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slideIndex);
  };

  const nextImage = () => {
    if (activeIndex < item.image.length - 1) {
      scrollRef.current.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    }
  };

  const prevImage = () => {
    if (activeIndex > 0) {
      scrollRef.current.scrollTo({ x: (activeIndex - 1) * width, animated: true });
    }
  };

  return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="w-full h-[320px] bg-white shadow-md relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollRef}
          >
            {item.image.map((img, index) => (
              <Image
                key={index}
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${img}` }}
                style={{ width, height: 320 }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>

          {/* Navigation Arrows */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={prevImage}
              className="absolute top-[45%] left-3 bg-black/30 p-3 rounded-full"
            >
              <AntDesign name="left" size={20} color="white" />
            </TouchableOpacity>
          )}
          {activeIndex < item.image.length - 1 && (
            <TouchableOpacity
              onPress={nextImage}
              className="absolute top-[45%] right-3 bg-black/30 p-3 rounded-full"
            >
              <AntDesign name="right" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Dots Indicator */}
          <View className="absolute bottom-3 w-full flex-row justify-center">
            {item.image.map((_, i) => (
              <View
                key={i}
                className={`w-2.5 h-2.5 rounded-full mx-1 ${
                  i === activeIndex ? 'bg-purple-900' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View className="p-5 bg-white rounded-t-3xl -mt-4 shadow-lg">
          {/* Rating & Share */}
          <View className="flex-row justify-between mb-3">
            <View className="flex-row gap-1">
              {[1, 2, 3, 4].map((star) => (
                <AntDesign key={star} name="star" size={14} color="#FFD700" />
              ))}
              <AntDesign name="staro" size={14} color="#9CA3AF" />
            </View>
            <TouchableOpacity onPress={handleShare}>
              <AntDesign name="sharealt" size={22} color="#ff9933" />
            </TouchableOpacity>
          </View>

          {/* Name & Price */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="w-3/5">
              <Text className="text-2xl font-bold text-gray-800">{item.productName}</Text>
              <Text className="text-purple-700 text-sm mt-1">{item.type}</Text>
            </View>
            <Text className="text-xl font-extrabold text-purple-900">
              Ksh. {item.price.toLocaleString()}
            </Text>
          </View>

          {/* Description & Size */}
          <Text className="text-gray-700 leading-6 text-base mb-3">{item.description}</Text>
          <Text className="text-gray-600 mb-5">
            <Text className="text-purple-900 font-semibold">Size: </Text>
            {item.size.includes('cm') ? item.size : `${item.size} cm`}
          </Text>

          {/* Quantity Selector */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-gray-800 font-semibold">Quantity</Text>
            <View className="flex-row items-center bg-gray-100 rounded-full px-2">
              <TouchableOpacity
                onPress={decreaseQuantity}
                className="bg-gray-200 px-4 py-2 rounded-full"
              >
                <Text className="text-lg font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-lg mx-4">{quantity}</Text>
              <TouchableOpacity
                onPress={increaseQuantity}
                className="bg-gray-200 px-4 py-2 rounded-full"
              >
                <Text className="text-lg font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="bg-purple-900 py-4 rounded-full shadow-md"
            onPress={() => addToCart({ ...item, quantity })}
          >
            <Text className="text-white text-center text-lg font-semibold">Add To Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        <View className="mt-6 px-5">
          <Text className="text-lg font-bold text-gray-800 mb-2">Related Products</Text>
          <RelatedProducts category={item.type} />
        </View>
      </ScrollView>
  );
};

export default Preview;
