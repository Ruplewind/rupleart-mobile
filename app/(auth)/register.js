import { View, Text, Image, Pressable, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'

import { images  } from '../../constants/index'
import FormField from '../../components/FormField'
import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const Register = () => {

  const [form, setForm] = useState({
    firstName: null,
    lastName: null,
    email: null,
    phoneNumber: null,
    password: null
  })

  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
  }

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full px-4 justify-center my-6 min-h-[85vh]">
          <View className="flex-col items-center gap-2">
              <Image 
              source={images.logo_bg_removed} 
              className="w-[50px] h-[50px]"
              resizeMode='contain'
              />
              <Text className="text-2xl font-bold">Sign Up Here!</Text>
          </View>
          
          <View className="flex-row gap-1 mt-4">
            <View className="w-1/2">
              <FormField 
                title="First Name"
                value={form.firstName}
                placeholder={"John"}
                handleChangeText={e => setForm({ ...form, firstName: e})}
                otherStyles="mt-4"
                keyboardType="email-address"
                style={{width:"90%"}}
              />
            </View>
            <View className="w-1/2">
              <FormField 
                title="Last Name"
                value={form.lastName}
                placeholder={"Doe"}
                handleChangeText={e => setForm({ ...form, lastName: e})}
                otherStyles="mt-4"
                keyboardType="email-address"
                style={{width:"90%"}}
              />
            </View>
          </View>
          
          <FormField 
            title="Email"
            value={form.email}
            placeholder={"johndoe@gmail.com"}
            handleChangeText={e => setForm({ ...form, email: e})}
            otherStyles="mt-4"
            keyboardType="email-address"
          />

          <FormField 
            title="Phone Number"
            value={form.phoneNumber}
            placeholder={"07XXXXXXXX"}
            handleChangeText={e => setForm({ ...form, phoneNumber: e})}
            otherStyles="mt-4"
            keyboardType="email-address"
          />

          <FormField 
            title="Password"
            placeholder={"*************"}
            value={form.password}
            handleChangeText={e => setForm({ ...form, password: e})}
            otherStyles="mt-4"
          />

          {
            !loading &&
            <TouchableOpacity className="w-full p-4 bg-purple-900 rounded-xl mt-5" onPress={()=>{
              handleSubmit()
            }}>
            <Text className="text-white text-center">Register</Text>
          </TouchableOpacity> }
          {
            loading && <Pressable className="bg-gray-500 mt-5 rounded-lg w-full p-4">
              <Text className="text-white text-center">Loading .....</Text>
            </Pressable>
          }

          <View className="flex-row justify-center gap-2 mt-5">
            <Text className="font-montserrat-medium">I have an account?</Text>
            <TouchableOpacity onPress={()=>{
                    router.push('login')
                }}>
                <Text className="text-purple-500 font-montserrat-bold">Log In</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  )
}

export default Register