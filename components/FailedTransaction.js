import { View, Text } from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const FailedTransaction = () => {
  return (
    <View className="flex-1 justify-center items-center">
        <View className="flex-row justify-center">
            <MaterialIcons name="cancel" size={100} color="red" />
        </View>
      <Text className="mt-10 text-center font-montserrat-bold text-lg">Transaction Failed. Try Again!</Text>

      <TouchableOpacity className="w-1/2 px-2 py-3 rounded-2xl mx-auto bg-purple-900 mt-10 flex-row justify-center items-center gap-4" onPress={()=>{
        router.push('/')
      }}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white">GO TO HOMEPAGE</Text>
      </TouchableOpacity>
    </View>
  )
}

export default FailedTransaction