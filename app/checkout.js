import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { router } from 'expo-router';
import useCart from '../context/CartContext';
import { useAuthContext } from '../context/AuthProvider';
import { WebView } from 'react-native-webview';
import DropDownPicker from 'react-native-dropdown-picker';

const Checkout = () => {
  const { products, total } = useCart();
  const { token } = useAuthContext();
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
  const [redirected, setRedirected] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (location !== null) {
      const town = towns.find(town => town._id === location);
      if (town) setDeliveryCost(town.price);
    }
  }, [location]);

  const handleNavigationStateChange = (newNavState) => {
    const { url } = newNavState;

    if (redirected) return;

    if (url && url.includes('cancel')) {
      router.push("cancel");
      setRedirected(true);
    } else if (url && url.includes('confirm')) {
      const params = new URL(url).searchParams;
      const orderMerchantReference = params.get("OrderMerchantReference");
      router.push({
        pathname: "confirmtransaction/[id]",
        query: { id: orderMerchantReference }
      });
      setRedirected(true);
    }
  };

  return (
    <FlatList
      scrollEnabled
      className="mt-1 mb-10 p-4 bg-gray-100"
      data={[{ key: 'form' }]}
      renderItem={() => (
        <>
          {showIframe ? (
            <View className="flex-1 justify-center mt-5">
              <WebView
                source={{ uri: link }}
                style={{ height: 500, width: '100%' }}
                onNavigationStateChange={handleNavigationStateChange}
              />
            </View>
          ) : (
            <Formik
              initialValues={{
                firstname: firstName,
                secondname: secondName,
                email,
                phoneNumber,
                minPrice: deliveryCost + total
              }}
              enableReinitialize
              validationSchema={checkoutSchema}
              onSubmit={values => handleSubmit(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View className="w-full">
                  {/* Header */}
                  {/* <View className="bg-blue-900 p-4 rounded-lg mb-4">
                    <Text className="text-white text-lg font-bold text-center">Checkout</Text>
                  </View> */}

                  {/* Account Info */}
                  <Text className="font-bold mb-3 text-center text-lg text-gray-700">Account Information</Text>

                  <View className="flex-row gap-2">
                    <View className="w-1/2">
                      <TextInput
                        placeholder="First name"
                        value={values.firstname}
                        onChangeText={handleChange('firstname')}
                        onBlur={handleBlur('firstname')}
                        className="border border-gray-300 rounded-lg p-4 mb-2 text-black bg-white"
                      />
                      {touched.firstname && errors.firstname && <Text className="text-red-500">{errors.firstname}</Text>}
                    </View>

                    <View className="w-1/2">
                      <TextInput
                        placeholder="Second name"
                        value={values.secondname}
                        onChangeText={handleChange('secondname')}
                        onBlur={handleBlur('secondname')}
                        className="border border-gray-300 rounded-lg p-4 mb-2 text-black bg-white"
                      />
                      {touched.secondname && errors.secondname && <Text className="text-red-500">{errors.secondname}</Text>}
                    </View>
                  </View>

                  <TextInput
                    placeholder="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    className="border border-gray-300 rounded-lg p-4 mb-2 bg-white text-black"
                  />
                  {touched.email && errors.email && <Text className="text-red-500">{errors.email}</Text>}

                  <TextInput
                    placeholder="Phone Number"
                    value={values.phoneNumber}
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    className="border border-gray-300 rounded-lg p-4 mb-2 bg-white text-black"
                  />
                  {touched.phoneNumber && errors.phoneNumber && <Text className="text-red-500">{errors.phoneNumber}</Text>}
                  <Text className='text-blue-900 text-xs mb-3'>* Phone number is editable</Text>

                  {/* Order Summary */}
                  <View className="bg-white rounded-lg shadow p-4 mb-4">
                    <Text className="font-bold mb-3 text-center text-gray-700">Order Summary</Text>
                    {products.map(product => (
                      <View key={product._id} className="flex-row justify-between mb-2">
                        <Text className="w-1/2 text-gray-600 text-sm">{product.productName}</Text>
                        <Text className="w-1/4 text-gray-600 text-sm">X {product.quantity}</Text>
                        <Text className="w-1/4 text-gray-800 font-bold text-sm">KES {(product.quantity * product.price).toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Delivery Location */}
                  {!allVideos && (
                    <View className="mb-4">
                      <Text className="mb-2 font-semibold text-gray-700">Select delivery location:</Text>
                      <DropDownPicker
                        open={open}
                        value={location}
                        items={towns.map((item) => ({
                          label: `${item.town} - Ksh. ${item.price}`,
                          value: item._id,
                        }))}
                        setOpen={setOpen}
                        setValue={setLocation}
                        style={{ borderColor: '#FACC15', backgroundColor: '#FAF3C7' }}
                        dropDownContainerStyle={{ borderColor: "#EEEEEE", backgroundColor: '#FAF3C7' }}
                        zIndex={1000}
                        listMode='SCROLLVIEW'
                        scrollViewProps={{
                          scrollEnabled: true,
                          nestedScrollEnabled: true
                        }}
                      />
                    </View>
                  )}

                  {/* Delivery Summary */}
                  <View className="bg-white p-4 rounded-lg shadow">
                    <Text className="text-gray-700 font-bold mb-2 text-center">Price Summary</Text>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-600">Delivery Cost:</Text>
                      <Text className="font-bold">KES {deliveryCost.toLocaleString()}</Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-600">Total Items:</Text>
                      <Text className="font-bold">KES {total.toLocaleString()}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="font-bold">Total:</Text>
                      <Text className="font-bold text-blue-900">KES {(total + deliveryCost).toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Pay Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-purple-900 p-4 rounded-lg mt-5 flex justify-center items-center"
                  >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">PAY NOW</Text>}
                  </TouchableOpacity>
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
