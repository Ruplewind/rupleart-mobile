import { SplashScreen, Stack } from "expo-router";
import "../global.css";
import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthProvider";

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

    if(fontsLoaded) SplashScreen.hideAsync();
  },[fontsLoaded])

  if(!fontsLoaded && !error) return null;

  

  return (
    <AuthProvider>
    <Stack>
      {/* <Stack.Screen name="(tabs)" options={{title: 'Home'}} />
      <Stack.Screen name="login" options={{title: 'Login'}}/> */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false}} />
      <Stack.Screen name="(auth)" options={{ headerShown: false}} />
      <Stack.Screen name="index" options={{ headerShown: false}} />
      {/* <Stack.Screen name="/search/[query]" options={{ headerShown: false}} /> */}
    </Stack>
    </AuthProvider>
    
  );
}