import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
    const [showPassword, setShowPassword] = useState(false);
  return (
    <View>
        <Text className="text-base font-montserrat-medium 500 mb-3 mt-5">{title}</Text>
        <View className="w-full h-16 mt-2 rounded-xl items-center flex-row bg-gray-200 border-gray-300" >
            <TextInput className="font-montserrat-medium text-sm px-4 py-1" style={{width: "90%"}} value={value} placeholder={placeholder} placeholderTextColor={"#7b7b8b"} onChangeText={handleChangeText} 
            secureTextEntry={ title == "Password" && !showPassword } />
            { title == 'Password' && <AntDesign className="w-6 h-6" name="eye" size={20} color="gray" onPress={()=>{
            setShowPassword(!showPassword)
        }}/> }
        </View>
    </View>
  )
}

export default FormField