import { View, Text, TouchableOpacity, SafeAreaView, Alert, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import FormField from '../../components/FormField';

const profile = () => {

  const [ firstName, setFirstName] = useState(null);
  const [ secondName, setSecondName] = useState(null);
  const [ email, setEmail] = useState(null);
  const [ phoneNumber, setPhoneNumber] = useState(null);
  const [ loading, setLoading] = useState(false);

  const { userId, token, logout } = useAuthContext();

  const [refreshing, setRefreshing] = useState(false);


  const fetchData = () => {
    setRefreshing(true);
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`,{
          method: 'GET',
          headers: {
              'Authorization':`Bearer ${token}`
          }
      })
      .then( data => {
          if(data.ok){
              return data.json();
          }else if(data.status === 401){
              //navigate("/login")
          }
      })
      .then( data => {
          setEmail(data.email);
          setFirstName(data.first_name);
          setSecondName(data.second_name);
          setPhoneNumber(data.phoneNumber);
          setLoading(false);        
          setRefreshing(false);

      })
      .catch(err => {
          console.log(err);
          setLoading(false);        
          setRefreshing(false);

      })
  }
  useEffect(()=>{
    fetchData();
},[]);

const handleSubmit = () =>{
  setLoading(true);

  fetch(`${process.env.EXPO_PUBLIC_API_URL}/update_profile`,{
      method: 'PUT',
      headers:{
          "Content-Type":"application/json",
          'Authorization':`Bearer ${token}`
      },
      body: JSON.stringify({
        firstname: firstName, secondname: secondName, email, phoneNumber
      })
  })
  .then((res)=>{
      if(res.ok){
          setLoading(false);
          Alert.alert("Success")
      }else{
          Alert.alert("Failed to update profile");
      }
  })
  .catch( err=>{
      console.log(err);
  })
}

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, marginBottom: 12 }}>
      {/* <Text className="mt-10 text-center font-montserrat-light uppercase">profile</Text> */}
      <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
      >
        <View className='bg-purple-950'>
            <View className='h-32 my-4 w-full'>
              <View className='flex-row justify-center'>
                <FontAwesome name="user-circle" size={40} color="white" /> 
              </View>
              <Text className='text-white mt-2 text-center'>Account Information</Text>           
            </View>
        </View>
        <View className='my-1'></View>

        <View className='-mt-10 bg-white rounded-xl p-5 shadow-lg mx-2'>
        { !loading &&
          <View className=''>
            <View className='gap-2 mb-3'>
              <Text className='font-montserrat-light text-sm'>Email:</Text>
              <TextInput value={email} editable={false} onChangeText={setEmail} className='border border-gray-200 p-2 py-3 rounded-lg bg-gray-200 text-black'/>
              <Text className='text-xs text-red-400'>* Email is not editable</Text>
            </View>
            <View className='gap-2 mb-3'>
              <Text className='font-montserrat-light text-sm'>First Name:</Text>
              <TextInput value={firstName} onChangeText={setFirstName} className='border border-gray-200 p-2 py-3 rounded-lg text-sm text-black'/>
            </View>
            <View className='gap-2 mb-3'>
              <Text className='font-montserrat-light text-sm'>Last Name:</Text>
              <TextInput value={secondName} onChangeText={setSecondName} className='border border-gray-200 p-2 py-3 rounded-lg text-sm text-black'/>
            </View>
            <View className='gap-2 mb-5'>
              <Text className='font-montserrat-light text-sm'>Phone Number:</Text>
              <TextInput value={phoneNumber} onChangeText={setPhoneNumber} className='border border-gray-200 p-2 py-3 rounded-lg text-sm text-black'/>
            </View>
          </View>      
        }

        <View className='flex-row justify-center gap-5'>
            <TouchableOpacity 
            className='bg-purple-900 w-1/2 p-2 rounded-xl'
            onPress={()=>{
              handleSubmit();
            }}
            >
              { loading ? 
              <ActivityIndicator size={14} color={"purple"}/>
                : 
              <Text className='text-white text-center text-sm'>Save Changes</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity 
              className='border border-purple-900 w-1/2 p-2 rounded-xl'
              onPress={()=>{
                router.push({
                  pathname: "profile/changepassword"
                })
              }}
            >
              <Text className='text-purple-900 text-center text-sm'>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className='mt-5'>
          <TouchableOpacity 
          className='bg-red-700 p-2 py-3 w-1/2 rounded-full mx-auto'
          onPress={()=>{
            logout();
          }}
          >
            <View className='flex-row gap-2 items-center mx-auto'>
              <MaterialIcons name="logout" size={16} color="white" />
              <Text className='text-white'>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  )
}

export default profile