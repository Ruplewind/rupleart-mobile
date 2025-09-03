import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import useCart from '../context/CartContext';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthProvider';

const Cart = () => {
  const { products, total, removeFromCart, addQuantity, minusQuantity } = useCart();
  const { token } = useAuthContext();

  const handleCheckout = () => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with checkout',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              router.push({
                  pathname: "/login", 
                  params: { referer: "/cart" }
              });
            } 
          },
        ]
      );
      return;
    }
    
    // If user is logged in, proceed to checkout
    router.push('/checkout');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="p-4">
        {products.length < 1 && (
          <View className="flex-row justify-center items-center gap-3 mt-52">
            <Text className="text-xl font-montserrat-regular">Your </Text>
            <Entypo name="shopping-cart" size={22} color="black" />
            <Text className="text-xl font-montserrat-regular"> is empty</Text>
          </View>
        )}

        {products.length > 0 &&
          products.map((item, index) => (
            <View key={index} className="flex-row bg-white gap-5 mb-2 mx-2 rounded-3xl p-2 py-3 justify-between mt-3">
              <View className="flex-row w-3/4 gap-5">
                <Image
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
                  style={{ width: 75, height: 75 }}
                  contentFit="contain"
                />
                <View>
                  <Text className="text-sm font-montserrat-semibold">{item.productName}</Text>
                  <Text className="mt-1 font-montserrat-light text-sm">Ksh. {item.price.toLocaleString()} each</Text>
                  <Text className="mt-1 font-montserrat-semibold-italic text-sm">
                    Total: Ksh. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </Text>

                  {/* Quantity Controls */}
                  <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                      className="bg-gray-200 rounded-full px-3 py-1"
                      onPress={() => minusQuantity(item._id)}
                      disabled={item.quantity <= 1}
                    >
                      <Text className="text-lg font-bold">-</Text>
                    </TouchableOpacity>

                    <Text className="mx-4 text-lg font-montserrat-bold">{item.quantity}</Text>

                    <TouchableOpacity className="bg-gray-200 rounded-full px-3 py-1" onPress={() => addQuantity(item._id)}>
                      <Text className="text-lg font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Remove Item Button */}
              <TouchableOpacity className="flex-row items-center mr-5" onPress={() => removeFromCart(item)}>
                <Text className="text-xl">X</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>

      {/* Checkout Section */}
      {products.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: '#ccc',
            paddingHorizontal: 20,
          }}
        >
          <View className="flex-row justify-between mb-5">
            <Text className="font-montserrat-regular">Total</Text>
            <Text className="font-montserrat-bold">Ksh. {total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity className="bg-purple-900 rounded-2xl p-2 py-2 w-3/4 mx-auto" onPress={handleCheckout}>
            <Text className="text-white text-lg text-center">Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
};

export default Cart;