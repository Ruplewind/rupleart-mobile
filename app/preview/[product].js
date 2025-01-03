import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LatestArtworks from '../../components/LatestArtworks';
import RelatedProducts from '../../components/RelatedProducts';
import AntDesign from '@expo/vector-icons/AntDesign';
import useCart from '../../context/CartContext';

const Preview = () => {
  const { product, allProducts } = useLocalSearchParams();
  const item = JSON.parse(product);
  const allNewProducts = JSON.parse(allProducts);


  const category = item.type;

    const filteredData = allNewProducts.reverse().filter((item)=>{
                    
        if(category === '' || category === null){
            return item;
        }else if(
            item.type.toLowerCase().includes(category.toLowerCase())
        ){
            return item;
        }
    })

  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const { addToCart } = useCart();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Image
        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
        className="w-full h-[300px]"
      />

      <View className="flex-1 -mt-10 bg-white rounded-t-3xl p-5 shadow-lg">
        <View className="flex-row items-center justify-between mb-3">
          <View>
              <Text className="text-2xl font-semibold text-gray-800">{item.productName}</Text>
              <View className="flex-row gap-1">
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="star" size={12} color="#FFD700" />
                <AntDesign name="staro" size={12} color="black" />
              </View>
          </View>
          
          <Text className="text-xl font-bold text-purple-900">Ksh. {item.price.toLocaleString()}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 leading-6 text-base mb-2 w-3/4">{item.description}</Text>
          <View className="flex-0 justify-end">
            <Text className="text-gray-600 mb-2 font-bold text-center">Set Quantity</Text>
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={decreaseQuantity}
                className="bg-gray-200 px-5 py-2 rounded-lg"
              >
                <Text className="text-sm font-semibold text-gray-800">-</Text>
              </TouchableOpacity>
              
              <Text className="text-sm mx-2">{quantity}</Text>
              
              <TouchableOpacity
                onPress={increaseQuantity}
                className="bg-gray-200 px-5 py-2 rounded-lg"
              >
                <Text className="text-sm font-semibold text-gray-800">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity 
        className="bg-purple-900 p-2 rounded-full w-3/4 mx-auto shadow-sm" 
        onPress={()=>{
          addToCart({...item, quantity: Number(quantity)})
        }}
        >
          <Text className="text-white text-center text-lg font-semibold">Add To Cart</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white p-2">
        <Text className="font-montserrat-bold text-lg ">Related Products</Text>
        <RelatedProducts products={filteredData} />
      </View>
    </SafeAreaView>
  );
};

export default Preview;
