import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { Alert } from "react-native";
import Reducer, { initialState } from "../utils/Reducer";

const CartContext =  createContext(initialState);

const buildCartItemId = (product) =>
    product.color ? `${product._id}-${product.color}` : `${product._id}`;

export const CartProvider = ({ children, navigation }) =>{
    const [state, dispatch] = useReducer(Reducer, initialState);

    useEffect(() => {
        const fetchCart = async () => {
          const storedState = await AsyncStorage.getItem('state');
          if (storedState) {
            dispatch({ type: 'SET_STATE', payload: JSON.parse(storedState) });
          }
        };
        fetchCart();
      }, []);

    const addToCart = (product) =>{

        const cartItemId = buildCartItemId(product);
        const itemIndex = state.products.findIndex(item => item.cartItemId === cartItemId);

        if(itemIndex >= 0){ // Existing product + color combo
            if(product.quantity == 1){
                state.products[itemIndex].quantity += 1;
                updatedPrice(state.products);
            }else{
                state.products[itemIndex].quantity += product.quantity;
                updatedPrice(state.products);
            }

            dispatch({
                type:"ADD_TO_CART",
                payload: {
                    products: state.products
                }
            })
        }else{
            let newProduct = {}

            if(product.quantity > 1){
                newProduct = {...product, quantity: product.quantity, cartItemId}
            }else{
                newProduct = {...product, quantity: 1, cartItemId}
            }

            const updatedCart = state.products.concat(newProduct);

            updatedPrice(updatedCart);

            dispatch({
                type:"ADD_TO_CART",
                payload: {
                    products: updatedCart
                }
            })
        }

        Alert.alert('Success','Product Has Been Added To Cart',[
            { text: 'OK', onPress: ()=>{} }
        ])

    }

    const addQuantity = (cartItemId) =>{
        const itemIndex = state.products.findIndex(item => item.cartItemId === cartItemId);

        if(itemIndex >= 0){
            state.products[itemIndex].quantity += 1;
        }

        updatedPrice(state.products);
    }

    const minusQuantity = (cartItemId) =>{
        const itemIndex = state.products.findIndex(item => item.cartItemId === cartItemId);

        if(itemIndex >= 0){
            if(state.products[itemIndex].quantity > 1){
                state.products[itemIndex].quantity -= 1;
            }
        }

        updatedPrice(state.products);
    }

    const removeFromCart = (product) =>{
        const updatedCart = state.products.filter(currentProduct =>
            currentProduct.cartItemId !== product.cartItemId
        )

        updatedPrice(updatedCart);

        dispatch({
            type:"REMOVE_FROM_CART",
            payload: {
                products: updatedCart
            }
        })
    }

    const updatedPrice = (products) =>{
        let total = 0;

        products.forEach(product => total += (Number(product.price) * product.quantity))

        dispatch({
            type: "UPDATE_PRICE",
            payload: {
                total: total
            }
        })
    }

    const updateCounty = (county) =>{
        dispatch({
            type: "ADD_DELIVERY_COUNTY",
            payload: {
                deliveryCounty: county
            }
        })
    }

    const updatePickup = (pickup) =>{
        dispatch({
            type: "ADD_PICKUP_POINT",
            payload: {
                pickupPoint: pickup
            }
        })
    }

    const clearState = () => {
        dispatch({
            type: "CLEAR_STATE",
            payload: {}
        })
    }

    const value = {
        total: state.total,
        products: state.products,
        deliveryCounty: state.deliveryCounty,
        pickupPoint: state.pickupPoint,
        addToCart,
        minusQuantity,
        addQuantity,
        removeFromCart,
        updateCounty,
        updatePickup,
        clearState
    }

    return <CartContext.Provider value={value}>
        { children }
    </CartContext.Provider>
}

const useCart = () =>{
    const context = useContext(CartContext);

    if (context === 'undefined'){
        throw new Error("useart must be used within CartContext")
    }

    return context;
}

export default useCart;