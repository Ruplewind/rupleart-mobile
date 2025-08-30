import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Checkbox from 'expo-checkbox';
import { Link, router, useLocalSearchParams } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuthContext } from '../../../context/AuthProvider';

const updatead = () => {
  const { product } = useLocalSearchParams();
  const data = JSON.parse(decodeURIComponent(product));
  const { userId, token } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState(data.productName);
  const [type, setType] = useState(data.type);
  const [price, setPrice] = useState(data.price.toString());
  const [description, setDescription] = useState(data.description);
  const [size, setSize] = useState(data.size);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(data.image || []); // from DB
  const [open, setOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => data.json())
      .then((data) => setCategories(data))
      .catch((err) => console.log(err));
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = () => {
    setLoading(true);

    if (
      productName.trim().length < 1 ||
      price < 1 ||
      type == null ||
      size == null ||
      description.trim().length < 1
    ) {
      Alert.alert('All fields must be filled');
      setLoading(false);
      return;
    }

    if (!isChecked) {
      Alert.alert('Terms and conditions must be checked');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('size', size);

    // Append old images (as strings)
    existingImages.forEach((img) => {
      formData.append('image', img);
    });

    // Append new images (as files)
    images.forEach((imgUri, index) => {
      const fileType = imgUri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const extension = imgUri.endsWith('.png') ? 'png' : 'jpeg';
      formData.append('image', {
        uri: imgUri,
        name: `product_image_${index}.${extension}`,
        type: fileType,
      });
    });

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/edit_product/${data._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setLoading(false);
          Alert.alert('Success', 'Your Ad Has Been Updated. Await Verification.', [
            {
              text: 'OK',
              onPress: () => {
                router.push('myads');
              },
            },
          ]);
        } else {
          setLoading(false);
          Alert.alert('Failed to Update. Retry');
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        Alert.alert('Failed to Update. Retry');
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <FlatList
        data={[{ key: 'form' }]}
        renderItem={() => (
          <>
            <Text className="my-4 mx-5 font-montserrat-light">Update Product Images:</Text>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <ScrollView horizontal style={{ marginHorizontal: 15, marginBottom: 10 }}>
                {existingImages.map((img, index) => (
                  <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                    <Image
                      source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${img}` }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red' }}
                      onPress={() => removeExistingImage(index)}
                    >
                      <Entypo name="cross" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <ScrollView horizontal style={{ marginHorizontal: 15 }}>
                {images.map((img, index) => (
                  <View key={index} style={{ marginRight: 10, position: 'relative' }}>
                    <Image
                      source={{ uri: img }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red' }}
                      onPress={() => removeNewImage(index)}
                    >
                      <Entypo name="cross" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity onPress={pickImage}>
              <View className="border border-dashed border-blue-500 w-11/12 h-20 mb-5 bg-white mx-auto rounded-3xl flex justify-center items-center mt-2">
                <Entypo name="upload-to-cloud" size={20} color="blue" />
                <Text className="text-blue-700 text-center">
                  {images.length > 0 ? 'Add More Images' : 'Select Images'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Product Details */}
            <Text className="my-2 mx-5 font-montserrat-light">Product Title:</Text>
            <TextInput
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
              value={productName}
              onChangeText={setProductName}
            />

            <Text className="my-2 mx-5 mb-1 font-montserrat-light text-black">
              Current Category:
              <Text className="text-purple-900 font-montserrat-bold"> {data.type}</Text>
            </Text>
            <View className="mx-3">
              <DropDownPicker
                open={open}
                value={type}
                items={categories.map((item) => ({
                  label: `${item.category}`,
                  value: item.category,
                }))}
                placeholder="Select New Category"
                setOpen={setOpen}
                setValue={setType}
                style={{
                  borderColor: '#EEEEEE',
                }}
                dropDownContainerStyle={{
                  borderColor: '#EEEEEE',
                }}
                zIndex={1000}
              />
            </View>

            <Text className="my-2 mx-5 font-montserrat-light">Description:</Text>
            <TextInput
              editable
              multiline={true}
              numberOfLines={4}
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white h-18 text-black"
              value={description}
              onChangeText={setDescription}
            />

            <Text className="my-2 mx-5 font-montserrat-light">Size (small/medium/large/cm):</Text>
            <TextInput
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
              value={size}
              onChangeText={setSize}
            />

            <Text className="my-2 mx-5 font-montserrat-light">Price:</Text>
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
              value={price}
              onChangeText={setPrice}
            />

            <View style={styles.section}>
              <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
              <Text className="text-sm">
                I have read the terms and conditions. If not, read{' '}
                <Link className="text-blue-400" href={'https://rupleart.com/terms'}>
                  here
                </Link>
              </Text>
            </View>

            <View className="w-full flex-row justify-center gap-10 mt-5 mb-20">
              <TouchableOpacity
                className="border border-purple-900 px-4 py-3 rounded-lg bg-white"
                onPress={() => router.push('myads')}
              >
                <Text className="text-purple-900">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-purple-900 py-3 px-4 rounded-lg"
                onPress={handleSubmit}
              >
                {loading ? (
                  <ActivityIndicator color={'white'} size={20} />
                ) : (
                  <Text className="text-white">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    margin: 8,
  },
});

export default updatead;
