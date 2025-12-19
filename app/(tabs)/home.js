import { Link } from "expo-router";
import { ActivityIndicator, FlatList, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { Text, View } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import Dropdown from "../../components/DropDown";
import Products from "../../components/Products";
import LatestArtworks from "../../components/LatestArtworks";
import DropDownPicker from "react-native-dropdown-picker";
import Carousel from "../../components/Carousel";

export default function Home() {
  const { logout, fullName } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const colorScheme = useColorScheme();

    useEffect(()=>{
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_categories`)
      .then(res => res.json())
      .then(data => {
          setCategories(data);
          setLoading(false);
      })
      .catch(()=>{
          setLoading(false);
          setError(true);
      })
  },[])

  useEffect(()=>{
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_approved_products`)
      .then((res)=> res.json())
      .then((res)=>{
          let data = res.reverse()
          setProducts(data);
          setLoading(false);
      })
      .catch(err => {
          setLoading(false);
          setError(true)
      })
  },[])

  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <ScrollView
    className="flex-1"
    >
      {
        !loading && error && <Text className="mt-10 text-center font-montserrat-light text-sm">Error Fetching Data. Relaunch app.</Text>
      }
      {
        !error && loading && <ActivityIndicator color="black" size={20} style={{ marginTop: 28 }} />
      }
      { !error && !loading && <>
        {/* <LatestArtworks products={products.slice(0,10).reverse()} />     */}

        <Carousel />
        
        <View className="p-4 flex-row items-center bg-white text-xs">
          <Text className="text-black w-1/2">Sort By Category</Text>
          <View className="flex-row justify-end w-1/2">
            {/* <Dropdown data={[{ _id:1, category: "All"}, ...categories,]} onChange={(item) => {
              setSelectedCategory(item.category);
            }}
            placeholder="All" 
            /> */}
            <DropDownPicker
                open={open}
                value={selectedCategory}
                items={[
                    { label: "All", value: "All" },
                    ...categories.map((item) => ({
                        label: item.category,
                        value: item.category
                    }))
                ]}
                placeholder="Select category"
                setOpen={setOpen}
                setValue={setSelectedCategory}
                //   setItems={setItems}
                style={{
                    borderColor:'#EEEEEE',
                    padding:4
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
                dropDownDirection='BOTTOM'
            />
          </View>
        </View>

        <Products products={products} category={selectedCategory} className=""/>
      </> }
      {/* <StatusBar style={colorScheme === 'dark' ? 'dark' : 'dark'} /> */}
      {/* <StatusBar backgroundColor="#" style='da' /> */}
    </ScrollView>
  );
}
