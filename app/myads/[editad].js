import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Checkbox from 'expo-checkbox';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import DropDownPicker from 'react-native-dropdown-picker';

const editad = () => {
    const { product } = useLocalSearchParams();
    const item = JSON.parse(product);

    const [image, setImage] = useState(item.image);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [productName, setProductName] = useState(item.productName);
    const [type, setType] = useState(item.type);
    const [price, setPrice] = useState(item.price);
    const [description, setDescription] = useState(item.description);
    const [size, setSize] = useState(item.size);

    const { userId, token } = useAuthContext();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(data => data.json())
            .then(data => {
              const currentCategory = { label: item.type, value: item.type };
              const updatedCategories = [currentCategory, ...data.filter(cat => cat.category !== item.type)];
              setCategories(updatedCategories.map(cat => ({
                  label: cat.category,
                  value: cat.category
              })));
            })
            .catch(err => { console.log(err) });
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleEditSubmit = () => {
        setLoading(true);

        if (!productName || price < 1 || !image || !type || !description || !size) {
            Alert.alert('All fields must be filled');
            setLoading(false);
            return;
        }

        const formData = new FormData();

        formData.append('productName', productName);
        formData.append('type', type);
        formData.append('price', price);
        formData.append('image', image);
        formData.append('description', description);
        formData.append('size', size);

        fetch(`${process.env.EXPO_PUBLIC_API_URL}/edit_product/${item.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
            .then((response) => {
                if (response.ok) {
                    setLoading(false);
                    Alert.alert("Success", "Product updated successfully.", [
                        {
                            text: "OK",
                            onPress: () => {
                                router.push({ pathname: "myads" });
                            },
                        },
                    ]);
                } else {
                    response.json().then(err => {
                        setLoading(false);
                        if (err.error === "Invalid Token") {
                            Alert.alert("Login to Continue");
                        } else {
                            Alert.alert("Failed to Update Product. Retry");
                        }
                    });
                }
            })
            .catch(() => {
                setLoading(false);
                Alert.alert("Failed to Update Product. Retry");
            });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <FlatList
                data={[{ key: 'form' }]}
                renderItem={() => (
                    <>
                        <Text className='my-4 mx-5 font-montserrat-light'>Replace Product Image:</Text>
                        {!image && <TouchableOpacity onPress={pickImage}>
                            <View className="border border-dashed border-blue-500 w-11/12 h-40 mb-5 bg-white mx-auto rounded-3xl">
                                <View className='flex-row justify-center mt-auto'>
                                    <Entypo name="upload-to-cloud" size={32} color="blue" />
                                </View>
                                <Text className='text-blue-700 mb-auto mx-auto'>Select an image</Text>
                            </View>
                        </TouchableOpacity>}

                        {image &&
                            <View className='bg-white p-2 mx-5 rounded-2xl'>
                                <Image source={{ uri: `https://api.rupleart.com/uploads/${image}` }} style={{ width: '95%', height: 110, margin: 'auto', borderRadius: 10, objectFit: 'contain' }} />
                            </View>
                        }
                        {image && <Button title="Replace Image" onPress={pickImage} />}

                        <Text className='my-2 mx-5 font-montserrat-light'>Product Title:</Text>
                        <TextInput className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white' onChangeText={setProductName} value={productName} />

                        <Text className='my-2 mx-5 mb-1 font-montserrat-light'>Select Category:</Text>
                        <View className='mx-3'>
                            {categories.length < 1 && <Text className='text-black bg-white my-2 border border-gray-200 px-2 py-3 rounded-lg'>Loading...</Text>}
                            {categories.length > 0 &&
                                <DropDownPicker
                                    open={open}
                                    value={type}
                                    items={categories}
                                    setOpen={setOpen}
                                    setValue={setType}
                                    style={{
                                        borderColor: '#EEEEEE',
                                    }}
                                    placeholder="Select a Category"
                                />
                            }
                        </View>

                        <Text className='my-2 mx-5 font-montserrat-light'>Description:</Text>
                        <TextInput className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white' onChangeText={setDescription} value={description} />

                        <Text className='my-2 mx-5 font-montserrat-light'>Size (in cm):</Text>
                        <TextInput className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white' onChangeText={setSize} value={size} />

                        <Text className='my-2 mx-5 font-montserrat-light'>Price:</Text>
                        <TextInput keyboardType='numeric' className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black' onChangeText={setPrice} value={price.toString()} />

                        <View className='w-full flex-row justify-center gap-10 mt-5 mb-20'>
                            <TouchableOpacity
                                className='border border-purple-900 px-4 py-3 rounded-lg bg-white'
                                onPress={() => {
                                    router.push({ pathname: "myads" });
                                }}
                            >
                                <Text className='text-purple-900'>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='bg-purple-900 py-3 px-4 rounded-lg'
                                onPress={handleEditSubmit}
                            >
                                {loading ? <ActivityIndicator color={"white"} size={20} /> : <Text className='text-white'>Submit</Text>}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            />
        </KeyboardAvoidingView>
    );
};

export default editad;
