import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import React from 'react';
import useCart from '../context/CartContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const CartItem = ({ item, index, onRemove, onAdd, onMinus }) => {
  const rowBg = index % 2 === 0 ? '#F5F3FF' : '#EDE9FE'; // violet-50 / violet-100 alternating

  return (
    <View
      className="rounded-3xl mb-3 overflow-hidden"
      style={{ backgroundColor: '#fff', shadowColor: '#6B21A8', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }}
    >
      <View className="flex-row">
        {/* Image panel */}
        <View style={{ backgroundColor: rowBg, width: 90 }} className="items-center justify-center p-3">
          <Image
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
            style={{ width: 70, height: 80 }}
            contentFit="contain"
          />
        </View>

        {/* Details */}
        <View className="flex-1 px-3 py-3">
          <Text className="text-purple-400 text-xs font-montserrat-light mb-0.5">#{item.productId}</Text>
          <Text className="text-gray-800 font-montserrat-semibold text-sm leading-5 mb-1" numberOfLines={2}>
            {item.productName}
          </Text>
          <Text className="text-gray-400 text-xs font-montserrat-light">
            Ksh {item.price.toLocaleString()} each
          </Text>

          {/* Quantity + subtotal row */}
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center bg-gray-50 rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={() => onMinus(item._id)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 items-center justify-center"
                style={{ backgroundColor: item.quantity <= 1 ? '#F3F4F6' : '#EDE9FE' }}
              >
                <Text className="text-purple-900 font-bold text-base">−</Text>
              </TouchableOpacity>
              <Text className="text-gray-800 font-montserrat-semibold text-sm w-8 text-center">
                {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => onAdd(item._id)}
                className="w-8 h-8 items-center justify-center bg-purple-200"
              >
                <Text className="text-purple-900 font-bold text-base">+</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-purple-900 font-montserrat-black text-sm">
              Ksh {(Number(item.price) * Number(item.quantity)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Remove */}
        <TouchableOpacity
          onPress={() => onRemove(item)}
          className="w-9 items-center justify-center border-l border-gray-50"
        >
          <View className="w-7 h-7 rounded-full bg-red-50 items-center justify-center">
            <AntDesign name="close" size={13} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Cart = () => {
  const { products, total, removeFromCart, addQuantity, minusQuantity } = useCart();
  const { token } = useAuthContext();

  const handleCheckout = () => {
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push({ pathname: '/login', params: { referer: '/cart' } }) },
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  // ── Empty state ──
  if (products.length === 0) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-purple-50 items-center justify-center mb-5">
            <MaterialIcons name="shopping-cart" size={42} color="#7C3AED" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-lg mb-2">Your cart is empty</Text>
          <Text className="text-gray-400 font-montserrat-light text-sm text-center mb-8">
            Add some artwork to get started
          </Text>
          <TouchableOpacity
            className="bg-purple-950 px-10 py-3.5 rounded-2xl"
            onPress={() => router.push('/')}
          >
            <Text className="text-white font-montserrat-semibold">Browse Shop</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1 }}>

        {/* Page header */}
        <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
          <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
            <MaterialIcons name="shopping-cart" size={16} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-base">My Cart</Text>
          <View className="bg-purple-950 rounded-full px-2 py-0.5 ml-1">
            <Text className="text-white text-xs">{products.length}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 160 }}>
          {products.map((item, index) => (
            <CartItem
              key={item._id ?? index}
              item={item}
              index={index}
              onRemove={removeFromCart}
              onAdd={addQuantity}
              onMinus={minusQuantity}
            />
          ))}
        </ScrollView>

        {/* Checkout footer */}
        <View
          style={{
            position: 'absolute', bottom: 0, width: '100%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderTopWidth: 1, borderColor: '#EDE9FE',
            paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
            shadowColor: '#6B21A8', shadowOpacity: 0.08, shadowRadius: 16, elevation: 8,
          }}
        >
          {/* Item count + total */}
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-400 text-xs font-montserrat-light">
                {products.length} item{products.length !== 1 ? 's' : ''}
              </Text>
              <Text className="text-gray-800 font-montserrat-semibold text-base">Order Total</Text>
            </View>
            <Text className="text-purple-950 font-montserrat-black text-2xl">
              Ksh {total.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-purple-950 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.88}
            onPress={handleCheckout}
          >
            <MaterialIcons name="lock" size={16} color="white" />
            <Text className="text-white text-base font-montserrat-semibold">Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Cart;