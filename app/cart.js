import { View, Text, Image, ScrollView, Alert } from 'react-native';
import React from 'react';
import useCart from '../context/CartContext';
import { TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import SuccessTransaction from '../components/SuccessTransaction';

const Cart = () => {
  const { products, total, removeFromCart } = useCart();

  const handleRemoveFromCart = (product) =>{
    removeFromCart(product)
}
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="p-4">
        { products.length < 1 && 
        <View className="flex-row justify-center items-center gap-3 mt-52">
          <Text className="text-xl font-montserrat-regular">Your </Text>
          <Entypo name="shopping-cart" size={22} color="black" />
          <Text className="text-xl font-montserrat-regular"> is empty</Text>
        </View> }
        { products.length > 0 && products.map((item, index) => (
          <View key={index} className="flex-row bg-white gap-5 mb-2 mx-2 rounded-3xl p-2 py-5 justify-between mt-3">
            <View className="flex-row w-3/4 gap-10">
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                style={{ width: 120, height: 75 }}
                resizeMode="contain"
              />
              <View>
                <Text className="text-lg font-montserrat-semibold">{item.productName}</Text>
                <Text className="mt-1 font-montserrat-light">{item.quantity} Unit(s)</Text>
                <Text className="mt-2 font-montserrat-regular">Ksh. {item.price} each</Text>
                <Text className="mt-2 font-montserrat-semibold-italic">Total : Ksh. {Number(item.price) * Number(item.quantity)}</Text>
              </View>
            </View>
            <TouchableOpacity className="flex-row items-center mr-5" onPress={()=>{
              handleRemoveFromCart(item);
            }}>
              <Text className="text-xl">X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      { products.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: 'white',
          paddingVertical: 10,
          borderTopWidth: 1,
          borderColor: '#ccc',
          paddingHorizontal: 20
        }}>
          <View className="flex-row justify-between mb-5">
            <Text className="font-montserrat-regular">Total</Text>
            <Text className="font-montserrat-bold">Ksh. {total}</Text>
          </View>
          <TouchableOpacity className="bg-purple-900 rounded-2xl p-4 py-3 w-3/4 mx-auto" onPress={()=>{
            router.push("/checkout");
          }}>
            <Text className="text-white text-lg text-center">Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Cart;
