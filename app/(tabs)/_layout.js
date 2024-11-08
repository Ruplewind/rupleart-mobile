import { Tabs } from 'expo-router'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function TabLayout() {
    return (
      <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#ffd33d',
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerShadowVisible: false,
            headerTintColor: '#fff',
            tabBarStyle: {
            backgroundColor: '#25292e',
            },
        }}
      >
        <Tabs.Screen 
        name="index" 
        options={{
            title: 'Home',
            tabBarIcon: ({ color, focused}) => (
                <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
        }} />
        <Tabs.Screen 
        name="events" 
        options={{
            title: 'Events',
            tabBarIcon: ({ color, focused}) => (
                <MaterialIcons name={focused ? 'event' : 'event'} color={color} size={24} />
            ),
        }} />

        <Tabs.Screen 
        name="myads" 
        options={{
            title: 'My Ads',
            tabBarIcon: ({ color, focused}) => (
                <FontAwesome5 name={focused ? 'clipboard-list' : 'clipboard-list'} color={color} size={24} />
            ),
        }} />

        <Tabs.Screen 
        name="profile" 
        options={{
            title: 'My Profile',
            tabBarIcon: ({ color, focused}) => (
                <FontAwesome name={focused ? 'user' : 'user'} color={color} size={24} />
            ),
        }} />
      </Tabs>
    )
}

