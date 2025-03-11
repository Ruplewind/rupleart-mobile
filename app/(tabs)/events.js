import React, { Component, useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto';
import EvilIcons from '@expo/vector-icons/EvilIcons';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/events`)
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
        filterEvents(data); 
      })
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  const filterEvents = (events) => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = events.filter(event => event.date >= today);
    const past = events.filter(event => event.date < today);
    setUpcomingEvents(upcoming);
    setPastEvents(past);
    setLoading(false);
  };
    return (
      <ScrollView className='p-4 mb-5'>
        { loading && <ActivityIndicator color='black' />}
        <Text className='text-center font-montserrat-light my-2 text-sm uppercase'>Upcoming Events</Text>
        {!loading && upcomingEvents.length > 0 && upcomingEvents.map((event, index) => (
        <TouchableOpacity key={index} className='bg-white mx-5 shadow-lg rounded-lg my-2'>
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${event.poster}` }} 
            style={{
              height:200,
              objectFit:"contain"
            }} 
          />
          <View className='p-3'> 
            <Text className='font-montserrat-black text-2xl tracking-wider text-purple-950  text-center mt-5'>{event.title}</Text>
            <Text className='font-montserrat-regular mt-2 mb-2 text-sm'>{event.description}</Text>
            <View className='flex-row justify-between'>
              <View className='flex-row gap-1 items-center mb-2'>
                <EvilIcons name="location" size={20} color="black" />
                <Text className='font-montserrat-light text-sm'>{event.venue}</Text>
              </View>
              <View className='flex-row gap-2 items-center mb-2'>
                <Fontisto name="date" size={16} color="black" />
                <Text className='font-montserrat-light text-sm'>{event.date}</Text>
              </View>
            </View>
            
          </View>
        </TouchableOpacity> 
        ))}
        {
          !loading && upcomingEvents.length < 1 && <Text className='text-center'>No upcoming Events</Text>
        }

        <Text className='text-center font-montserrat-light my-2 text-sm uppercase mt-10'>Past Events</Text>
        {!loading && pastEvents.length > 0 && pastEvents.map((event, index) => (
        <TouchableOpacity key={index} className='bg-white mx-5 shadow-lg rounded-lg my-2'>
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${event.poster}` }} 
            style={{
              height:200,
              objectFit:"contain"
            }} 
          />
          <View className='p-3'> 
            <Text className='font-montserrat-black text-2xl tracking-wider text-purple-950  text-center mt-5'>{event.title}</Text>
            <Text className='font-montserrat-regular mt-2 mb-2 text-sm'>{event.description}</Text>
            <View className=''>
              <View className='flex-row gap-1 items-center mb-2'>
                <EvilIcons name="location" size={20} color="black" />
                <Text className='font-montserrat-light text-sm'>{event.venue}</Text>
              </View>
              <View className='flex-row gap-2 items-center mb-2'>
                <Fontisto name="date" size={16} color="black" />
                <Text className='font-montserrat-light text-sm'>{event.date}</Text>
              </View>
            </View>
            
          </View>
        </TouchableOpacity> 
        ))}
        {
          !loading && pastEvents.length < 1 && <Text className='text-center my-2'>No Past Events</Text>
        }

      </ScrollView>
    )
}