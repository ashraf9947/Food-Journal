import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // ✅ ПРАВИЛЬНЫЙ импорт

export default function PreFiltersScreen({ navigation }) {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [prices, setPrices] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      const data = await AsyncStorage.getItem('restaurants');
      if (data) {
        const parsed = JSON.parse(data);
        setAllRestaurants(parsed);

        const unique = (arr) => [...new Set(arr.filter(Boolean))];
        setCuisines(unique(parsed.map(r => r.cuisine)));
        setPrices(unique(parsed.map(r => r.price)));
        setRatings(unique(parsed.map(r => r.rating)));
      }
      setLoading(false);
    };
    loadRestaurants();
  }, []);

  const applyFilters = async () => {
    const filtered = allRestaurants.filter((r) => {
      return (
        (!selectedCuisine || r.cuisine === selectedCuisine) &&
        (!selectedPrice || r.price === selectedPrice) &&
        (!selectedRating || r.rating === selectedRating)
      );
    });

    const peopleData = await AsyncStorage.getItem('people');
    const people = JSON.parse(peopleData || '[]');

    navigation.navigate('Choice', {
      filteredRestaurants: filtered,
      selectedPeople: people,
    });
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Restaurants</Text>

      <Text style={styles.label}>Cuisine</Text>
      <Picker
        selectedValue={selectedCuisine}
        onValueChange={setSelectedCuisine}
        style={styles.picker}
      >
        <Picker.Item label="Any" value="" />
        {cuisines.map((cuisine) => (
          <Picker.Item key={cuisine} label={cuisine} value={cuisine} />
        ))}
      </Picker>

      <Text style={styles.label}>Price</Text>
      <Picker
        selectedValue={selectedPrice}
        onValueChange={setSelectedPrice}
        style={styles.picker}
      >
        <Picker.Item label="Any" value="" />
        {prices.map((price) => (
          <Picker.Item key={price} label={'$'.repeat(price)} value={price} />
        ))}
      </Picker>

      <Text style={styles.label}>Rating</Text>
      <Picker
        selectedValue={selectedRating}
        onValueChange={setSelectedRating}
        style={styles.picker}
      >
        <Picker.Item label="Any" value="" />
        {ratings.map((rating) => (
          <Picker.Item key={rating} label={'★'.repeat(rating)} value={rating} />
        ))}
      </Picker>

      <View style={{ marginTop: 20 }}>
        <Button title="Continue" onPress={applyFilters} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 4 },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
  },
});
