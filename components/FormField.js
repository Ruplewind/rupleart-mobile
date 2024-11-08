import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
  return (
    <View>
        <Text className="text-base font-montserrat-medium 500 mb-3 mt-5">{title}</Text>
        <View 
        className="w-full h-16 mt-2 rounded-xl items-center flex-row" 
        style={{ 
            backgroundColor: "#e6e6e6",
            borderColor: isFocused ? "#5b21b6" : "#e6e6e6",
            borderWidth: 2
        }} >
            <TextInput 
            className="font-montserrat-medium text-sm px-4 py-1" 
            style={{width: "90%", padding: 16}} 
            value={value} placeholder={placeholder} 
            placeholderTextColor={"#7b7b8b"} 
            onChangeText={handleChangeText} 
            secureTextEntry={ title == "Password" && !showPassword }
            onFocus={() => setIsFocused(true)}   // Set focus to true
            onBlur={() => setIsFocused(false)}
            />

            { 
            title == 'Password' && 
                <AntDesign className="w-6 h-6" name="eye" size={20} color="gray" 
                onPress={()=>{
                    setShowPassword(!showPassword)
                }}/> 
            }
        </View>
    </View>
  )
}

export default FormField