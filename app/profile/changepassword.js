import { View, Text, Alert, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';

const changepassword = () => {

  const [newPassword, setNewPassword] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [confPassword, setConfPassword] = useState(null);

  const [loading, setLoading] = useState(false);
  const { token } = useAuthContext();

  const handleSubmit = () => {

    setLoading(true);

    if(currentPassword == null || newPassword == null || confPassword == null){
      Alert.alert("All fields Must Be filled");
      setLoading(false);
      return;
    }

    if(newPassword != confPassword){
      Alert.alert("New Password should match");
      setLoading(false);
      return;
    }

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/change_user_password`,{
        method: 'PUT',
        headers:{
            "Content-Type":"application/json",
            'Authorization':`Bearer ${token}`
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then((res)=>{
        if(res.ok){
            setLoading(false);
            Alert.alert(
              "Success",
              "Your password has been updated successfully.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.push({
                      pathname: "profile"
                    })
                  },
                },
              ],
              { cancelable: false }
            );
        }else{
            Alert.alert("Failed to update profile");
        }
        setLoading(false);
    })
    .catch( err=>{
        console.log(err);
        Alert.alert("Failed to update profile");
        setLoading(false);
    })
    
}

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView>
        <Text className='font-montserrat-light my-10 text-center'>Change Password</Text>

        <View className='m-3'>
          <Text>Current Password</Text>
          <TextInput onChangeText={setCurrentPassword} secureTextEntry={true} className='p-2 mt-1 border border-gray-300 rounded-xl'  />
        </View>
        <View className='m-3'>
          <Text>New Password</Text>
          <TextInput onChangeText={setNewPassword} secureTextEntry={true} className='p-2 mt-1 border border-gray-300 rounded-xl'  />
        </View>
        <View className='m-3'>
          <Text>Confirm New Password</Text>
          <TextInput onChangeText={setConfPassword} secureTextEntry={true} className='p-2 mt-1 border border-gray-300 rounded-2xl'  />
        </View>

        <View className='flex-row gap-2 justify-between mx-3 my-5'>
            <TouchableOpacity 
            className='rounded-2xl border border-purple-950 w-1/2 py-2'
            onPress={()=>{
              setConfPassword(null);
              setNewPassword(null);
              setCurrentPassword(null);
              router.push({
                pathname: "profile"
              })
            }}
            >
              <Text className='text-center'>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            className='rounded-2xl border bg-purple-950 w-1/2 py-2'
            onPress={()=>{
              handleSubmit();
            }}
            >
              { 
              !loading ? 
                <Text className='text-center text-white'>Submit</Text>
              :
                <ActivityIndicator size={20} color="white" />
              }
            </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default changepassword