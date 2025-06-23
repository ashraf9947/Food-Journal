import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bgImage from '../assets/its-decision-time.android.png';

export default function DecisionScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const chooseRestaurant = async () => {
      const data = await AsyncStorage.getItem('restaurants');
      if (data) {
        const list = JSON.parse(data);
        if (list.length > 0) {
          const index = Math.floor(Math.random() * list.length);
          setSelected(list[index]);
        }
      }
    };
    chooseRestaurant();
  }, []);

  return (
    <ImageBackground source={bgImage} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Enjoy your meal!</Text>
        {selected && (
          <View style={styles.box}>
            <Text style={styles.name}>{selected.name}</Text>
            <Text>Cuisine: {selected.cuisine}</Text>
            <Text>Price: {selected.price}</Text>
            <Text>
              Rating: {selected.rating} {'\u2605'.repeat(parseInt(selected.rating || 0))}
            </Text>
            <Text>Phone: {selected.phone}</Text>
            <Text>Address: {selected.address}</Text>
            <Text>Website: {selected.website}</Text>
            <Text>Delivery: {selected.hasDelivery ? 'Yes' : 'No'}</Text>
          </View>
        )}
        <Button
          title="ALL DONE"
          onPress={() => navigation.navigate('Choice')}
          color="#007AFF"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '85%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  box: {
    marginBottom: 20,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
});
