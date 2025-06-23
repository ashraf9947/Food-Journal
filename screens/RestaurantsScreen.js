import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ToastAndroid, // ✅ импортируем Toast
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [price, setPrice] = useState('1');
  const [rating, setRating] = useState('1');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [hasDelivery, setHasDelivery] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('restaurants');
      if (data) {
        setRestaurants(JSON.parse(data));
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Restaurant name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z0-9\s,'-]*$/.test(name)) return 'Name contains invalid characters';
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    if (phone.trim().length < 7) return 'Phone number is too short';
    if (!/^[0-9+\-\s()]+$/.test(phone)) return 'Invalid phone number format';
    return null;
  };

  const validateAddress = (address) => {
    if (!address.trim()) return 'Address is required';
    if (!/\d/.test(address)) return 'Address must include a number';
    return null;
  };

  const validateWebsite = (website) => {
    if (!website.trim()) return 'Website is required';
    if (!/^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(website)) return 'Invalid website URL';
    return null;
  };

  const addRestaurant = () => {
    const newErrors = {
      name: validateName(name),
      phone: validatePhone(phone),
      address: validateAddress(address),
      website: validateWebsite(website),
    };

    const hasErrors = Object.values(newErrors).some((msg) => msg !== null);
    setErrors(newErrors);

    if (hasErrors) {
      ToastAndroid.show("Please correct the errors above", ToastAndroid.SHORT);
      return;
    }

    const newRestaurant = {
      id: Date.now().toString(),
      name: name.trim(),
      cuisine: cuisine.trim(),
      price: Number(price),
      rating: Number(rating),
      phone: phone.trim(),
      address: address.trim(),
      website: website.trim(),
      hasDelivery,
    };

    setRestaurants([...restaurants, newRestaurant]);

    // Reset form
    setName('');
    setCuisine('');
    setPrice('1');
    setRating('1');
    setPhone('');
    setAddress('');
    setWebsite('');
    setHasDelivery(false);
    setErrors({});

    ToastAndroid.show("Restaurant added successfully!", ToastAndroid.SHORT);
  };

  const deleteRestaurant = (id) => {
    setRestaurants(restaurants.filter((r) => r.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <TouchableOpacity onPress={() => deleteRestaurant(item.id)}>
        <Text style={styles.delete}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Input filters
  const filterLettersOnly = (text) => text.replace(/[^A-Za-zА-Яа-яЁё\s\-]/g, '');
  const filterPhone = (text) => text.replace(/[^\d\-\+\(\)\s]/g, '');
  const filterAddress = (text) => text.replace(/[^A-Za-zА-Яа-яЁё0-9\s,\.\-]/g, '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Restaurant</Text>

      <TextInput
        placeholder="Restaurant Name"
        value={name}
        onChangeText={(text) => {
          setName(filterLettersOnly(text));
          setErrors((prev) => ({ ...prev, name: null }));
        }}
        style={[styles.input, errors.name ? styles.inputError : null]}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        placeholder="Cuisine"
        value={cuisine}
        onChangeText={(text) => setCuisine(filterLettersOnly(text))}
        style={styles.input}
      />

      <Text>Price:</Text>
      <Picker selectedValue={price} onValueChange={(v) => setPrice(v)} style={styles.picker}>
        <Picker.Item label="1" value="1" />
        <Picker.Item label="2" value="2" />
        <Picker.Item label="3" value="3" />
        <Picker.Item label="4" value="4" />
      </Picker>

      <Text>Rating:</Text>
      <Picker selectedValue={rating} onValueChange={(v) => setRating(v)} style={styles.picker}>
        <Picker.Item label="1 ★" value="1" />
        <Picker.Item label="2 ★★" value="2" />
        <Picker.Item label="3 ★★★" value="3" />
        <Picker.Item label="4 ★★★★" value="4" />
        <Picker.Item label="5 ★★★★★" value="5" />
      </Picker>

      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={(text) => {
          setPhone(filterPhone(text));
          setErrors((prev) => ({ ...prev, phone: null }));
        }}
        style={[styles.input, errors.phone ? styles.inputError : null]}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={(text) => {
          setAddress(filterAddress(text));
          setErrors((prev) => ({ ...prev, address: null }));
        }}
        style={[styles.input, errors.address ? styles.inputError : null]}
      />
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      <TextInput
        placeholder="Website"
        value={website}
        onChangeText={(text) => {
          setWebsite(text);
          setErrors((prev) => ({ ...prev, website: null }));
        }}
        style={[styles.input, errors.website ? styles.inputError : null]}
        keyboardType="url"
      />
      {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}

      <View style={styles.switchRow}>
        <Text>Delivery?</Text>
        <Switch value={hasDelivery} onValueChange={setHasDelivery} />
      </View>

      <Button title="Add Restaurant" onPress={addRestaurant} />

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  picker: { marginBottom: 10 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemRow: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
    padding: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  delete: {
    color: 'red',
    fontSize: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
