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
import { Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Checkbox from 'expo-checkbox';
import { Link, router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import DropDownPicker from 'react-native-dropdown-picker';

const postad = () => {
  const [images, setImages] = useState([]);
  const [isChecked, setChecked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState(null);
  const [type, setType] = useState(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState(null);
  const [size, setSize] = useState(null);

  const { userId, token } = useAuthContext();

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => data.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      //mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setLoading(true);

    if (
      productName == null ||
      productName.length < 1 ||
      price < 1 ||
      images.length === 0 ||
      type == null ||
      size == null ||
      description == null
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

    images.forEach((imgUri, index) => {
      const fileType = imgUri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const extension = imgUri.endsWith('.png') ? 'png' : 'jpeg';
      formData.append('image', {
        uri: imgUri,
        name: `product_image_${index}.${extension}`,
        type: fileType,
      });
    });

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/add_product`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          setLoading(false);
          Alert.alert('Success', 'Your Ad Has Been Posted. Await Verification.', [
            {
              text: 'OK',
              onPress: () => {
                router.push({
                  pathname: 'myads',
                });
              },
            },
          ]);
        } else {
          response.json().then((err) => {
            setLoading(false);
            Alert.alert('Failed to Submit. Retry');
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert('Failed to Submit. Retry');
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
            <Text className="my-4 mx-5 font-montserrat-light">Upload Product Images:</Text>

            <TouchableOpacity onPress={pickImage}>
              <View className="border border-dashed border-blue-500 w-11/12 h-40 mb-5 bg-white mx-auto rounded-3xl flex justify-center items-center">
                <Entypo name="upload-to-cloud" size={32} color="blue" />
                <Text className="text-blue-700 text-center">Select Images</Text>
              </View>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal style={{ marginHorizontal: 15 }}>
                {images.map((img, index) => (
                  <View key={index} style={{ marginRight: 10 }}>
                    <Image
                      source={{ uri: img }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            {images.length > 0 && <Button title="Replace Images" onPress={pickImage} />}

            <Text className="my-2 mx-5 font-montserrat-light">Product Title:</Text>
            <TextInput
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
              onChangeText={setProductName}
            />

            <Text className="my-2 mx-5 mb-1 font-montserrat-light">Select Category:</Text>
            <View className="mx-3">
              {categories.length < 1 && (
                <Text className="text-black bg-white my-2 border border-gray-200 px-2 py-3 rounded-lg">
                  Loading...
                </Text>
              )}
              {categories.length > 0 && (
                <DropDownPicker
                  open={open}
                  value={type}
                  items={categories.map((item) => ({
                    label: `${item.category}`,
                    value: item.category,
                  }))}
                  placeholder="Select category"
                  setOpen={setOpen}
                  setValue={setType}
                  style={{
                    borderColor: '#EEEEEE',
                  }}
                  dropDownContainerStyle={{
                    borderColor: '#EEEEEE',
                  }}
                  zIndex={1000}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    scrollEnabled: true,
                    nestedScrollEnabled: true,
                  }}
                  dropDownDirection='BOTTOM'
                />
              )}
            </View>

            <Text className="my-2 mx-5 font-montserrat-light">Description:</Text>
            <TextInput
              editable
              multiline={true}
              numberOfLines={4}
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white h-18 text-black"
              onChangeText={setDescription}
            />

            <Text className="my-2 mx-5 font-montserrat-light">Size (small/medium/large/cm):</Text>
            <TextInput
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
              onChangeText={setSize}
            />

            <Text className="my-2 mx-5 font-montserrat-light">Price:</Text>
            <TextInput
              placeholder="0"
              keyboardType="numeric"
              className="border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black"
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
                onPress={() => {
                  router.push({
                    pathname: 'myads',
                  });
                }}
              >
                <Text className="text-purple-900">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-purple-900 py-3 px-4 rounded-lg"
                onPress={() => {
                  handleSubmit();
                }}
              >
                {loading ? (
                  <ActivityIndicator color={'white'} size={20} />
                ) : (
                  <Text className="text-white">Submit</Text>
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
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    margin: 8,
  },
});

export default postad;