import { Link } from "expo-router";
import { FlatList, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import Dropdown from "../../components/DropDown";
import Products from "../../components/Products";

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
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <View
    className="flex-1"
    >
      <View className="p-4 flex-row items-center bg-white">
        <Text className="text-black w-1/2">Sort By Category</Text>
        <View className="flex-row justify-end w-1/2">
          <Dropdown data={[{ _id:1, category: "All"}, ...categories,]} onChange={(item) => {
            setSelectedCategory(item.category);
          }}
          placeholder="All" 
          />
        </View>
      </View>

      <Products category={selectedCategory} className=""/>
      
      <StatusBar backgroundColor="#161622" style='dark' />
    </View>
  );
}
