import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import useCart from '../context/CartContext';

const Products = ({ products, category, scrollViewRef }) => {
    const [page, setPage] = useState(0);
    const itemsPerPage = 50;

    // Reset page number when category changes
    useEffect(() => {
        setPage(0);
    }, [category]);

    const filteredData = products.filter((item) => {
        if (!category || category === "All") {
            return true;
        } else {
            return item.type.toLowerCase().includes(category.toLowerCase());
        }
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const displayedProducts = filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const { addToCart } = useCart();

    const handlePageChange = (newPage) => {
        setPage(newPage);
        scrollViewRef.current.scrollTo({ x:0, y: 0, animated: true }); // Scroll to top
    };

    return (
        <ScrollView className="p-4 mb-56 max-h-screen bg-white">

            {/* <View style={styles.paginationContainerTop}>
                {page > 0 && (
                    <Pressable 
                        className='border border-purple-900 p-2 rounded-lg'
                        onPress={() => handlePageChange(page - 1)}
                    >
                        <Text style={styles.paginationTextOutline}>Previous Products</Text>
                    </Pressable>
                )}
                
                {page < totalPages - 1 && (
                    <Pressable 
                        style={styles.paginationButton} 
                        onPress={() => handlePageChange(page + 1)}
                    >
                        <Text style={styles.paginationText}>Load More</Text>
                    </Pressable>
                )}
            </View> */}

            <View style={styles.container}>
                {displayedProducts.map((item) => (
                    <Pressable 
                        key={item._id} 
                        style={styles.card} 
                        onPress={() => {
                            router.push({
                                pathname: "preview/[product]", 
                                params: { product: JSON.stringify(item) } // , allProducts : JSON.stringify(products) }
                            });
                        }}
                    >
                        <Image
                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.image[0]}` }}
                            style={styles.image}
                        />
                        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
                            {item.productName}
                        </Text>
                        <Text style={styles.price}>Ksh {item.price.toLocaleString()}</Text>
                        <Pressable 
                            style={styles.addToCartButton}
                            onPress={() => addToCart({ ...item, quantity: 1 })}
                        >
                            <Text style={styles.buttonText}>Add to Cart</Text>
                        </Pressable>
                    </Pressable>
                ))}
            </View>

            <View style={styles.paginationContainer}>
                {page > 0 && (
                    <Pressable 
                        className='border border-purple-900 p-2 rounded-lg'
                        onPress={() => handlePageChange(page - 1)}
                    >
                        <Text style={styles.paginationTextOutline}>Previous Products</Text>
                    </Pressable>
                )}
                
                {page < totalPages - 1 && (
                    <Pressable 
                        style={styles.paginationButton} 
                        onPress={() => handlePageChange(page + 1)}
                    >
                        <Text style={styles.paginationText}>Load More</Text>
                    </Pressable>
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
    paginationContainerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    paginationButton: {
        backgroundColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    paginationText: {
        color: 'white',
        fontSize: 13,
        fontWeight: 'bold',
    },
    paginationTextOutline: {
        color: '#4A148C',
        fontSize: 13,
        fontWeight: 'bold',
    }
});

export default Products;
