import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, FlatList, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import Checkbox from 'expo-checkbox';
import { Link, router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import RNPickerSelect from 'react-native-picker-select';
import DropDownPicker from 'react-native-dropdown-picker';
import { setLocale } from 'yup';

const postad = () => {
    const [image, setImage] = useState(null);
    const [isChecked, setChecked] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);;

    const [productName, setProductName] = useState(null);
    const [type, setType] = useState(null);
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState(null);
    const [size, setSize] = useState(null);

    const { userId, token } = useAuthContext();

    useEffect(()=>{
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`,{
        headers: {
            'Authorization':`Bearer ${token}`
        }
        })
        .then( data => data.json())
        .then( data => {
            setCategories(data)
        } )
        .catch( err => { console.log(err) })
    },[])

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };

      
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setLoading(true);

    if(productName == null || productName.length < 1 || price < 1 || image == null || type == null || size == null || description == null){
        Alert.alert('All fields must be filled')
        setLoading(false);
        return
    }

    if(!isChecked){
        Alert.alert('Terms and conditions must be checked');
        setLoading(false);
        return
    }

    const formData = new FormData();

    formData.append('productName', productName);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('image', {
        uri: image,
        name: 'product_image.jpg',
        type: 'image/jpeg',
    });
    formData.append('description', description);
    formData.append('size', size);

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/add_product`,{
        method: 'POST',
        headers: {
          'Authorization':`Bearer ${token}`
        },
        body: formData
    })
    .then((response)=>{
        if(response.ok){
            setLoading(false);
            Alert.alert(
                "Success",
                "Your Ad Has Been Posted. Await Verification.",
                [
                {
                    text: "OK",
                    onPress: () => {
                    router.push({
                        pathname: "myads"
                    })
                    },
                },
                ],
                { cancelable: false }
            );
        }else{
          response.json().then( err => {      
            setLoading(false);
            Alert.alert("Failed to Submit. Retry")
          })
        }
    })
    .catch((err)=>{   
        setLoading(false);
        Alert.alert("Failed to Submit. Retry")
    })
}


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <FlatList
    data={[{ key: 'form' }]}
    renderItem={() => (
      <>
      <Text className='my-4 mx-5 font-montserrat-light'>Upload Product Image:</Text>
      {!image && <TouchableOpacity onPress={pickImage}>
        <View className="border border-dashed border-blue-500 w-11/12 h-40 mb-5 bg-white mx-auto rounded-3xl">
            <View className='flex-row justify-center mt-auto'>
                <Entypo name="upload-to-cloud" size={32} color="blue" />
            </View>
            <Text className='text-blue-700 mb-auto mx-auto text-center'>Select an image</Text>
        </View>
      </TouchableOpacity> }

      { image && 
      <View className='bg-white p-2 mx-5 rounded-2xl'>
        <Image source={{ uri: image }} style={{ width: '95%', height:110, margin:'auto', borderRadius:10, objectFit:'contain'}} />
      </View>
      }
      { image && <Button title="Replace Image" onPress={pickImage} /> }

      <Text className='my-2 mx-5 font-montserrat-light'>Product Title:</Text>
      <TextInput className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white' onChangeText={setProductName} />

      <Text className='my-2 mx-5 mb-1 font-montserrat-light'>Select Category:</Text>
      <View className='mx-3'>
        { categories.length < 1 && <Text className='text-black bg-white my-2 border border-gray-200 px-2 py-3 rounded-lg'>Loading...</Text>}
        { categories.length > 0 && 
            <DropDownPicker
                open={open}
                value={type}
                items={categories.map((item) => ({
                        label: `${item.category}`,
                        value: item.category
                    }))}
                placeholder="Select category"
                setOpen={setOpen}
                setValue={setType}
                //   setItems={setItems}
                style={{
                  borderColor:'#EEEEEE',
                }}
                dropDownContainerStyle={{
                  borderColor: "#EEEEEE"
                }}
                zIndex={1000}
                listMode='SCROLLVIEW'
                scrollViewProps={{
                  scrollEnabled:true,
                  nestedScrollEnabled: true
                }}
            />
        }      
      </View> 

      <Text className='my-2 mx-5 font-montserrat-light'>Description:</Text>
      <TextInput
        editable
        multiline={true}
        numberOfLines={4} 
        className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white h-18' 
        onChangeText={setDescription} 
      />

      <Text className='my-2 mx-5 font-montserrat-light'>Size (in cm):</Text>
      <TextInput className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white' onChangeText={setSize} />

      <Text className='my-2 mx-5 font-montserrat-light'>Price:</Text>
      <TextInput placeholder='0' keyboardType='numeric' className='border border-gray-200 p-2 py-3 mx-3 rounded-lg bg-white text-black' onChangeText={setPrice} />

      <View style={styles.section}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
        <Text className='text-sm'>I have read the terms and conditions. If not, read <Link className='text-blue-400' href={"https://rupleart.com/terms"}>here</Link></Text>
      </View>


      <View className='w-full flex-row justify-center gap-10 mt-5 mb-20'>
        <TouchableOpacity 
        className='border border-purple-900 px-4 py-3 rounded-lg bg-white'
        onPress={()=>{
            router.push({
                pathname:"myads"
            })
        }}
        >
            <Text className='text-purple-900'>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        className='bg-purple-900 py-3 px-4 rounded-lg'
        onPress={()=>{
            handleSubmit();
        }}
        >
            { loading ? <ActivityIndicator color={"white"} size={20} /> : <Text className='text-white'>Submit</Text> }
        </TouchableOpacity>
      </View>
        
      </>
    )}
  />      
      

    </KeyboardAvoidingView>
  )
}

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

export default postad