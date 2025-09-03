import { View, Text, Image, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign } from '@expo/vector-icons';

const Orders = () => {
    const { token, logout } = useAuthContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOrders = () => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetch(`${process.env.EXPO_PUBLIC_API_URL}/GetMyOrders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((data) => {
                if (data.ok) {
                    return data.json();
                } else if (data.status === 401) {
                    logout();
                    router.push('/login');
                }
            })
            .then((result) => {
                Promise.all(
                    result.map((order) =>
                        fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_location/${order.deliveryLocation}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        })
                            .then((response) => response.json())
                            .then((location) => ({ ...order, deliveryLocation: location.town }))
                    )
                ).then((ordersWithData) => {
                    setOrders(ordersWithData);
                    setLoading(false);
                });
            })
            .catch((err) => {
                setError(true);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    // If no token, show login button
    if (!token) {
        return (
            <View style={{ flex: 1 }} className="justify-center items-center p-5">
                <View className="items-center mb-8">
                    <MaterialIcons name="shopping-cart" size={64} color="#6B7280" />
                    <Text className="text-lg font-montserrat-semibold mt-4 mb-2">Login Required</Text>
                    <Text className="text-sm font-montserrat-light text-gray-600 text-center mb-6">
                        Please login to view your orders and purchase history
                    </Text>
                </View>
                
                <TouchableOpacity
                    className="bg-purple-950 w-2/3 p-3 rounded-lg shadow-lg mb-4"
                    onPress={() => {
                        router.push({
                            pathname: "/login", 
                            params: { referer: "/orders" }
                        });
                    }}
                >
                    <Text className="text-white text-center font-montserrat-semibold">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-gray-800 px-4 py-3 w-2/3 rounded-lg shadow-lg"
                    onPress={() => {
                        router.push('/home');
                    }}
                >
                    <Text className="text-white font-montserrat-semibold text-center">Shop Now!</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="p-4">
                {!loading && orders.length < 1 && (
                    <View className="flex-col justify-center items-center gap-3 mt-52">
                        <Text className="text-sm font-montserrat-regular">You Have Not Placed Any Order</Text>
                        <TouchableOpacity
                            className="bg-purple-950 px-2 py-3 w-1/2 mx-auto rounded-3xl shadow-md"
                            onPress={() => {
                                router.push('/');
                            }}
                        >
                            <Text className="text-white font-montserrat-semibold text-center text-sm">Shop Now!</Text>
                        </TouchableOpacity>
                    </View>
                )} 
                {loading && <ActivityIndicator color="black" size={80} style={{ marginTop: 28 }} />}
                {!loading && orders.length > 0 && orders.reverse().map((order, index) => (
                    <TouchableOpacity
                        key={index}
                        className="bg-white mb-4 mt-2 mx-2 rounded-xl p-4 shadow-lg"
                    >
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="font-montserrat-semibold text-sm">KSH. {order.total_price + order.delivery_cost}</Text>

                            <View className="flex-row justify-end gap-1 items-center mb-2">
                                    <MaterialIcons name="date-range" size={18} color="gray" />
                                    <Text className="font-montserrat text-sm">{order.order_date}</Text>
                            </View>
                        </View>
                        
                        
                        {order.items.map((item) => (
                            <View key={item._id} className="flex-row items-center mb-2">
                                <Text className="text-sm font-montserrat-semibold w-1/2">{item.productName}</Text>
                                <Text className="text-sm font-montserrat-light w-1/4">{item.quantity} Unit(s)</Text>
                                <Text className="text-sm font-montserrat-regular w-1/4">Ksh. {item.price} each</Text>
                            </View>
                        ))}
                        <View className="flex-row mb-2 mt-2 items-center gap-2">
                            <MaterialIcons name="delivery-dining" size={24} color="black" />
                            <Text className="font-montserrat-regular">
                                {order.deliveryLocation} @ Ksh. {order.delivery_cost}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-2 justify-between">
                            <View className="text-center">
                                {order.completion_status === 'pending' ? (
                                    <View  className="px-2 bg-gray-300 text-xs rounded-lg p-1 w-full lg:w-3/4 mx-auto">
                                        <Text className="text-black text-xs">Pending Payment</Text>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: '#66BB6A' }} className="flex-row gap-2 items-center px-2 rounded-lg text-xs p-1 w-full lg:w-3/4 mx-auto">
                                        <MaterialCommunityIcons name="cash-multiple" size={12} color="black" />
                                    <Text className="text-white text-xs">Payment Confirmed</Text>
                                </View>
                                )}
                            </View>
                            <View className="text-center ml-5">
                                {order.delivery_status === 'pending' ? (
                                    <View  className="flex-row items-center gap-2 px-2 bg-gray-300 text-xs rounded-lg p-1 w-full lg:w-3/4 mx-auto">
                                        <MaterialIcons name="pending" size={12} color="black" />
                                        <Text className="text-black text-xs">Pending Delivery</Text>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: '#4A148C' }} className="flex-row items-center gap-2 px-2 rounded-lg text-xs p-1 w-full lg:w-3/4 mx-auto">
                                        <MaterialCommunityIcons name="truck-delivery" size={12} color="white" />
                                        <Text className="text-white text-xs">Delivered</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default Orders;