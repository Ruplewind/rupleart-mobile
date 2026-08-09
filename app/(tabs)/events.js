import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, BackHandler, Modal, Pressable, ScrollView, StatusBar as RNStatusBar, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image';
import Fontisto from '@expo/vector-icons/Fontisto';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, upcoming }) => (
  <View className="flex-row items-center gap-3 mb-3 mt-6">
    <View className={`w-8 h-8 rounded-full items-center justify-center ${upcoming ? 'bg-purple-100' : 'bg-gray-100'}`}>
      <MaterialIcons
        name={upcoming ? 'event-available' : 'event-busy'}
        size={16}
        color={upcoming ? '#6B21A8' : '#9CA3AF'}
      />
    </View>
    <Text className={`font-montserrat-semibold text-sm uppercase tracking-widest ${upcoming ? 'text-purple-900' : 'text-gray-400'}`}>
      {title}
    </Text>
    {count > 0 && (
      <View className={`rounded-full px-2 py-0.5 ${upcoming ? 'bg-purple-950' : 'bg-gray-300'}`}>
        <Text className="text-white text-xs">{count}</Text>
      </View>
    )}
    <View className={`flex-1 h-px ${upcoming ? 'bg-purple-100' : 'bg-gray-100'}`} />
  </View>
);

// ── Event Poster (shows full image, no cropping, tap to zoom) ─────────────────
const EventPoster = ({ event, upcoming, onPress }) => {
  const uri = `${process.env.EXPO_PUBLIC_API_URL}/uploads/${event.poster}`;

  return (
    <Pressable onPress={() => onPress(uri)}>
      <View className="relative" style={{ width: '100%', height: 220, backgroundColor: '#F3F4F6' }}>
        {/* Blurred backdrop fills the frame so there's no empty letterboxing */}
        <Image
          source={{ uri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          blurRadius={35}
          transition={200}
        />
        {/* Dark scrim so the blur reads as a backdrop, not a second image */}
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.25)',
          }}
        />
        {/* Full, uncropped image on top */}
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={200}
        />

        {/* Past overlay */}
        {!upcoming && (
          <View
            className="absolute inset-0 bg-gray-900"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.35 }}
          />
        )}

        {/* Status pill */}
        <View className={`absolute top-3 right-3 flex-row items-center gap-1 px-3 py-1 rounded-full ${upcoming ? 'bg-purple-950' : 'bg-gray-700'}`}>
          <View className={`w-1.5 h-1.5 rounded-full ${upcoming ? 'bg-green-400' : 'bg-gray-400'}`} />
          <Text className="text-white text-xs font-montserrat-semibold">{upcoming ? 'Upcoming' : 'Past'}</Text>
        </View>

        {/* Expand hint */}
        <View
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <MaterialIcons name="zoom-out-map" size={16} color="white" />
        </View>
      </View>
    </Pressable>
  );
};

const formatDate = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
};

