import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import useCart from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const SuccessTransaction = () => {

  const { clearState } = useCart();

    useEffect(()=>{
        clearState();
    },[])
  return (
    <View className="p-5 mt-20">
        <View className="flex-row justify-center">
          <Ionicons name="checkmark-circle" size={100} color="green" />
        </View>

        <View>
            <Text className="text-center mt-10 text-xl font-montserrat-bold">
                Your Order Has Been Placed Succesfully. 
            </Text>
            <Text className="text-center mt-5 text-base font-montserrat-semibold">
                You will be contacted by a Rupleart agent within the next few hours to make arrangements on delivery.
            </Text>
            <Text className="flex justify-center text-center mt-5 text-lg">
                Thank You!
            </Text>
            <Text className="flex justify-center text-center px-10 ml-5 mb-5 text-lg" style={{fontSize:'3em'}}>&#x1F38A;</Text>

            <TouchableOpacity 
            className="w-1/2 px-2 py-3 rounded-2xl mx-auto bg-purple-900 mt-10 flex-row justify-center items-center gap-4" 
            onPress={()=>{
              router.push('/')
            }}
            >
                  <Ionicons name="arrow-back" size={24} color="white" />
                  <Text className="text-white">GO TO HOMEPAGE</Text>
            </TouchableOpacity>
      </View>
      
    </View>
  )
}

export default SuccessTransaction