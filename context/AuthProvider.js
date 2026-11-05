import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

let AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }){

    const [token, setToken] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [userId, setUserId] = useState(null);
    const [canPostAds, setCanPostAds] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Updates state and the cached copy together
    const updateCanPostAds = async (value) => {
        const allowed = value === true;
        setCanPostAds(allowed);
        await AsyncStorage.setItem('rpl$canPostAds', String(allowed));
    }

    const login = async (token, user_id, fullname, canPost = false) =>{
        setToken(token);
        setFullName(fullname);
        setUserId(user_id);
        setCanPostAds(canPost === true);
        await AsyncStorage.setItem('rpl$token', token)
        await AsyncStorage.setItem('rpl$userId', user_id)
        await AsyncStorage.setItem('rpl$fullname', fullname)
        await AsyncStorage.setItem('rpl$canPostAds', String(canPost === true))
    }

    const logout = async ()=>{
        setToken(null);
        setUserId(null);
        setFullName(null);
        setCanPostAds(false);
        await AsyncStorage.multiRemove([
            'rpl$token',
            'rpl$userId',
            'rpl$fullname',
            'rpl$canPostAds',
        ]);

        setTimeout(() => {
            router.replace('/home');
        }, 0);
    }

    const isLoggedIn = async () => {
        setIsLoading(true);
        let savedToken = await AsyncStorage.getItem('rpl$token');
        let userId = await AsyncStorage.getItem('rpl$userId');
        let fullname = await AsyncStorage.getItem('rpl$fullname');
        let cachedCanPost = await AsyncStorage.getItem('rpl$canPostAds');

        if (savedToken) {
            setToken(savedToken);
            setFullName(fullname);
            setUserId(userId);
            setCanPostAds(cachedCanPost === 'true');
        } else {
            setToken(null);
        }
        setIsLoading(false);
    }

    useEffect(()=>{
        isLoggedIn();
    },[])

    // Re-check the permission with the server, so grants and revocations
    // apply without logging in again
    useEffect(()=>{
        if (!token) return;
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(profile => { if (profile) updateCanPostAds(profile.canPostAds); })
            .catch(() => {}) // offline: keep the cached value
    },[token])

    return (
        <AuthContext.Provider
            value={{
                fullName, userId, token, canPostAds, isLoading,
                login, logout, updateCanPostAds
            }}
        >{ children }</AuthContext.Provider>
    )
}