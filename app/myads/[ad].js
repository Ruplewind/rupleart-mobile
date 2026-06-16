import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthProvider';

const { width } = Dimensions.get('window');

// ── Dots ──────────────────────────────────────────────────────────────────────
const Dots = ({ total, active }) => (
  <View className="flex-row justify-center items-center gap-1.5 mt-3">
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          width: i === active ? 18 : 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: i === active ? '#581C87' : '#D1D5DB',
        }}
      />
    ))}
  </View>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status, reason }) => {
  const config = {
    0: { bg: '#FEF3C7', text: '#92400E', icon: 'schedule',      label: 'Pending Approval' },
    1: { bg: '#DCFCE7', text: '#166534', icon: 'check-circle',  label: 'Approved' },
  };
  const c = config[status] ?? { bg: '#FEE2E2', text: '#991B1B', icon: 'cancel', label: 'Rejected' };

  return (
    <View>
      <View style={{ backgroundColor: c.bg }} className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5">
        <MaterialIcons name={c.icon} size={13} color={c.text} />
        <Text style={{ color: c.text }} className="text-xs font-montserrat-semibold">{c.label}</Text>
      </View>
      {status === 2 && reason && (
        <Text className="text-red-500 text-xs font-montserrat-light mt-2 leading-4">
          <Text className="font-montserrat-semibold">Reason: </Text>{reason}
        </Text>
      )}
    </View>
  );
};

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <View className="flex-row items-start gap-3 py-3 border-b border-gray-50">
    <View className="w-7 h-7 rounded-full bg-purple-50 items-center justify-center mt-0.5">
      <MaterialIcons name={icon} size={14} color="#7C3AED" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-400 text-xs font-montserrat-light uppercase tracking-wide mb-0.5">{label}</Text>
      <Text className="text-gray-800 text-sm font-montserrat-regular leading-5">{value}</Text>
    </View>
  </View>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Ad = () => {
  const { product } = useLocalSearchParams();
  const item = JSON.parse(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const { token } = useAuthContext();

  const handleScroll = e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  const scrollTo = i => scrollRef.current?.scrollTo({ x: i * width, animated: true });

  const deleteAlert = () =>
    Alert.alert('Delete Listing', 'This will permanently remove your ad. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(item._id) },
    ]);

  const handleDeleteItem = id => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/del_product/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) router.replace('/myads');
        else Alert.alert('Error', 'Failed to delete listing.');
      })
      .catch(() => Alert.alert('Error', 'Something went wrong.'));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Carousel ── */}
        <View className="bg-white" style={{ paddingBottom: 12 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {item.image.map((img, i) => (
              <Image
                key={i}
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${img}` }}
                style={{ width, height: 280 }}
                contentFit="contain"
              />
            ))}
          </ScrollView>

          {/* Arrows */}
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={() => scrollTo(activeIndex - 1)}
              className="absolute top-32 left-3 bg-purple-950 rounded-full p-2.5"
              style={{ opacity: 0.85 }}
            >
              <AntDesign name="left" size={16} color="white" />
            </TouchableOpacity>
          )}
          {activeIndex < item.image.length - 1 && (
            <TouchableOpacity
              onPress={() => scrollTo(activeIndex + 1)}
              className="absolute top-32 right-3 bg-purple-950 rounded-full p-2.5"
              style={{ opacity: 0.85 }}
            >
              <AntDesign name="right" size={16} color="white" />
            </TouchableOpacity>
          )}

          {/* Counter pill */}
          {item.image.length > 1 && (
            <View className="absolute top-3 right-3 bg-black/40 rounded-full px-2.5 py-1">
              <Text className="text-white text-xs font-montserrat-semibold">
                {activeIndex + 1}/{item.image.length}
              </Text>
            </View>
          )}

          {item.image.length > 1 && <Dots total={item.image.length} active={activeIndex} />}
        </View>

        {/* ── Details Card ── */}
        <View
          className="bg-white rounded-3xl mx-4 mt-4 px-5 py-5"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
        >
          {/* ID + Name */}
          <Text className="text-purple-400 text-xs font-montserrat-light mb-1">#{item.productId}</Text>
          <Text className="text-gray-800 font-montserrat-black text-2xl leading-tight mb-1">{item.productName}</Text>
          <Text className="text-purple-700 font-montserrat-semibold text-xs uppercase tracking-widest mb-4">{item.type}</Text>

          {/* Price banner */}
          <View className="bg-purple-950 rounded-2xl px-5 py-3 flex-row justify-between items-center mb-5">
            <Text className="text-purple-300 text-xs font-montserrat-light">Listing Price</Text>
            <Text className="text-white font-montserrat-black text-2xl">Ksh {item.price.toLocaleString()}</Text>
          </View>

          {/* Info rows */}
          <InfoRow icon="straighten"   label="Size"        value={item.size} />
          <InfoRow icon="description"  label="Description" value={item.description} />

          {/* Status */}
          <View className="mt-4">
            <Text className="text-gray-400 text-xs font-montserrat-light uppercase tracking-wide mb-2">Status</Text>
            <StatusBadge status={item.approvalStatus} reason={item.disapproval_reason} />
          </View>
        </View>

        {/* ── Actions ── */}
        <View className="mx-4 mt-4 gap-3">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: 'myads/update/[updatead]',
              params: { product: encodeURIComponent(JSON.stringify(item)) },
            })}
            className="bg-purple-950 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.88}
          >
            <AntDesign name="edit" size={18} color="white" />
            <Text className="text-white font-montserrat-semibold text-base">Edit Listing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteAlert}
            className="border border-red-200 bg-red-50 rounded-2xl py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.88}
          >
            <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
            <Text className="text-red-600 font-montserrat-semibold text-base">Delete Listing</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Ad;