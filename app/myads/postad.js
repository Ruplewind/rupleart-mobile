import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';
import { Link, router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import DropDownPicker from 'react-native-dropdown-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <View className="mb-4">
    <View className="flex-row items-center gap-1.5 mb-1.5">
      <MaterialIcons name={icon} size={13} color="#7C3AED" />
      <Text className="text-xs font-montserrat-light text-gray-500 uppercase tracking-wide">{label}</Text>
    </View>
    {children}
  </View>
);

const inputClass = "border border-gray-200 px-3 py-3 rounded-2xl bg-white text-sm text-gray-800";

// ── Main ──────────────────────────────────────────────────────────────────────
const PostAd = () => {
  const [images, setImages]           = useState([]);
  const [isChecked, setChecked]       = useState(false);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);

  const [productName, setProductName] = useState(null);
  const [type, setType]               = useState(null);
  const [price, setPrice]             = useState(0);
  const [description, setDescription] = useState(null);
  const [size, setSize]               = useState(null);

  const { token } = useAuthContext();

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!productName || price < 1 || images.length === 0 || !type || !size || !description) {
      Alert.alert('Missing Fields', 'Please fill in all fields and upload at least one image.');
      return;
    }
    if (!isChecked) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('size', size);

    images.forEach((uri, i) => {
      const isPng = uri.endsWith('.png');
      formData.append('image', {
        uri,
        name: `product_image_${i}.${isPng ? 'png' : 'jpeg'}`,
        type: isPng ? 'image/png' : 'image/jpeg',
      });
    });

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/add_product`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(res => {
        setLoading(false);
        if (res.ok) {
          Alert.alert('Posted!', 'Your ad has been submitted and is awaiting verification.', [
            { text: 'OK', onPress: () => router.push({ pathname: 'myads' }) },
          ]);
        } else {
          Alert.alert('Failed', 'Could not submit your ad. Please try again.');
        }
      })
      .catch(() => { setLoading(false); Alert.alert('Error', 'Something went wrong. Please retry.'); });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6 mt-2">
          <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center mb-3">
            <MaterialIcons name="add-box" size={26} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-lg">Post a New Ad</Text>
          <Text className="text-gray-400 font-montserrat-light text-xs mt-1 text-center">
            Fill in the details below and await verification
          </Text>
        </View>

        {/* ── Image Upload ── */}
        <View
          className="bg-white rounded-3xl px-4 py-5 mb-4"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
        >
          <View className="flex-row items-center gap-1.5 mb-3">
            <MaterialIcons name="photo-library" size={13} color="#7C3AED" />
            <Text className="text-xs font-montserrat-light text-gray-500 uppercase tracking-wide">
              Product Images {images.length > 0 && `(${images.length})`}
            </Text>
          </View>

          {/* Upload zone */}
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View className="border-2 border-dashed border-purple-200 rounded-2xl h-36 items-center justify-center bg-purple-50">
              <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                <MaterialIcons name="cloud-upload" size={24} color="#7C3AED" />
              </View>
              <Text className="text-purple-700 font-montserrat-semibold text-sm">Tap to select images</Text>
              <Text className="text-purple-400 font-montserrat-light text-xs mt-1">PNG or JPEG supported</Text>
            </View>
          </TouchableOpacity>

          {/* Preview strip */}
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              {images.map((img, i) => (
                <View key={i} className="mr-2 relative">
                  <Image
                    source={{ uri: img }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 items-center justify-center"
                  >
                    <AntDesign name="close" size={10} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add more */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-purple-200 items-center justify-center bg-purple-50"
              >
                <AntDesign name="plus" size={20} color="#7C3AED" />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* ── Product Details ── */}
        <View
          className="bg-white rounded-3xl px-4 py-5 mb-4"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
        >
          <Field label="Product Title" icon="label">
            <TextInput
              className={inputClass}
              onChangeText={setProductName}
              placeholder="e.g. Abstract Canvas Print"
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Category" icon="category">
            {categories.length === 0 ? (
              <View className="border border-gray-200 px-3 py-3 rounded-2xl bg-gray-50 flex-row items-center gap-2">
                <ActivityIndicator size={12} color="#7C3AED" />
                <Text className="text-gray-400 text-sm">Loading categories…</Text>
              </View>
            ) : (
              <View style={{ zIndex: 1000, minHeight: open ? 220 : 52 }}>
                <DropDownPicker
                  open={open}
                  value={type}
                  items={categories.map(c => ({ label: c.category, value: c.category }))}
                  placeholder="Select a category"
                  setOpen={setOpen}
                  setValue={setType}
                  style={{ borderColor: '#E5E7EB', borderRadius: 16 }}
                  dropDownContainerStyle={{ borderColor: '#E5E7EB', borderRadius: 16 }}
                  placeholderStyle={{ color: '#D1D5DB', fontSize: 14 }}
                  labelStyle={{ fontSize: 14, color: '#1F2937' }}
                  zIndex={1000}
                  listMode="SCROLLVIEW"
                  maxHeight={180}
                  scrollViewProps={{ nestedScrollEnabled: true }}
                  dropDownDirection="BOTTOM"
                />
              </View>
            )}
          </Field>

          <Field label="Description" icon="description">
            <TextInput
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              scrollEnabled={false}
              className={inputClass}
              style={{ minHeight: 90 }}
              onChangeText={setDescription}
              placeholder="Describe your artwork…"
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Size (small / medium / large / cm)" icon="straighten">
            <TextInput
              className={inputClass}
              onChangeText={setSize}
              placeholder="e.g. 30x40cm"
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Price (Ksh)" icon="attach-money">
            <TextInput
              keyboardType="numeric"
              className={inputClass}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#D1D5DB"
            />
          </Field>
        </View>

        {/* ── Terms ── */}
        <TouchableOpacity
          onPress={() => setChecked(v => !v)}
          activeOpacity={0.8}
          className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-4 mb-6"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
        >
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#581C87' : undefined}
          />
          <Text className="text-sm font-montserrat-light text-gray-600 flex-1">
            I have read and agree to the{' '}
            <Link className="text-purple-700 font-montserrat-semibold" href="https://rupleart.com/terms">
              terms and conditions
            </Link>
          </Text>
        </TouchableOpacity>

        {/* ── Buttons ── */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 border border-purple-200 rounded-2xl py-3.5 items-center"
            onPress={() => router.back()}
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
              ? <ActivityIndicator color="white" size={18} />
              : <Text className="text-white font-montserrat-semibold text-sm">Submit Ad</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostAd;