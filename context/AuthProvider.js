import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

const { createContext } = require("react");
const { useContext } = require("react");

let AuthContext = createContext();

export const  useAuthContext = () => useContext(AuthContext);
export function AuthProvider({ children }){

    const [token, setToken] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    const login = async (token, user_id, fullname) =>{
        setToken(token);
        setFullName(fullname);
        setUserId(user_id);
        await AsyncStorage.setItem('rpl$token', token)
        await AsyncStorage.setItem('rpl$userId', user_id)
        await AsyncStorage.setItem('rpl$fullname', fullname)
    }

    const logout = async ()=>{
        setToken(null);
        setUserId(null);
        setFullName(null);
        await AsyncStorage.removeItem('rpl$token')
        await AsyncStorage.removeItem('rpl$userId')
        await AsyncStorage.removeItem('rpl$fullname')
        router.push("login")
    }

    const isLoggedIn = async () => {
        setIsLoading(true);
        let savedToken = await AsyncStorage.getItem('rpl$token');
        let userId = await AsyncStorage.getItem('rpl$userId');
        let fullname = await AsyncStorage.getItem('rpl$fullname');
    
        if (savedToken) {
            setToken(savedToken);
            setFullName(fullname);
            setUserId(userId);
        } else {
            setToken(null);
        }
        setIsLoading(false); // Move this out to ensure it's always set
    }

    useEffect(()=>{
        isLoggedIn();
    },[])

    return (
        <AuthContext.Provider
            value={{
                fullName, userId, token, isLoading, login, logout
            }}
        >{ children }</AuthContext.Provider>
    )
}

