import { View, Text, Image, TouchableOpacity, Share, ScrollView, Dimensions } from 'react-native';
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

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleShare = async () => {
    try {
      const url = `https://rupleart.com/preview/${item._id}`;
      const message = `Check out this amazing artwork: ${item.productName} for Ksh. ${item.price.toLocaleString()}!\n${url}`;

      await Share.share({
        message,
        url,
        title: item.productName,
      });
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
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevImage = () => {
    if (activeIndex > 0) {
      scrollRef.current.scrollTo({ x: (activeIndex - 1) * width, animated: true });
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Image Slider */}
        <View className="w-full h-[270px] relative">
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
                style={{ width: width, height: 270 }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>

          {/* Previous & Next Buttons */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={prevImage}
              style={{
                position: 'absolute',
                top: '40%',
                left: 10,
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: 8,
                borderRadius: 20,
              }}
            >
              <AntDesign name="left" size={20} color="white" />
            </TouchableOpacity>
          )}

          {activeIndex < item.image.length - 1 && (
            <TouchableOpacity
              onPress={nextImage}
              style={{
                position: 'absolute',
                top: '40%',
                right: 10,
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: 8,
                borderRadius: 20,
              }}
            >
              <AntDesign name="right" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Dots Indicator */}
          <View className="absolute bottom-2 left-0 right-0 flex-row justify-center">
            {item.image.map((_, i) => (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: i === activeIndex ? '#6b21a8' : '#d1d5db', // purple-900 and gray-300
                }}
              />
            ))}
          </View>
        </View>

        {/* Product Details */}
        <View className="flex-1 bg-white p-5 shadow-lg">
          <View className="flex-row justify-between mr-5 mt-2">
            <View>
              <View className="flex-row gap-1">
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="staro" size={12} color="black" />
              </View>
            </View>
            <View>
              <TouchableOpacity onPress={handleShare}>
                <AntDesign name="sharealt" size={20} color="#ff9933" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-2xl font-semibold text-gray-800">{item.productName}</Text>
              <Text className="text-base font-montserrat text-purple-900">{item.type}</Text>
            </View>
            <Text className="text-xl font-bold text-purple-900">Ksh. {item.price.toLocaleString()}</Text>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View className="w-3/4">
              <Text className="text-gray-700 leading-6 text-lg mb-2 pr-2">{item.description}</Text>
              <Text className="text-gray-600 leading-6 text-base mb-2">
                <Text className="text-purple-900">Size: </Text>
                {item.size.includes('cm') ? item.size : `${item.size} cm`}
              </Text>
            </View>
            <View className="flex-0 justify-end">
              <Text className="text-gray-600 mb-2 font-bold text-center">Set Quantity</Text>
              <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={decreaseQuantity} className="bg-gray-200 px-5 py-2 rounded-lg">
                  <Text className="text-sm font-semibold text-gray-800">-</Text>
                </TouchableOpacity>
                <Text className="text-sm mx-1">{quantity}</Text>
                <TouchableOpacity onPress={increaseQuantity} className="bg-gray-200 px-5 py-2 rounded-lg">
                  <Text className="text-sm font-semibold text-gray-800">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="bg-purple-900 p-2 rounded-full w-3/4 mx-auto shadow-sm"
            onPress={() => addToCart({ ...item, quantity: Number(quantity) })}
          >
            <Text className="text-white text-center text-lg font-semibold">Add To Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Related Products */}
        <View className="mt-2">
          <Text className="px-5 text-lg font-montserrat-bold">Related Products</Text>
        </View>
        <RelatedProducts category={item.type} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Preview;
