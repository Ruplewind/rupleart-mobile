import { View, Text, Image, TouchableOpacity, Share, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCart from '../../context/CartContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import RelatedProducts from '../../components/RelatedProducts';

const Preview = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
          className="w-full h-[270px]"
          resizeMode='contain'
        />

        <View className="flex-1 bg-white p-5 shadow-lg">

        <View className='flex-row justify-between mr-5 mt-2'>
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
          <TouchableOpacity  
            onPress={handleShare}
          >
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
            <View className='w-3/4'>
              <Text className="text-gray-700 leading-6 text-lg mb-2 pr-2">{item.description}</Text>
              <Text className="text-gray-600 leading-6 text-base mb-2">
                <Text className='text-purple-900'>Size: </Text>{item.size.includes("cm") ? item.size : `${item.size} cm`}
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

          {/* Share Button */}
          {/* <TouchableOpacity 
            className="bg-gray-400 p-2 rounded-full w-3/4 mx-auto shadow-sm mt-4 flex-row items-center justify-center" 
            onPress={handleShare}
          >
            <AntDesign name="sharealt" size={20} color="white" />
            <Text className="text-white text-center text-lg font-semibold ml-2">Share</Text>
          </TouchableOpacity> */}
        </View>
        <View className='mt-2'>
          <Text className='px-5 text-lg font-montserrat-bold'>Related Products</Text>
        </View>
        <RelatedProducts category={item.type} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Preview;
