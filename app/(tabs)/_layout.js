import { Tabs } from 'expo-router'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Button, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
    return (
      <Tabs
        screenOptions={{
            headerStyle: {
                backgroundColor: '#fff',
                height: 70
            },
            headerLeft: ()=> (
                <Ionicons name="menu" size={20} color="black" className="ml-5" />
            ),
            headerRight: ()=> (
                <TouchableOpacity>
                  <AntDesign name="shoppingcart" size={22} color="black"  className="mr-5" />
                </TouchableOpacity>
            ),
            headerShadowVisible: false,
            headerTintColor: '#25292e',
            tabBarActiveTintColor: '#4A148C',
            tabBarStyle: {
                backgroundColor: '#fff',
                padding: 12,
                height: 55
            },
            tabBarLabelStyle: {
              marginTop: 0,
              fontSize: 10,
              marginBottom:10
            },
        }}
      >
        <Tabs.Screen 
        name="home" 
        options={{
            title: 'Products',
            headerShown: true,
            tabBarIcon: ({ color, focused}) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={20} />
            ),
        }} />
        <Tabs.Screen 
        name="events" 
        options={{
            title: 'Events',
            tabBarIcon: ({ color, focused}) => (
                <MaterialIcons name={focused ? 'event' : 'event'} color={color} size={20} />
            ),
        }} />

        <Tabs.Screen 
        name="myads" 
        options={{
            title: 'My Ads',
            tabBarIcon: ({ color, focused}) => (
                <FontAwesome5 name={focused ? 'clipboard-list' : 'clipboard-list'} color={color} size={20} />
            ),
        }} />

        <Tabs.Screen 
        name="profile" 
        options={{
            title: 'My Profile',
            tabBarIcon: ({ color, focused}) => (
                <FontAwesome name={focused ? 'user' : 'user'} color={color} size={20} />
            ),
        }} />
      </Tabs>
    )
}

