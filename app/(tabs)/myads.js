import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl, Linking, Switch } from 'react-native';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useAuthContext } from '../../context/AuthProvider';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';
import Foundation from '@expo/vector-icons/Foundation';

const Myads = () => {
  const [myads, setMyads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuthContext();
  const [error, setError] = useState(false);

  const fetchAds = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/my_products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((data) => {
        if (data.ok) {
          return data.json();
        } else if (data.status === 401) {
          router.push('/login');
        }
      })
      .then((data) => {
        setMyads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    fetchAds();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds();
    setRefreshing(false);
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
          setMyads((prevMyads) => prevMyads.filter((item) => item._id !== id));
        } else {
          Alert.alert('Failed to delete');
        }
      })
      .catch((err) => {
        Alert.alert('Server Error');
      });
  };

  if (!token) {
    return (
      <View className="p-5 flex-1 justify-center items-center">
        <View className="items-center mb-8">
          <AntDesign name="user" size={64} color="#6B7280" />
          <Text className="text-lg font-montserrat-semibold mt-4 mb-2">Login Required</Text>
          <Text className="text-sm font-montserrat-light text-gray-600 text-center mb-6">
            Please login to view and manage your ads
          </Text>
        </View>
        
        <TouchableOpacity
          className="bg-purple-950 w-2/3 p-3 rounded-lg shadow-lg mb-4"
          onPress={() => {
            router.push({
                pathname: "/login",
                params: { referer: "/myads" }
            });
          }}
        >
          <Text className="text-white text-center font-montserrat-semibold">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-800 w-2/3 p-2 rounded-lg shadow-lg flex-row items-center justify-center"
          onPress={() => {
            Linking.openURL('https://rupleart.com/terms');
          }}
        >
          {/* <AntDesign name="earth" size={18} color="white" style={{ marginRight: 6 }} /> */}
          <Foundation name="web" size={18} color="white" style={{ marginRight: 6 }}/>
          <Text className="text-white text-center">Terms</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAvailabilityToggle = (id, value) => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/change_availability/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value })
    })
      .then((response) => {
        if (response.ok) {
          Alert.alert("Success", "Availability Updated");
          setMyads((prev) =>
            prev.map((ad) =>
              ad._id === id ? { ...ad, availability: value } : ad
            )
          );
        } else {
          Alert.alert("Error", "Failed to update availability");
        }
      })
      .catch(() => {
        Alert.alert("Server Error", "Something went wrong");
      });
  };

  return (
    <View className="p-5">
      <View className="flex-row justify-between">
        <TouchableOpacity
            className="bg-gray-800 w-1/3 p-2 rounded-lg shadow-lg flex-row items-center justify-center"
            onPress={() => {
                Linking.openURL('https://rupleart.com/terms');
            }}
        >
            <Foundation name="web" size={18} color="white" style={{ marginRight: 6 }}/>
            <Text className="text-white text-center">Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        className="bg-purple-950 w-1/3 p-2 rounded-lg shadow-lg"
        onPress={()=>{
          router.push({
            pathname:'myads/postad'
          })
        }}
        >
          <Text className="text-white text-center">+ Post AD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {
          !loading && error && <Text className="mt-10 text-center font-montserrat-light text-sm">Error Fetching Data. Relaunch app.</Text>
        }

        { !error && !loading && myads.length < 1 && (
          <View className="flex-row justify-center items-center gap-3 mt-52">
            <Text className="text-sm font-montserrat-regular">You Have Not Posted Any Ads</Text>
          </View>
        )}

        { loading && <ActivityIndicator color="black" size={20} style={{ marginTop: 28 }} />}

        {
        !error && !loading && myads.length > 0 &&
          myads.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row w-full gap-5 mb-2 mx-2 rounded-3xl p-2 py-5 mt-3 bg-white"
              onPress={() => {
                  router.push({
                      pathname: "myads/[ad]", 
                      params: { product: JSON.stringify(item) }
                  });
              }}
            >
              <View className="flex-1 w-2/10">
                <Image
                  key={item._id}
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
                  style={{ width: 75, height: 100, marginLeft: 10 }}
                  className="w-full"
                  contentFit="contain"
                />
              </View>
              <View className="flex-1 w-6/10">
                <Text className="text-sm text-blue-600">#{item.productId}</Text>
                <Text className="text-lg font-montserrat-semibold">{item.productName}</Text>
                <Text className="mt-1 font-montserrat-light text-sm">Size: {item.size}</Text>
                <Text className="mt-2 font-montserrat-regular text-sm">Ksh. {item.price.toLocaleString()}</Text>
                <View className="mt-3 flex-row items-center">
                <Text className="mr-2 text-sm font-montserrat-regular">
                  In Stock?:
                </Text>
                <View className="scale-75">
                  <Switch
                    value={item.availability}
                    onValueChange={(val) => {
                      handleAvailabilityToggle(item._id, val);
                    }}
                    thumbColor={item.availability ? "#4CAF50" : "#f4f3f4"}
                    trackColor={{ true: "#A5D6A7", false: "#D1D5DB" }}
                  />
                </View>
              </View>
                <View className="text-center mt-4">
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
              </View>

              <View className="flex-1 w-1/10 flex flex-col items-center justify-evenly">
                <TouchableOpacity 
                className=""
                onPress={()=>{
                  router.push({
                    pathname:'myads/update/[updatead]',
                    params: { product: JSON.stringify(item) } 
                  })
                }}
                >
                  <Entypo name="edit" size={18} color="#581C87" />
                </TouchableOpacity>
                <TouchableOpacity className="" onPress={() => deleteAlert(item._id)}>
                  <MaterialIcons name="delete" size={21} color="red" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

export default Myads;