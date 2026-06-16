import {
  View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform, RefreshControl, Linking, Animated
} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useAuthContext } from '../../context/AuthProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import Myads from '../../components/myads';

const Section = ({ title, icon, children, defaultOpen = false, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(anim, { toValue, useNativeDriver: false, friction: 8 }).start();
    setOpen(!open);
  };

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View className="mx-4 mb-3 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
            {icon}
          </View>
          <Text className="font-montserrat-semibold text-gray-800 text-sm">{title}</Text>
          {badge != null && (
            <View className="bg-purple-950 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs">{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <AntDesign name="down" size={14} color="#6B21A8" />
        </Animated.View>
      </TouchableOpacity>

      {open && (
        <View className="px-4 pb-4 border-t border-gray-50">
          {children}
        </View>
      )}
    </View>
  );
};

const Field = ({ label, value, onChangeText, editable = true, note }) => (
  <View className="mb-4">
    <Text className="font-montserrat-light text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</Text>
    <TextInput
      value={value ?? ''}
      onChangeText={onChangeText}
      editable={editable}
      className={`border rounded-xl px-3 py-3 text-sm text-gray-800 ${
        editable ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 text-gray-400'
      }`}
    />
    {note && <Text className="text-xs text-red-400 mt-1">{note}</Text>}
  </View>
);

const profile = () => {
  const [firstName, setFirstName] = useState(null);
  const [secondName, setSecondName] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { userId, token, logout } = useAuthContext();

  const fetchData = () => {
    if (!token) return;
    setRefreshing(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(data => data.ok ? data.json() : Promise.reject(data.status))
      .then(data => {
        setEmail(data.email);
        setFirstName(data.first_name);
        setSecondName(data.second_name);
        setPhoneNumber(data.phoneNumber);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSubmit = () => {
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/update_profile`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ firstname: firstName, secondname: secondName, email, phoneNumber })
    })
      .then(res => {
        setLoading(false);
        res.ok ? Alert.alert("Saved", "Your profile has been updated.") : Alert.alert("Error", "Failed to update profile.");
      })
      .catch(err => { console.log(err); setLoading(false); });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: () => Linking.openURL('https://rupleart.com/delete_account')
            .catch(() => Alert.alert('Error', 'Could not open the link'))
        }
      ]
    );
  };

  // ── Logged-out state ──
  if (!token) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View className="flex-1 justify-center items-center p-6 bg-gray-50">
          <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-6">
            <FontAwesome name="user-circle" size={48} color="#6B21A8" />
          </View>
          <Text className="text-xl font-montserrat-semibold mb-2 text-gray-800">Welcome back</Text>
          <Text className="text-sm font-montserrat-light text-gray-500 text-center mb-8 leading-5">
            Sign in to manage your profile and listings
          </Text>
          <TouchableOpacity
            className="bg-purple-950 w-full py-3.5 rounded-2xl mb-3"
            onPress={() => router.push({ pathname: "/login", params: { referer: "/profile" } })}
          >
            <Text className="text-white text-center font-montserrat-semibold">Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-purple-950 w-full py-3.5 rounded-2xl"
            onPress={() => router.push('/register')}
          >
            <Text className="text-purple-950 text-center font-montserrat-semibold">Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Logged-in state ──
  const displayName = [firstName, secondName].filter(Boolean).join(' ') || 'Your Account';
  const initials = [firstName?.[0], secondName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero Header ── */}
        <View className="bg-purple-950 pt-10 pb-16 px-6 items-center">
          <View className="w-20 h-20 rounded-full bg-purple-800 items-center justify-center mb-3 border-4 border-purple-700">
            <Text className="text-white text-2xl font-montserrat-semibold">{initials}</Text>
          </View>
          <Text className="text-white text-lg font-montserrat-semibold">{displayName}</Text>
          {email && (
            <Text className="text-purple-300 text-xs mt-1 font-montserrat-light">{email}</Text>
          )}
        </View>

        {/* ── Negative margin card lift ── */}
        <View className="-mt-6">

          {/* ── Account Info Section ── */}
          <Section
            title="Account Information"
            icon={<FontAwesome name="user" size={14} color="#6B21A8" />}
            defaultOpen={false}
          >
            <View className="mt-4">
              {loading ? (
                <ActivityIndicator size="large" color="#6B21A8" className="py-6" />
              ) : (
                <>
                  <Field label="Email" value={email} editable={false} note="Email cannot be changed" />
                  <Field label="First Name" value={firstName} onChangeText={setFirstName} />
                  <Field label="Last Name" value={secondName} onChangeText={setSecondName} />
                  <Field label="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} />

                  <TouchableOpacity
                    className="bg-purple-950 rounded-2xl py-3.5 items-center mt-1"
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading
                      ? <ActivityIndicator size={16} color="white" />
                      : <Text className="text-white font-montserrat-semibold text-sm">Save Changes</Text>
                    }
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Section>

          {/* ── My Ads Section ── */}
          <Section
            title="My Ads"
            icon={<MaterialIcons name="storefront" size={14} color="#6B21A8" />}
            defaultOpen={false}
          >
            <View className="mt-2">
              <Myads />
            </View>
          </Section>

          {/* ── Security Section ── */}
          <Section
            title="Security"
            icon={<MaterialIcons name="lock" size={14} color="#6B21A8" />}
          >
            <View className="mt-4">
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-50"
                onPress={() => router.push({ pathname: "profile/changepassword" })}
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="lock-outline" size={18} color="#6B21A8" />
                  <View>
                    <Text className="text-sm text-gray-800 font-montserrat-semibold">Change Password</Text>
                    <Text className="text-xs text-gray-400 font-montserrat-light">Update your login password</Text>
                  </View>
                </View>
                <AntDesign name="right" size={12} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Section>

          {/* ── Account Actions Section ── */}
          <Section
            title="Account"
            icon={<MaterialIcons name="settings" size={14} color="#6B21A8" />}
          >
            <View className="mt-4 gap-3">
              <TouchableOpacity
                className="flex-row items-center gap-3 bg-red-50 rounded-2xl px-4 py-4"
                onPress={logout}
              >
                <MaterialIcons name="logout" size={18} color="#B91C1C" />
                <View>
                  <Text className="text-red-700 font-montserrat-semibold text-sm">Log Out</Text>
                  <Text className="text-red-400 text-xs font-montserrat-light">Sign out of your account</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-3 border border-red-200 rounded-2xl px-4 py-4"
                onPress={handleDeleteAccount}
              >
                <MaterialIcons name="delete-forever" size={18} color="#DC2626" />
                <View>
                  <Text className="text-red-600 font-montserrat-semibold text-sm">Delete Account</Text>
                  <Text className="text-red-300 text-xs font-montserrat-light">Permanently remove your account</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Section>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default profile;