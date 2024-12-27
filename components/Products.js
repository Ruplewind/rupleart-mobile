import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, usePathname } from 'expo-router';
import useCart from '../context/CartContext';

const Products = ({ products, category }) => {

    const filteredData = products.filter((item) => {
        if (category === '' || category === null || category == "All") {
            return item;
        } else if (item.type.toLowerCase().includes(category.toLowerCase())) {
            return item;
        }
    });

    const pathname =usePathname();

    const { addToCart } = useCart();

    return (
        <ScrollView className="p-4 mb-56 max-h-screen bg-white">
            <View style={styles.container}>
                {filteredData.map((item) => (
                    <TouchableOpacity key={item._id} style={styles.card} onPress={()=>{
                        router.push({
                            pathname: "preview/[product]", 
                            params: { product: JSON.stringify(item), allProducts: JSON.stringify(products) } 
                        })
                    }}>
                        <Image
                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                            style={styles.image}
                        />
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.price}>Ksh {item.price.toLocaleString()}</Text>
                        <TouchableOpacity 
                        style={styles.addToCartButton}
                        onPress={()=>{
                            addToCart({...item, quantity: 1})
                        }}
                        >
                            <Text style={styles.buttonText}>Add to Cart</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '49%', // Ensures two items per row
        backgroundColor: '#ffff',
        borderRadius: 4,
        padding: 10,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3, // Adds shadow on Android
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    productName: {
        color: 'black',
        fontSize: 14,
        textAlign:'center',
        marginBottom: 4,
    },
    price: {
        color: 'gray',
        fontSize: 12,
        textAlign:'center',
        marginBottom: 5,
    },
    addToCartButton: {
        backgroundColor: '#4A148C',
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Products;
