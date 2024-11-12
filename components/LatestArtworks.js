import { View, Text, FlatList, ImageBackground, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Animatable from 'react-native-animatable';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
const zoomIn = {
    0 : {
        scale: 0.9
    },
    1 : {
        scale: 1
    }
}

const zoomOut = {
    0 : {
        scale: 1
    },
    1 : {
        scale: 0.9
    }
}

const LatestItem = ({ activeItem, item, allProducts }) => {
    return (
        <Animatable.View
            style={{ marginRight: 20 }}
            animation={activeItem === item._id ? zoomIn : zoomOut}
            duration={500}
        >
            <TouchableOpacity
                style={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: 12,
                    overflow: 'hidden',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                }}
                activeOpacity={0.8}
                onPress={()=>{
                    router.push({
                        pathname: "preview/[product]", 
                        params: { product: JSON.stringify(item), allProducts: JSON.stringify(allProducts) } 
                    })
                }}
            >
                <ImageBackground
                    source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                    style={{
                        width: 148, // equivalent to 13rem
                        height: 200, // a bit shorter for a card effect
                        borderRadius: 12,
                        overflow: 'hidden',
                        justifyContent: 'flex-end',
                    }}
                    resizeMode="cover"
                >
                    <View style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: 10,
                        width: '100%',
                        alignItems: 'flex-start',
                    }}>
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: 4,
                        }}>{item.productName}</Text>
                        <Text style={{
                            color: '#f5f5f5',
                            fontSize: 12,
                        }}>Ksh. {item.price}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const LatestArtworks = ({ products }) => {

    let filteredProducts = products;

    const [activeItem, setActiveItem] = useState(filteredProducts[0]);

    useEffect(() => {
        if (filteredProducts.length > 0) {
          setActiveItem(filteredProducts[1]);
        }
      }, [filteredProducts]);

      const viewableItemsChanged = ({ viewableItems }) => {
        if(viewableItems.length > 0){
            setActiveItem(viewableItems[0].key)
        }
      }

  return (
    <View className="p-4" style={{
        backgroundColor:"#f2f2f2"
    }}>
        <Text className="text-black mb-2 text-center">Latest Artworks</Text>
        <FlatList
            style={{
                marginTop:10
            }}
            data={filteredProducts}
            horizontal
            keyExtractor={(product)=> product._id}
            renderItem={({ item }) => (
                <LatestItem activeItem={activeItem} item={item} allProducts={products}/>
            )}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={{
                itemVisiblePercentThreshold : 70
            }}
            contentOffset={{ x: 150 }}
        />
    </View>
    
  )
}

export default LatestArtworks

