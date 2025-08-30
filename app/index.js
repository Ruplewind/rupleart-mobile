import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Redirect, router } from 'expo-router'
import { images  } from '../constants/index'
import { useAuthContext } from '../context/AuthProvider'
import { isLoading } from 'expo-font'

const index = () => {

    const { token, isLoading } = useAuthContext();

    if(!isLoading && token) return <Redirect href="/home" />
  return (
    <SafeAreaView className="bg-white h-full">
        <ScrollView contentContainerStyle={{height: '100%' }}>
            <View className="w-full min-h-[85vh] justify-center items-center p-4 flex-1 mt-5">

                <Text className="mb-5 text-4xl tracking-wider font-montserrat-semibold">Rupleart</Text>
                <Image
                    source={images.logo}
                    className="w-[200px] h-[200px]"
                    contentFit='contain'
                />
                <Text className="mt-5 font-montserrat-bold capitalize text-2xl">For the love of art</Text>
                <Text className="mt-5 tracking-wider text-sm my-10 text-center font-montserrat-regular">Explore pieces that inspire you and bring creativity into any space—all at your fingertips.</Text>
                <TouchableOpacity onPress={()=>{
                    router.push('login')
                }} className="bg-purple-950 text-white p-5 w-3/4 mt-5 rounded-lg">
                    <View className="flex justify-center gap-5">
                        <Text className="text-white text-center font-bold text-lg capitalize">Continue With Email</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>

        {/* <StatusBar backgroundColor="#161622" style='dark' /> */}

    </SafeAreaView>
  )
}

export default index