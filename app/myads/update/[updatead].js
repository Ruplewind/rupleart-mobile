import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Checkbox from 'expo-checkbox';
import { Link, router, useLocalSearchParams } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuthContext } from '../../../context/AuthProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, icon, children, hint }) => (
  <View className="mb-4">
    <View className="flex-row items-center gap-1.5 mb-1.5">
      <MaterialIcons name={icon} size={13} color="#7C3AED" />
      <Text className="text-xs font-montserrat-light text-gray-500 uppercase tracking-wide">{label}</Text>
      {hint && <Text className="text-xs font-montserrat-semibold text-purple-700 ml-1">{hint}</Text>}
    </View>
    {children}
  </View>
);

const inputClass = "border border-gray-200 px-3 py-3 rounded-2xl bg-white text-sm text-gray-800";

// ── Image Thumb ───────────────────────────────────────────────────────────────
const Thumb = ({ uri, onRemove, label }) => (
  <View className="mr-2 relative">
    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} contentFit="cover" />
    {label && (
      <View className="absolute bottom-0 left-0 right-0 bg-black/40 rounded-b-xl py-0.5 items-center">
        <Text className="text-white text-xs" style={{ fontSize: 9 }}>{label}</Text>
      </View>
    )}
    <TouchableOpacity
      onPress={onRemove}
      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 items-center justify-center"
    >
      <AntDesign name="close" size={10} color="white" />
    </TouchableOpacity>
  </View>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const UpdateAd = () => {
  const { product } = useLocalSearchParams();
  const data = JSON.parse(decodeURIComponent(product));
  const { token } = useAuthContext();

  const [loading, setLoading]               = useState(false);
  const [productName, setProductName]       = useState(data.productName);
  const [type, setType]                     = useState(data.type);
  const [price, setPrice]                   = useState(data.price.toString());
  const [description, setDescription]       = useState(data.description);
  const [size, setSize]                     = useState(data.size);
  const [categories, setCategories]         = useState([]);
  const [images, setImages]                 = useState([]);
  const [existingImages, setExistingImages] = useState(data.image || []);
  const [open, setOpen]                     = useState(false);
  const [isChecked, setChecked]             = useState(false);

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

  const totalImages = existingImages.length + images.length;

  const handleSubmit = () => {
    if (!productName?.trim() || price < 1 || !type || !size || !description?.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
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

    existingImages.forEach(img => formData.append('image', img));
    images.forEach((uri, i) => {
      const isPng = uri.endsWith('.png');
      formData.append('image', {
        uri,
        name: `product_image_${i}.${isPng ? 'png' : 'jpeg'}`,
        type: isPng ? 'image/png' : 'image/jpeg',
      });
    });

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/edit_product/${data._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(res => {
        setLoading(false);
        if (res.ok) {
          Alert.alert('Updated!', 'Your ad has been updated and is awaiting re-verification.', [
            { text: 'OK', onPress: () => router.push('myads') },
          ]);
        } else {
          Alert.alert('Failed', 'Could not update your ad. Please try again.');
        }
      })
      .catch(() => { setLoading(false); Alert.alert('Error', 'Something went wrong. Please retry.'); });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-6 mt-2">
          <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center mb-3">
            <MaterialIcons name="edit" size={26} color="#6B21A8" />
          </View>
          <Text className="text-gray-800 font-montserrat-semibold text-lg">Update Ad</Text>
          <Text className="text-gray-400 font-montserrat-light text-xs mt-1 text-center">
            #{data.productId} · Changes will require re-verification
          </Text>
        </View>

        {/* ── Images ── */}
        <View
          className="bg-white rounded-3xl px-4 py-5 mb-4"
          style={{ shadowColor: '#6B21A8', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="photo-library" size={13} color="#7C3AED" />
              <Text className="text-xs font-montserrat-light text-gray-500 uppercase tracking-wide">
                Images ({totalImages})
              </Text>
            </View>
            {totalImages > 0 && (
              <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl">
                <AntDesign name="plus" size={12} color="#7C3AED" />
                <Text className="text-purple-700 text-xs font-montserrat-semibold">Add More</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Thumbnails */}
          {totalImages > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {existingImages.map((img, i) => (
                <Thumb
                  key={`existing-${i}`}
                  uri={`${process.env.EXPO_PUBLIC_API_URL}/uploads/${img}`}
                  label="Saved"
                  onRemove={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
              {images.map((img, i) => (
                <Thumb
                  key={`new-${i}`}
                  uri={img}
                  label="New"
                  onRemove={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </ScrollView>
          ) : (
            /* Upload zone when no images */
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View className="border-2 border-dashed border-purple-200 rounded-2xl h-28 items-center justify-center bg-purple-50">
                <MaterialIcons name="cloud-upload" size={24} color="#7C3AED" />
                <Text className="text-purple-700 font-montserrat-semibold text-sm mt-1">Tap to select images</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Upload zone below strip */}
          {totalImages > 0 && (
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} className="mt-3">
              <View className="border-2 border-dashed border-purple-100 rounded-2xl h-14 items-center justify-center bg-purple-50 flex-row gap-2">
                <MaterialIcons name="cloud-upload" size={16} color="#7C3AED" />
                <Text className="text-purple-600 font-montserrat-light text-xs">Tap to add more images</Text>
              </View>
            </TouchableOpacity>
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
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Category" icon="category" hint={`Current: ${data.type}`}>
            <View style={{ zIndex: 1000, minHeight: open ? 220 : 52 }}>
              <DropDownPicker
                open={open}
                value={type}
                items={categories.map(c => ({ label: c.category, value: c.category }))}
                placeholder="Select category"
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
          </Field>

          <Field label="Description" icon="description">
            <TextInput
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              scrollEnabled={false}
              className={inputClass}
              style={{ minHeight: 90 }}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Size (small / medium / large / cm)" icon="straighten">
            <TextInput
              className={inputClass}
              value={size}
              onChangeText={setSize}
              placeholderTextColor="#D1D5DB"
            />
          </Field>

          <Field label="Price (Ksh)" icon="attach-money">
            <TextInput
              keyboardType="numeric"
              className={inputClass}
              value={price}
              onChangeText={setPrice}
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
          <Checkbox value={isChecked} onValueChange={setChecked} color={isChecked ? '#581C87' : undefined} />
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
              : <Text className="text-white font-montserrat-semibold text-sm">Save Changes</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateAd;