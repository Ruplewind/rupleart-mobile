import { Image } from 'expo-image'
import React, { Component } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import ImageViewer from '@/components/ImageViewer';
import { SplashScreen } from 'expo-router';

// const Placeholderimage = require('@/assets/images/profile-img.png')

SplashScreen.preventAutoHideAsync();

export default function ProfileScreen() {
    return (
      <View style={styles.container}>
        <Text>Profile</Text>
        <View style={styles.imageContainer}>
          {/* <ImageViewer imgSource={Placeholderimage} /> */}
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
            <Text style={styles.buttonLabel}>Test Button</Text>
          </Pressable>
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    objectFit: 'contain',
  },
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
