import { router, Stack } from "expo-router";
import "../global.css";
import { Alert, Text, View } from "react-native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthProvider";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { CartProvider } from "../context/CartContext";
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {

  const [fontsLoaded, error] = useFonts({
    "Montserrat-Black": require('../assets/fonts/Montserrat-Black.ttf'),
    "Montserrat-BlackItalic": require('../assets/fonts/Montserrat-BlackItalic.ttf'),
    "Montserrat-Bold": require('../assets/fonts/Montserrat-Bold.ttf'),
    "Montserrat-BoldItalic": require('../assets/fonts/Montserrat-BoldItalic.ttf'),
    "Montserrat-ExtraBold": require('../assets/fonts/Montserrat-ExtraBold.ttf'),
    "Montserrat-ExtraBoldItalic": require('../assets/fonts/Montserrat-ExtraBoldItalic.ttf'),
    "Montserrat-ExtraLight": require('../assets/fonts/Montserrat-ExtraLight.ttf'),
    "Montserrat-ExtraLightItalic": require('../assets/fonts/Montserrat-ExtraLightItalic.ttf'),
    "Montserrat-Italic": require('../assets/fonts/Montserrat-Italic.ttf'),
    "Montserrat-Light": require('../assets/fonts/Montserrat-Light.ttf'),
    "Montserrat-LightItalic": require('../assets/fonts/Montserrat-LightItalic.ttf'),
    "Montserrat-Medium": require('../assets/fonts/Montserrat-Medium.ttf'),
    "Montserrat-MediumItalic": require('../assets/fonts/Montserrat-MediumItalic.ttf'),
    "Montserrat-Regular": require('../assets/fonts/Montserrat-Regular.ttf'),
    "Montserrat-SemiBold": require('../assets/fonts/Montserrat-SemiBold.ttf'),
    "Montserrat-SemiBoldItalic": require('../assets/fonts/Montserrat-SemiBoldItalic.ttf'),
    "Montserrat-Thin": require('../assets/fonts/Montserrat-Thin.ttf'),
    "Montserrat-ThinItalic": require('../assets/fonts/Montserrat-ThinItalic.ttf'),
  });

  useEffect(()=>{
    if(error) throw error;

    if(fontsLoaded){
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1000);
    }
  },[fontsLoaded])

  if(!fontsLoaded && !error) return null;

  

  return (
    <CartProvider>
    <AuthProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="(auth)" options={{ headerShown: false}} />
      <Stack.Screen name="index" options={{ headerShown: false}} />
      <Stack.Screen 
        name="cancel" 
        options={{ 
          headerBackVisible: false,
          headerShown: true, 
          headerLeft: () => null,
          headerTitle: "Transaction Cancelled", 
          headerLeft: () => null // Removes the back button
        }} 
      />
      <Stack.Screen 
        name="confirmtransaction/[id]" 
        options={{ 
          headerBackTitleVisible: false, 
          headerShown: true, 
          headerTitle: "Order Confirmation", 
          headerBackVisible: false, // Removes the back button
        }} 
      />
      <Stack.Screen 
        name="checkout"
        options={{ 
          headerBackButtonDisplayMode: "minimal",
          headerShown: true, 
          headerTitle: "Checkout", 
          headerLeft: () => null // Removes the back button
        }} 
      />
      <Stack.Screen 
        name="cart" 
        options={{ 
          headerBackButtonDisplayMode: "minimal",
          headerShown: true, 
          headerTitle: "Your Cart", 
          headerLeft: () => null // Removes the back button
        }} 
      />
      <Stack.Screen 
        name="preview/[product]" 
        options={{ 
          headerShown: true, 
          headerTitle: "Preview", 
          headerBackTitleVisible: false, 
          headerRight: ()=> (
                  <TouchableOpacity onPress={()=>{
                    router.push("cart")
                  }}>
                    <AntDesign name="shoppingcart" size={22} color="black"  className="mr-5" />
                  </TouchableOpacity>
              )
        }}
      />
    <Stack.Screen 
        name="profile/changepassword" 
        options={{ 
          headerShown: true, 
          headerTitle: "Change Password",
          headerBackVisible: true
        }}
      />
      <Stack.Screen 
        name="myads/postad" 
        options={{ 
          headerShown: true, 
          headerTitle: "Post Ad",
          headerBackVisible: true
        }}
      />
    </Stack>
    <StatusBar backgroundColor="#161622" style='dark' />
    </AuthProvider>
    </CartProvider>
  );
}