// ── Event Card ────────────────────────────────────────────────────────────────
const EventCard = ({ event, upcoming, onImagePress }) => (
  <TouchableOpacity
    activeOpacity={0.92}
    className="mb-4 rounded-3xl overflow-hidden bg-white"
    style={{
      shadowColor: upcoming ? '#6B21A8' : '#000',
      shadowOpacity: upcoming ? 0.1 : 0.04,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: upcoming ? 4 : 2,
    }}
  >
    <EventPoster event={event} upcoming={upcoming} onPress={onImagePress} />

    {/* Content */}
    <View className="p-4">
      <Text
        className={`font-montserrat-black text-xl tracking-wide text-center mb-2 ${upcoming ? 'text-purple-950' : 'text-gray-500'}`}
        numberOfLines={2}
      >
        {event.title}
      </Text>

      <Text className="font-montserrat-regular text-gray-500 text-sm leading-5 mb-4 text-center">
        {event.description}
      </Text>

      {/* Divider */}
      <View className="h-px bg-gray-100 mb-3" />

      {/* Meta row */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-1.5 flex-1">
          <View className={`w-7 h-7 rounded-full items-center justify-center ${upcoming ? 'bg-purple-50' : 'bg-gray-50'}`}>
            <EvilIcons name="location" size={18} color={upcoming ? '#7C3AED' : '#9CA3AF'} />
          </View>
          <Text className="font-montserrat-semibold text-xs text-gray-700 flex-1" numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <View className={`w-7 h-7 rounded-full items-center justify-center ${upcoming ? 'bg-purple-50' : 'bg-gray-50'}`}>
            <Fontisto name="date" size={12} color={upcoming ? '#7C3AED' : '#9CA3AF'} />
          </View>
          <Text className="font-montserrat-semibold text-xs text-gray-700">
            {formatDate(event.date)}
          </Text>
        </View>
      </View>
    </View>

    {/* Bottom accent bar for upcoming */}
    {upcoming && <View className="h-1 bg-purple-950" />}
  </TouchableOpacity>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ upcoming }) => (
  <View className="items-center py-8">
    <View className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${upcoming ? 'bg-purple-50' : 'bg-gray-50'}`}>
      <MaterialIcons name={upcoming ? 'event-available' : 'event-busy'} size={28} color={upcoming ? '#7C3AED' : '#D1D5DB'} />
    </View>
    <Text className="text-gray-400 text-sm font-montserrat-light">
      {upcoming ? 'No upcoming events' : 'No past events'}
    </Text>
  </View>
);

// ── Full-screen Image Lightbox ─────────────────────────────────────────────────
const ImageLightbox = ({ uri, onClose }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (uri) {
      setMounted(true);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setMounted(false);
      });
    }
  }, [uri]);

  // Close on Android hardware back button while open
  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents={uri ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        zIndex: 999,
        elevation: 999,
      }}
    >
      <Pressable
        onPress={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: (RNStatusBar.currentHeight || 40) + 12,
            right: 20,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="close" size={22} color="white" />
        </TouchableOpacity>

        {uri && (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '80%' }}
            contentFit="contain"
            transition={150}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxUri, setLightboxUri] = useState(null);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/events`)
      .then(res => res.json())
      .then(data => {
        const today = new Date().toISOString().split('T')[0];
        setUpcomingEvents(data.filter(e => e.date >= today));
        setPastEvents(data.filter(e => e.date < today));
        setLoading(false);
      })
      .catch(() => { setLoading(false); setError(true); });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="text-gray-400 text-sm mt-3 font-montserrat-light">Loading events…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <MaterialIcons name="wifi-off" size={40} color="#D1D5DB" />
        <Text className="text-gray-500 font-montserrat-semibold mt-4 mb-1">Couldn't load events</Text>
        <Text className="text-gray-400 text-xs text-center font-montserrat-light">Check your connection and try again</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ position: 'relative' }}>
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {/* Page header */}
        <View className="bg-purple-950 rounded-3xl px-5 py-6 mb-2 items-center">
          <View className="w-12 h-12 rounded-full bg-purple-800 items-center justify-center mb-3">
            <MaterialIcons name="event" size={24} color="white" />
          </View>
          <Text className="text-white font-montserrat-black text-xl tracking-wide">Events</Text>
          <Text className="text-purple-300 font-montserrat-light text-xs mt-1">
            {upcomingEvents.length} upcoming · {pastEvents.length} past
          </Text>
        </View>

        {/* Upcoming */}
        <SectionHeader title="Upcoming" count={upcomingEvents.length} upcoming={true} />
        {upcomingEvents.length > 0
          ? upcomingEvents.map((event, i) => (
              <EventCard key={i} event={event} upcoming={true} onImagePress={setLightboxUri} />
            ))
          : <EmptyState upcoming={true} />
        }

        {/* Past */}
        <SectionHeader title="Past Events" count={pastEvents.length} upcoming={false} />
        {pastEvents.length > 0
          ? pastEvents.map((event, i) => (
              <EventCard key={i} event={event} upcoming={false} onImagePress={setLightboxUri} />
            ))
          : <EmptyState upcoming={false} />
        }

      </ScrollView>

      <ImageLightbox uri={lightboxUri} onClose={() => setLightboxUri(null)} />
    </View>
  );
}