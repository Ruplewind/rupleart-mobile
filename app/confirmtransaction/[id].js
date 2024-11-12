import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import SuccessTransaction from '../../components/SuccessTransaction';
import FailedTransaction from '../../components/FailedTransaction';

const ConfirmTransaction = () => {
  const { id } = useLocalSearchParams();

  const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/ConfirmPayment/${id}`)
        .then(res => {
            if(res.ok){
                setSuccess(true);
                setLoading(false);
            }else{
                setSuccess(false);
                setLoading(false);
            }
        })
        .catch(err =>{
            setLoading(false);
        })

    },[])
  return (
    <View>
      {
          loading && <View class="flex-row items-center justify-center h-screen mt-28">
            <ActivityIndicator color="black" size={60}/>
        </View>
      }
      {
          !loading && success && <SuccessTransaction />
      }
      {
          !loading && !success && <FailedTransaction />
      }
    </View>
  )
}

export default ConfirmTransaction