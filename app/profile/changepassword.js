import { View, Text, Alert, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// ── Password Field ────────────────────────────────────────────────────────────
const PasswordField = ({ label, value, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-xs font-montserrat-light text-gray-500 uppercase tracking-wide mb-1.5">{label}</Text>
      <View className="flex-row items-center border border-gray-200 rounded-2xl px-3 bg-white">
        <TextInput
          value={value ?? ''}
          onChangeText={onChange}
          secureTextEntry={!visible}
          className="flex-1 py-3 text-sm text-gray-800"
          placeholderTextColor="#D1D5DB"
          placeholder="••••••••"
        />
        <TouchableOpacity onPress={() => setVisible(v => !v)} className="p-1">
          <MaterialIcons name={visible ? 'visibility' : 'visibility-off'} size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword]         = useState(null);
  const [confPassword, setConfPassword]       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const { token } = useAuthContext();

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/change_user_password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
      .then(res => {
        setLoading(false);
        if (res.ok) {
          Alert.alert('Password Updated', 'Your password has been changed successfully.', [
            { text: 'OK', onPress: () => router.push({ pathname: 'profile' }) },
          ], { cancelable: false });
        } else {
          Alert.alert('Failed', 'Could not update password. Check your current password and try again.');
        }
      })
      .catch(() => { setLoading(false); Alert.alert('Error', 'Something went wrong. Please try again.'); });
  };

  const handleCancel = () => {
    setCurrentPassword(null);
    setNewPassword(null);
    setConfPassword(null);
    router.push({ pathname: 'profile' });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 32 }} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-4">
            <MaterialIcons name="lock-reset" size={30} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-xl mb-1">Change Password</Text>
          <Text className="text-gray-400 font-montserrat-light text-sm text-center">
            Enter your current password and choose a new one
          </Text>
        </View>

        {/* Fields */}
        <View className="bg-white rounded-3xl px-5 py-5 mb-6"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 }}
        >
          <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
          <PasswordField label="New Password"     value={newPassword}     onChange={setNewPassword} />
          <PasswordField label="Confirm New Password" value={confPassword} onChange={setConfPassword} />
        </View>

        {/* Password match hint */}
        {newPassword && confPassword && (
          <View className={`flex-row items-center gap-2 mb-5 px-1 ${newPassword === confPassword ? '' : ''}`}>
            <MaterialIcons
              name={newPassword === confPassword ? 'check-circle' : 'cancel'}
              size={16}
              color={newPassword === confPassword ? '#16A34A' : '#DC2626'}
            />
            <Text className={`text-xs font-montserrat-light ${newPassword === confPassword ? 'text-green-600' : 'text-red-500'}`}>
              {newPassword === confPassword ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 border border-purple-200 rounded-2xl py-3.5 items-center"
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text className="text-purple-700 font-montserrat-semibold text-sm">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-purple-950 rounded-2xl py-3.5 items-center"
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator size={18} color="white" />
              : <Text className="text-white font-montserrat-semibold text-sm">Update Password</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;