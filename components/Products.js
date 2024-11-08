import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';

const Products = ({ category }) => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_approved_products`)
            .then((res) => res.json())
            .then((res) => {
                setProducts(res);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
                setError(true);
            });
    }, []);

    const filteredData = products.filter((item) => {
        if (category === '' || category === null || category == "All") {
            return item;
        } else if (item.type.toLowerCase().includes(category.toLowerCase())) {
            return item;
        }
    });

    return (
        <ScrollView className="p-4 mb-56 max-h-screen bg-white">
            <View style={styles.container}>
                {filteredData.map((item) => (
                    <TouchableOpacity key={item._id} style={styles.card}>
                        <Image
                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                            style={styles.image}
                        />
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.price}>Ksh {item.price}</Text>
                        <TouchableOpacity style={styles.addToCartButton}>
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
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3, // Adds shadow on Android
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    productName: {
        color: 'black',
        fontSize: 16,
        textAlign:'center',
        marginBottom: 4,
    },
    price: {
        color: 'gray',
        fontSize: 14,
        textAlign:'center',
        marginBottom: 8,
    },
    addToCartButton: {
        backgroundColor: '#4A148C',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default Products;
