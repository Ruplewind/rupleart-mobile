import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image'

const { width } = Dimensions.get('window');

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const data = [
    { id: '1', title: 'Slide 1', image: require('../assets/images/purple-min.jpg') },
    { id: '2', title: 'Slide 2', image: require('../assets/images/sticks-min.jpg') },
    { id: '3', title: 'Slide 3', image: require('../assets/images/sculpture-min.jpg') },
  ];

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length; // Loop back to the start
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000); // 3-second interval

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Text Overlay */}
      {/* <View style={styles.textOverlay}>
        <Text style={styles.title}>{item.title}</Text>
      </View> */}
      {/* Image */}
      <Image source={item.image} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ref={flatListRef}
      /> */}
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ref={flatListRef}
            snapToInterval={width} // Width of each item
            decelerationRate="fast"
        />

      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    slide: {
      width,
      height: 200,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      contentFit: 'cover',
    },
    textOverlay: {
      position: 'absolute',
      top: 0,
      width: '20%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    pagination: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 20,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    activeDot: {
      backgroundColor: 'gray',
    },
    inactiveDot: {
      backgroundColor: 'white',
    },
  });

export default Carousel;
