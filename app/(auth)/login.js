import { View, Text, Image, Pressable, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'

import { images  } from '../../constants/index'
import FormField from '../../components/FormField'
import { TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthContext } from '../../context/AuthProvider'

const Login = () => {

  const [form, setForm] = useState({
    email: null,
    password: null
  })
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();

  const handleSubmit = () => {
    setLoading(true);

    if(form.email == null || form.password == null){
      Alert.alert('Error', "All fields must be filled");
      setLoading(false);
      return;
    }

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/user_m_login`,{
      method: 'POST',
      headers: {
        'Content-type':'application/json'
      },
      body: JSON.stringify({
        email: form.email , password: form.password
      })
    })
    .then((res)=> {
          res.json().then(response => {
            if(res.ok){
                //Alert.alert('Success', "Logged In");
                login(response.token, response.userId, `${response.first_name} ${response.second_name}`);
                if(response.firstTime == true)
                {
                  router.push({
                    pathname: "profile/changepassword"
                  })
                }
                else
                {
                  router.replace('/home');
                }
                setLoading(false);
            }else{
                Alert.alert('Failed', response);
                setLoading(false);
            }
          })
      })
    .catch(err => {
      Alert.alert('Error', err);
      setLoading(false);
    })
  }

  return (
    <SafeAreaView className="h-full">
      <ScrollView>
        <View className="w-full px-4 justify-center my-6 min-h-[85vh]">
          <View className="flex-col items-center gap-2">
              <Image 
              source={images.logo_bg_removed} 
              className="w-[50px] h-[50px]"
              contentFit='contain'
              />
              <Text className="text-2xl font-bold">Welcome Back!</Text>
              <Text className="mt-2 font-bold">Log In</Text>
          </View>
      
          <FormField 
            title="Email"
            value={form.email}
            placeholder={"johndoe@gmail.com"}
            handleChangeText={e => setForm({ ...form, email: e})}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField 
            title="Password"
            placeholder={"*************"}
            value={form.password}
            handleChangeText={e => setForm({ ...form, password: e})}
            otherStyles="mt-7"
          />

          <TouchableOpacity
          className='my-1 w-full items-end'
          onPress={()=>{
            router.push('forgotpassword')
          }}>
            <Text className='text-blue-900 text-right'>Forgot password?</Text>
          </TouchableOpacity>

          {
            !loading &&
            <TouchableOpacity className="w-full p-4 bg-purple-900 rounded-xl mt-10" onPress={()=>{
              handleSubmit()
            }}>
            <Text className="text-white text-center">Login</Text>
          </TouchableOpacity> }
          {
            loading && <Pressable className="bg-gray-500 mt-10 rounded-lg w-full p-4">
              <Text className="text-white text-center">Loading .....</Text>
            </Pressable>
          }

          <View className="flex-row justify-center gap-2 mt-5">
            <Text className="font-montserrat-medium">I don't have an account?</Text>
            <TouchableOpacity onPress={()=>{
                    router.push('register')
                }}>
                <Text className="text-purple-500 font-montserrat-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  )
}

export default Login