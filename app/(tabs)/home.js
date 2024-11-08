import { Link } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import Dropdown from "../../components/DropDown";

export default function Home() {
  const { logout, fullName } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

    useEffect(()=>{
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`)
        .then(res => res.json())
        .then(data => {
            setCategories(data);
            setLoading(false);
        })
        .catch(()=>{
            setError(true);
            setLoading(false);
        })
    },[])

  const [expanded, setExpanded] = useState(false);

  return (
    <View
    className="min-h-screen"

    >
      <View className="p-4 flex-row items-center bg-white">
        <Text className="text-black w-1/2">Sort By Category</Text>
        <View className="flex-row justify-end w-1/2">
          <Dropdown data={categories} onChange={(item) => {
          }}
          placeholder="All" 
          />
        </View>
        
      </View>
      
      

      <TouchableOpacity onPress={()=>{
        logout();
      }}>
          <Text className="text-white">Logout</Text>
      </TouchableOpacity>
      <StatusBar backgroundColor="#161622" style='dark' />
    </View>
  );
}
