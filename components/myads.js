import { View, Text, ScrollView, ActivityIndicator, Alert, RefreshControl, Linking, Switch } from 'react-native';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useAuthContext } from '../context/AuthProvider';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { AntDesign } from '@expo/vector-icons';
import Foundation from '@expo/vector-icons/Foundation';

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, reason }) => {
  const config = {
    0: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review', icon: '⏳' },
    1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: '✓' },
  };
  const c = config[status] ?? { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: '✕' };

  return (
    <View>
      <View className={`${c.bg} flex-row items-center gap-1 rounded-full px-3 py-1 self-start`}>
        <Text className={`${c.text} text-xs font-montserrat-semibold`}>{c.icon} {c.label}</Text>
      </View>
      {status === 2 && reason && (
        <Text className="text-xs text-red-400 mt-1.5 font-montserrat-light leading-4">
          <Text className="font-montserrat-semibold">Reason: </Text>{reason}
        </Text>
      )}
    </View>
  );
};

// ── Ad Card ───────────────────────────────────────────────────────────────────
const AdCard = ({ item, onDelete, onToggle, onEdit, onPress, index }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="bg-white rounded-3xl mb-3 overflow-hidden"
    style={{ shadowColor: '#6B21A8', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
  >
    <View className="flex-row">
      {/* Image */}
      <View className={`${index % 2 === 0 ? 'bg-purple-50' : 'bg-violet-100'} w-28 items-center justify-center p-3`}>
        <Image
          source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
          style={{ width: 80, height: 100 }}
          contentFit="contain"
        />
      </View>

      {/* Details */}
      <View className="flex-1 px-3 py-4">
        <Text className="text-purple-400 text-xs font-montserrat-light mb-0.5">#{item.productId}</Text>
        <Text className="text-gray-800 font-montserrat-semibold text-base leading-5" numberOfLines={2}>
          {item.productName}
        </Text>

        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="straighten" size={12} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs font-montserrat-light">{item.size}</Text>
          </View>
          <Text className="text-purple-900 font-montserrat-semibold text-sm">
            Ksh {item.price.toLocaleString()}
          </Text>
        </View>

        {/* Availability */}
        <View className="flex-row items-center mt-2.5">
          <Text className="text-gray-400 text-xs font-montserrat-light mr-2">In Stock</Text>
          <Switch
            value={item.availability}
            onValueChange={(val) => onToggle(item._id, val)}
            thumbColor={item.availability ? '#7C3AED' : '#E5E7EB'}
            trackColor={{ true: '#DDD6FE', false: '#F3F4F6' }}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <Text className={`text-xs font-montserrat-semibold ml-1 ${item.availability ? 'text-purple-600' : 'text-gray-400'}`}>
            {item.availability ? 'Yes' : 'No'}
          </Text>
        </View>

        <View className="mt-3">
          <StatusBadge status={item.approvalStatus} reason={item.disapproval_reason} />
        </View>
      </View>

      {/* Actions */}
      <View className="w-10 items-center justify-evenly py-4 border-l border-gray-50">
        <TouchableOpacity
          onPress={onEdit}
          className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center"
        >
          <Entypo name="edit" size={14} color="#7C3AED" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item._id)}
          className="w-8 h-8 rounded-full bg-red-50 items-center justify-center"
        >
          <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View className="items-center justify-center py-16">
    <View className="w-20 h-20 rounded-full bg-purple-50 items-center justify-center mb-4">
      <MaterialIcons name="storefront" size={36} color="#7C3AED" />
    </View>
    <Text className="text-gray-800 font-montserrat-semibold text-base mb-1">No listings yet</Text>
    <Text className="text-gray-400 font-montserrat-light text-sm text-center px-8">
      Post your first ad to start selling
    </Text>
  </View>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Myads = () => {
  const [myads, setMyads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { token } = useAuthContext();

  const fetchAds = () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/my_products`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : res.status === 401 ? router.push('/login') : Promise.reject())
      .then(data => { setMyads(data); setLoading(false); })
      .catch(() => { setLoading(false); setError(true); });
  };

  useEffect(() => { fetchAds(); }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAds();
    setRefreshing(false);
  };

  const deleteAlert = (id) =>
    Alert.alert('Remove Listing', 'This will permanently delete the ad. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteItem(id) },
    ]);

  const handleDeleteItem = (id) => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/del_product/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          setMyads(prev => prev.filter(item => item._id !== id));
        } else {
          Alert.alert('Error', 'Failed to delete listing');
        }
      })
      .catch(() => Alert.alert('Error', 'Something went wrong'));
  };

  const handleAvailabilityToggle = (id, value) => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/change_availability/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ value }),
    })
      .then(res => {
        if (res.ok) {
          setMyads(prev => prev.map(ad => ad._id === id ? { ...ad, availability: value } : ad));
        } else {
          Alert.alert('Error', 'Failed to update availability');
        }
      })
      .catch(() => Alert.alert('Error', 'Something went wrong'));
  };

  if (!token) {
    return (
      <View className="items-center py-10 px-6">
        <View className="w-16 h-16 rounded-full bg-purple-50 items-center justify-center mb-4">
          <AntDesign name="user" size={28} color="#7C3AED" />
        </View>
        <Text className="font-montserrat-semibold text-gray-800 mb-1">Login to see your ads</Text>
        <Text className="text-gray-400 font-montserrat-light text-xs text-center mb-6">
          Sign in to manage your listings
        </Text>
        <TouchableOpacity
          className="bg-purple-950 w-full py-3 rounded-2xl mb-3"
          onPress={() => router.push({ pathname: '/login', params: { referer: '/myads' } })}
        >
          <Text className="text-white text-center font-montserrat-semibold">Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-gray-200 w-full py-3 rounded-2xl flex-row items-center justify-center gap-2"
          onPress={() => Linking.openURL('https://rupleart.com/terms')}
        >
          <Foundation name="web" size={16} color="#6B7280" />
          <Text className="text-gray-500 text-center text-sm">Terms of Service</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const approved = myads.filter(a => a.approvalStatus === 1).length;
  const pending  = myads.filter(a => a.approvalStatus === 0).length;

  return (
    <View>
      {/* ── Toolbar ── */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2"
          onPress={() => Linking.openURL('https://rupleart.com/terms')}
        >
          <Foundation name="web" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs font-montserrat-regular">Terms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-purple-950 flex-row items-center gap-1.5 rounded-xl px-4 py-2"
          onPress={() => router.push({ pathname: 'myads/postad' })}
        >
          <AntDesign name="plus" size={14} color="white" />
          <Text className="text-white text-xs font-montserrat-semibold">Post Ad</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats Row ── */}
      {!loading && !error && myads.length > 0 && (
        <View className="flex-row gap-2 mb-4">
          {[
            { label: 'Total', value: myads.length, color: 'bg-purple-50', text: 'text-purple-700' },
            { label: 'Approved', value: approved, color: 'bg-green-50', text: 'text-green-700' },
            { label: 'Pending', value: pending, color: 'bg-amber-50', text: 'text-amber-700' },
          ].map(s => (
            <View key={s.label} className={`flex-1 ${s.color} rounded-2xl p-3 items-center`}>
              <Text className={`text-xl font-montserrat-semibold ${s.text}`}>{s.value}</Text>
              <Text className={`text-xs font-montserrat-light ${s.text} opacity-70`}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── List ── */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator color="#7C3AED" size="large" />
            <Text className="text-gray-400 text-xs mt-3 font-montserrat-light">Loading listings…</Text>
          </View>
        )}

        {!loading && error && (
          <View className="items-center py-10">
            <MaterialIcons name="wifi-off" size={32} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3 font-montserrat-light">Couldn't load listings</Text>
            <TouchableOpacity onPress={fetchAds} className="mt-3 bg-purple-50 px-4 py-2 rounded-xl">
              <Text className="text-purple-700 text-sm font-montserrat-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && myads.length === 0 && <EmptyState />}

        {!loading && !error && myads.map((item, index) => (
          <AdCard
            key={item._id ?? index}
            index={index}
            item={item}
            onPress={() => router.push({ pathname: 'myads/[ad]', params: { product: JSON.stringify(item) } })}
            onEdit={() => router.push({ pathname: 'myads/update/[updatead]', params: { product: JSON.stringify(item) } })}
            onDelete={deleteAlert}
            onToggle={handleAvailabilityToggle}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Myads;