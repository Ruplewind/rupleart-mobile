import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState, useRef } from 'react';
import { router } from 'expo-router';
import useCart from '../context/CartContext';

const Products = ({ products, category }) => {
    const [page, setPage] = useState(0);
    const itemsPerPage = 10;
    const scrollViewRef = useRef(null); // Reference for scrolling

    const filteredData = products.filter((item) => {
        if (!category || category === "All") {
            return item;
        } else if (item.type.toLowerCase().includes(category.toLowerCase())) {
            return item;
        }
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const displayedProducts = filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const { addToCart } = useCart();

    const handlePageChange = (newPage) => {
        setPage(newPage);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true }); // Scroll to top
    };

    return (
        <ScrollView ref={scrollViewRef} className="p-4 mb-56 max-h-screen bg-white">
            <View style={styles.container}>
                {displayedProducts.map((item) => (
                    <TouchableOpacity 
                        key={item._id} 
                        style={styles.card} 
                        onPress={() => {
                            router.push({
                                pathname: "preview/[product]", 
                                params: { product: JSON.stringify(item)} // , allProducts: JSON.stringify(products) } 
                            });
                        }}
                    >
                        <Image
                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image}` }}
                            style={styles.image}
                        />
                        {/* <Text style={styles.productName}>{item.productName}</Text> */}
                        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                            {item.productName}
                        </Text>
                        <Text style={styles.price}>Ksh {item.price.toLocaleString()}</Text>
                        <TouchableOpacity 
                            style={styles.addToCartButton}
                            onPress={() => addToCart({ ...item, quantity: 1 })}
                        >
                            <Text style={styles.buttonText}>Add to Cart</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
            
            <View style={styles.paginationContainer}>
                {page > 0 && (
                    <TouchableOpacity 
                        // style={styles.paginationButtonOutline} 
                        className='border border-purple-900 p-2 rounded-lg'
                        onPress={() => handlePageChange(page - 1)}
                    >
                        <Text style={styles.paginationTextOutline}>Previous Products</Text>
                    </TouchableOpacity>
                )}
                
                {page < totalPages - 1 && (
                    <TouchableOpacity 
                        style={styles.paginationButton} 
                        onPress={() => handlePageChange(page + 1)}
                    >
                        <Text style={styles.paginationText}>Load More</Text>
                    </TouchableOpacity>
                )}
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
        width: '49%',
        backgroundColor: '#ffff',
        borderRadius: 4,
        padding: 10,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
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
        textAlign: 'center',
        marginBottom: 4,
        numberOfLines: 1, // Ensures only one line is displayed
        ellipsizeMode: 'tail', // Adds "..." if the text is too long
        overflow: 'hidden', // Prevents text from overflowing
        width: '100%', // Ensures proper width handling
    },
    price: {
        color: 'gray',
        fontSize: 12,
        textAlign: 'center',
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    paginationButton: {
        backgroundColor: '#4A148C',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    paginationButtonOutline: {
        backgroundColor: '#FFF',
        borderColor:'#4A148C',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    paginationText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    paginationTextOutline: {
        color: '#4A148C',
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default Products;
