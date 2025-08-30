import { View, Text, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';

const zoomIn = {
    0: { scale: 0.9 },
    1: { scale: 1 }
};

const zoomOut = {
    0: { scale: 1 },
    1: { scale: 0.9 }
};

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
                onPress={() => {
                    router.push({
                        pathname: "preview/[product]",
                        params: { product: JSON.stringify(item) }
                    });
                }}
            >
                <ImageBackground
                    source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
                    style={{
                        width: 100,
                        height: 130,
                        borderRadius: 12,
                        overflow: 'hidden',
                        justifyContent: 'flex-end',
                    }}
                    contentFit="cover"
                >
                    <View style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: 10,
                        width: '100%',
                        alignItems: 'flex-start',
                    }}>
                        <Text style={{
                            color: '#ffffff',
                            fontSize: 10,
                            fontWeight: '600',
                            marginBottom: 4,
                        }}>{item.productName}</Text>
                        <Text style={{
                            color: '#f5f5f5',
                            fontSize: 10,
                        }}>Ksh. {item.price.toLocaleString()}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animatable.View>
    );
};

const RelatedProducts = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeItem, setActiveItem] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_approved_products`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (category && products.length > 0) {
            const related = products.filter(product => product.type === category).slice(0, 6);
            setFilteredProducts(related);
            if (related.length > 0) {
                setActiveItem(related[0]._id);
            }
        }
    }, [category, products]);

    const viewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveItem(viewableItems[0].key);
        }
    };

    return (
        <View className="p-4 px-2" style={{ backgroundColor: "#fff" }}>
            <FlatList
                style={{ marginTop: 0 }}
                data={filteredProducts}
                horizontal
                keyExtractor={(product) => product._id}
                renderItem={({ item }) => (
                    <LatestItem activeItem={activeItem} item={item} allProducts={filteredProducts} />
                )}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
                contentOffset={{ x: 150 }}
            />
        </View>
    );
};

export default RelatedProducts;
