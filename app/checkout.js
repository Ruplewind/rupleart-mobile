import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, FlatList } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { ToastAndroid } from 'react-native';
import { router } from 'expo-router';
import useCart from '../context/CartContext';
import { useAuthContext } from '../context/AuthProvider';
import { WebView } from 'react-native-webview';
import RNPickerSelect from 'react-native-picker-select';
import DropDownPicker from 'react-native-dropdown-picker';

const Checkout = () => {
  const { products, total } = useCart();
  const { userId, token, logout } = useAuthContext();
  const [location, setLocation] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [link, setLink] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [towns, setTowns] = useState([]);
  const [townsLoading, setTownsLoading] = useState(true);
  const [allVideos, setAllVideos] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const myRegex = /^07\d{8}$/;

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_locations`)
      .then(data => {
        if (data.ok) {
          data.json().then(res => {
            setTowns(res);
            setLocation(res[0]._id);
            setDeliveryCost(res[0].price);
            setAllVideos(products.every(item => item.title));
            setTownsLoading(false);
          });
        } else {
          setTownsLoading(false);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(data => {
        if (data.ok) return data.json();
        else if (data.status === 401) router.push('/login');
      })
      .then(data => {
        setEmail(data.email);
        setFirstName(data.first_name);
        setSecondName(data.second_name);
        setPhoneNumber(data.phoneNumber);
      })
      .catch(err => console.error(err));
  }, []);

  const checkoutSchema = yup.object({
    firstname: yup.string().required().min(3),
    secondname: yup.string().required().min(3),
    email: yup.string().email('Invalid Email').required().min(3),
    phoneNumber: yup
      .string()
      .nullable()
      .matches(myRegex, { message: 'Phone number is not valid', excludeEmptyString: true }),
    minPrice: yup.number().min(deliveryCost + total, `Minimum price is ${deliveryCost + total}`)
  });

  const handleSubmit = (data) => {
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/Checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...data, products, location })
    })
      .then(res => {
        if (res.ok) {
          res.json().then(response => {
            setLink(response.redirect_url);
            setLoading(false);
            setShowIframe(true);
          });
        } else {
          res.json().then(response => Alert.alert(response));
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(()=>{
    if(location !== null){
        const town = towns.filter( town => town._id === location);
        setDeliveryCost(town[0].price);   
    }
}, [location])

const [redirected, setRedirected] = useState(false);

const handleNavigationStateChange = (newNavState) => {
    const { url } = newNavState;
  
    if (redirected) return;  // Prevent multiple redirects
  
    if (url && url.includes('cancel')) {
      router.push("cancel");
      setRedirected(true);  // Mark as redirected
    } else if (url && url.includes('confirm')) {
      const params = new URL(url).searchParams;
      const orderMerchantReference = params.get("OrderMerchantReference");
      router.push({
        pathname: "confirmtransaction/[id]",
        query: { id: orderMerchantReference }  // Use query instead of params for Next.js routing
      });
      setRedirected(true);  // Mark as redirected
    }
  };

  const [open, setOpen] = useState(false);

  return (
      <FlatList
        scrollEnabled={true}
        className="mt-1 mb-10 p-5"
          data={[{ key: 'form' }]}
          renderItem={() => (
            <>
              {showIframe ? (
                <View style={{ flex: 1, justifyContent: 'center', marginTop: 20 }}>
                    <WebView source={{ uri: link }} style={{ height: 500, width: '100%' }} onNavigationStateChange={handleNavigationStateChange} />
                </View>
              
              ) : (
                <Formik
                  initialValues={{ firstname: firstName, secondname: secondName, email, phoneNumber, minPrice: deliveryCost + total }}
                  enableReinitialize
                  validationSchema={checkoutSchema}
                  onSubmit={values => handleSubmit(values)}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View className="w-full">
                      <Text className="font-bold mb-3 text-center mt-2">Account Information</Text>

                    <View className="flex-row gap-2"> 
                      <View className="w-1/2">
                        <TextInput
                            placeholder="First name"
                            value={values.firstname}
                            onChangeText={handleChange('firstname')}
                            onBlur={handleBlur('firstname')}
                            className="border-b p-4 mb-2"
                        />
                        {touched.firstname && errors.firstname && <Text className="text-red-500">{errors.firstname}</Text>}
                      </View>

                      <View className="w-1/2">
                        <TextInput
                            placeholder="Second name"
                            value={values.secondname}
                            onChangeText={handleChange('secondname')}
                            onBlur={handleBlur('secondname')}
                            className="border-b p-4 mb-2"
                        />
                        {touched.secondname && errors.secondname && <Text className="text-red-500">{errors.secondname}</Text>}
                      </View>
                    </View>

                      <TextInput
                        placeholder="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        className="border-b p-4 mb-2"
                      />
                      {touched.email && errors.email && <Text className="text-red-500">{errors.email}</Text>}

                      <TextInput
                        placeholder="Phone Number"
                        value={values.phoneNumber}
                        onChangeText={handleChange('phoneNumber')}
                        onBlur={handleBlur('phoneNumber')}
                        className="border-b p-4 mb-2"
                      />
                      {touched.phoneNumber && errors.phoneNumber && <Text className="text-red-500">{errors.phoneNumber}</Text>}
                      <Text className='text-blue-500 text-xs'>* Phone number is editable</Text>
                    
                    <View className="my-5">
                      <Text className="font-bold mb-5 text-center">Order Summary</Text>
                      {products.map(product => (
                        <View key={product._id} className="flex-row justify-between mb-2 mx-2">
                          <Text className="w-1/2 font-montserrat-semibold text-gray-600 text-sm">{product.productName}</Text>
                          <Text className="w-1/4 text-gray-600 text-sm">X {product.quantity}</Text>
                          <Text className="w-1/4 font-montserrat-semibold text-gray-600 text-sm" >KES. {(product.quantity * product.price).toLocaleString()}</Text>
                        </View>
                      ))}
                    </View>

                    {!allVideos && (
                        <View className="w-full">
                            <Text className="mb-2 font-montserrat-semibold">Select delivery location:</Text>
                            <View className="rounded-lg">
                            {/* <RNPickerSelect
                                value={location}
                                onValueChange={(value) => setLocation(value)}
                                items={towns.map((item) => ({
                                    label: `${item.name} - Ksh. ${item.price}`,
                                    value: item._id, // Use _id as the value, or any other identifier you prefer
                                  }))}                   
                            /> */}
                            <DropDownPicker
                                open={open}
                                value={location}
                                items={towns.map((item) => ({
                                  label: `${item.town} - Ksh. ${item.price}`,
                                  value: item._id,
                                }))}
                                setOpen={setOpen}
                                setValue={setLocation}
                                style={{
                                    borderColor:'#EEEEEE',
                                }}
                                dropDownContainerStyle={{
                                  borderColor: "#EEEEEE"
                                }}
                                zIndex={1000}
                                listMode='SCROLLVIEW'
                                // flatListProps={{
                                //   scrollEnabled: true,
                                //   nestedScrollEnabled: true
                                // }}
                                scrollViewProps={{
                                  scrollEnabled:true,
                                  nestedScrollEnabled: true
                                }}
                            />
                            </View>
                        </View>
                    )}

                    <View className="mt-5 bg-white w-full p-3 rounded-lg mb-10">
                        <View className="mt-5">
                            <View className="flex-row justify-between">
                                <Text className="font-bold">Delivery Cost:</Text>
                                <Text className="font-bold">KES {deliveryCost.toLocaleString()}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="font-bold">Total Items Cost:</Text>
                                <Text className="font-bold">KES {total.toLocaleString()}</Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="font-bold">Total Order Cost:</Text>
                                <Text className="font-bold">KES {(total +  deliveryCost).toLocaleString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-black p-2 py-4 rounded-lg flex justify-center items-center mt-5"
                        >
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white">PAY</Text>}
                        </TouchableOpacity>
                    </View>
                    </View>
                  )}
                </Formik>
              )}
            </>
          )}
      />
  );
};

export default Checkout;
