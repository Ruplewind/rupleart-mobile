import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Linking, Alert } from 'react-native';
import { useAuthContext } from '../../context/AuthProvider';

const { width } = Dimensions.get('window');

const ad = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const { token } = useAuthContext();


  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slideIndex);
  };

  const nextImage = () => {
    if (activeIndex < item.image.length - 1 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: (activeIndex + 1) * width, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  const prevImage = () => {
    if (activeIndex > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: (activeIndex - 1) * width, animated: true });
      setActiveIndex(activeIndex - 1);
    }
  };

  const deleteAlert = (id) => {
      Alert.alert('Delete', 'Are you sure you want to delete?', [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'OK', onPress: () => handleDeleteItem(id) },
      ]);
    };
  
    const handleDeleteItem = (id) => {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/del_product/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            Alert.alert('Success');
            router.replace('/myads');
          } else {
            Alert.alert('Failed to delete');
          }
        })
        .catch((err) => {
          Alert.alert('Server Error');
        });
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
                contentFit="contain"
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
        {/* <View className="flex-1 bg-white p-5">

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
          </View>

          <View className="text-center mt-2">
            {item.approvalStatus === 0 ? (
                <View className="bg-gray-300 text-xs rounded-2xl p-1 w-full px-1">
                <Text className="text-center text-xs">Pending approval</Text>
                </View>
            ) : item.approvalStatus === 1 ? (
                <View className="bg-green-500 text-xs rounded-2xl p-1 w-full">
                <Text className="text-white text-center text-xs">Approved</Text>
                </View>
            ) : (
                <View>
                <View className="bg-red-500 text-xs rounded-2xl p-1 w-full">
                    <Text className="text-white text-center text-xs">Rejected</Text>
                </View>
                {item.disapproval_reason && (
                    <View className="mt-2 text-xs capitalize">
                    <Text className="text-xs">
                        <Text className="font-montserrat-bold">Reason: </Text>
                        {item.disapproval_reason}
                    </Text>
                    </View>
                )}
                </View>
            )}
            </View>

        </View> */}

        {/* Product Details */}
        <View className="bg-white rounded-2xl shadow-md mx-4 my-6 p-5">

        {/* Product Name & Price */}
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
            <Text className="text-sm text-gray-800 mb-1">#{item.productId}</Text>
            <Text className="text-2xl font-bold text-gray-800 mb-1">{item.productName}</Text>
            <Text className="text-sm font-medium text-purple-700 uppercase tracking-wide">{item.type}</Text>
            </View>
            <Text className="text-2xl font-extrabold text-purple-900">Ksh {item.price.toLocaleString()}</Text>
        </View>

        {/* Divider */}
        <View className="border-b border-gray-200 my-3" />

        {/* Description */}
        <Text className="text-gray-700 text-base leading-6 mb-4">
            {item.description}
        </Text>

        {/* Size */}
        <Text className="text-gray-600 text-sm mb-2">
            <Text className="text-purple-900 font-semibold">Size (small/medium/large/cm): </Text>
            <Text className="">{item.size}</Text>
        </Text>

        {/* Approval Status */}
        <View className="mt-4">
            {item.approvalStatus === 0 ? (
            <View className="bg-gray-300 rounded-full py-1 px-4 self-start">
                <Text className="text-gray-800 text-xs font-semibold">Pending Approval</Text>
            </View>
            ) : item.approvalStatus === 1 ? (
            <View className="bg-green-500 rounded-full py-1 px-4 self-start">
                <Text className="text-white text-xs font-semibold">Approved</Text>
            </View>
            ) : (
            <View>
                <View className="bg-red-500 rounded-full py-1 px-4 self-start">
                <Text className="text-white text-xs font-semibold">Rejected</Text>
                </View>
                {item.disapproval_reason && (
                <View className="mt-2">
                    <Text className="text-xs text-red-700">
                    <Text className="font-bold">Reason: </Text>
                    {item.disapproval_reason}
                    </Text>
                </View>
                )}
            </View>
            )}
        </View>

        {/* Notice for Editing */}
        {/* <View className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mt-6">
            <Text className="text-yellow-700 text-sm text-center">
                To edit this ad, please visit:{" "}
                <Text
                className="text-purple-900 font-semibold underline"
                onPress={() => Linking.openURL('https://rupleart.com/myads')}
                >
                https://rupleart.com/myads
                </Text>
            </Text>
        </View> */}

          {/* Edit Button */}
          <TouchableOpacity
              onPress={() => {
                  router.push({
                      pathname: "myads/update/[updatead]",
                      params: { product: encodeURIComponent(JSON.stringify(item)) }
                  });
              }}
              className="bg-purple-900 rounded-full mt-6 py-3 px-4"
          >
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <AntDesign name="edit" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-center text-lg font-semibold">Edit Ad</Text>
              </View>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
              onPress={() => {
                  deleteAlert(item._id);
              }}
              className="bg-red-600 rounded-full mt-6 py-3 px-4"
          >
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialIcons name="delete" size={22} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-center text-lg font-semibold">Delete Ad</Text>
              </View>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

export default ad;
