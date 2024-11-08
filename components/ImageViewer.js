import { Image, ImageSource } from 'expo-image'
import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'

export default function ImageViewer({ imgSource }) {
    return <Image source={imgSource} style={styles.image} />;
}

const styles = StyleSheet.create({
    image: {
    width: 320,
    height: 250,
    borderRadius: 18,
    },
})
