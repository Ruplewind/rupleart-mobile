import { View, Text, Touchable, ScrollView, Image, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { useAuthContext } from '../../context/AuthProvider';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Myads = () => {
  const [myads, setMyads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthContext();

    useEffect(()=>{
      setLoading(true);
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/my_products`,{
        headers: {
          'Authorization':`Bearer ${token}`
        }
      })
      .then( data => {
          if(data.ok){
              return data.json();

          }else if(data.status === 401){
              router.push("/login")
          }
      })
      .then( data => {
        setMyads(data)
        setLoading(false);
      })
      .catch( err => { 
          console.log(err);
          setError(true);
       })
  },[]);


  const deleteAlert = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: () => handleDeleteItem(id)},
    ]);
  }

    const handleDeleteItem = ( id ) => {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/del_product/${id}`,{
          method: 'DELETE',
          headers: {
            'Authorization':`Bearer ${token}`
          }
      })
      .then((response)=>{
          if(response.ok){
              Alert.alert('Success');
              setMyads(prevMyads => prevMyads.filter(item => item._id !== id));
          }else{
              Alert.alert('Failed to delete')
          }
      })
      .catch((err)=>{
          Alert.alert('Server Error')
      })
  }
  return (
    <View className="p-5">
      <View className="flex-row justify-end">
        <TouchableOpacity className="bg-purple-950 w-1/3 p-2 rounded-lg shadow-lg">
          <Text className="text-white text-center">+ Post AD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="">
        { myads.length < 1 && 
        <View className="flex-row justify-center items-center gap-3 mt-52">
          <Text className="text-xl font-montserrat-regular">Your Have Not Posted Any Ads</Text>
        </View> }
        
          {loading && <ActivityIndicator color="black" size={100} style={{ marginTop: 28 }} />}
      
        { !loading && myads.length > 0 && myads.map((item, index) => (
          <View key={index} className="flex-row w-full gap-5 mb-2 mx-2 rounded-3xl p-2 py-5 mt-3 bg-white">
            <View className="flex-1 w-3/10">
              <Image
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                className="w-full"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1 w-5/10">
              <Text className="text-lg font-montserrat-semibold">{item.productName}</Text>
              <Text className="mt-1 font-montserrat-light">Size: {item.size}</Text>
              <Text className="mt-2 font-montserrat-regular">Ksh. {item.price}</Text>
              <View className='text-center p-2'>
              {
                item.approvalStatus == 0 ? 
                    <View className='bg-gray-300 text-xs rounded-2xl p-1 w-full'>
                      <Text className="text-center text-xs">Pending approval</Text>
                    </View>
                  : item.approvalStatus == 1 ? 
                  <View className='bg-green-500 text-xs rounded-2xl p-1 w-full'>
                    <Text className="text-white text-center text-xs">Approved</Text>
                  </View>
                  :
                  <View>
                    <View className='bg-red-500 text-xs rounded-2xl p-1 w-'>
                      <Text className="text-white text-center text-xs">Rejected</Text>
                    </View>
                    { item.disapproval_reason && 
                      <View className='mt-2 text-xs capitalize'>
                          <Text className="text-xs"><Text className="font-montserrat-bold">Reason: </Text> {item.disapproval_reason} </Text> 
                      </View> 
                    }
                  </View>
              }
              </View>
            </View>

            <View className="flex-1 w-2/10 flex flex-col items-center justify-evenly">
              <TouchableOpacity className="">
                <Entypo name="edit" size={18} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity className="" onPress={() => deleteAlert(item._id)}>
                <MaterialIcons name="delete" size={21} color="red" />
              </TouchableOpacity>
            </View> 
          </View>
        ))}
      </ScrollView>

    </View>
  )
}

export default Myads