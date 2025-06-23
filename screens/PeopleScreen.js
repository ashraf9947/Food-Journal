import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PeopleScreen() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [people, setPeople] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const stored = await AsyncStorage.getItem('people');
        if (stored) {
          setPeople(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Error loading people:', error);
      }
    };
    loadPeople();
  }, []);

  const validateName = (name) => {
    if (!name.trim()) return 'First name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[A-Za-zА-Яа-яЁё\s\-]+$/.test(name)) return 'Name contains invalid characters';
    return null;
  };

  const validateLastName = (text) => {
    if (text.trim().length < 2) return 'Last name must be at least 2 characters';
    if (!/^[A-Za-zА-Яа-яЁё\s\-]+$/.test(text)) return 'Last name contains invalid characters';
    return null;
  };

  const addPerson = async () => {
    const newErrors = {
      name: validateName(name),
      lastName: validateLastName(lastName),
    };

    const hasErrors = Object.values(newErrors).some((msg) => msg !== null);
    setErrors(newErrors);

    if (hasErrors) {
      ToastAndroid.show("Please correct the errors above", ToastAndroid.SHORT);
      return;
    }

    const timestamp = Date.now().toString();
    const newPerson = {
      id: timestamp,
      key: timestamp,
      name: `${name.trim()} ${lastName.trim()}`,
      firstName: name.trim(),
      lastName: lastName.trim(),
    };

    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    setName('');
    setLastName('');
    setErrors({});

    try {
      await AsyncStorage.setItem('people', JSON.stringify(updatedPeople));
      ToastAndroid.show("Person added successfully!", ToastAndroid.SHORT);
    } catch (error) {
      console.log('Error saving person:', error);
      ToastAndroid.show("Failed to save person", ToastAndroid.SHORT);
    }
  };

  const deletePerson = async (id) => {
    const updatedPeople = people.filter((p) => p.id !== id);
    setPeople(updatedPeople);
    try {
      await AsyncStorage.setItem('people', JSON.stringify(updatedPeople));
    } catch (error) {
      console.log('Error deleting person:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <View>
        <Text style={styles.itemTitle}>First Name: {item.firstName}</Text>
        {item.lastName ? (
          <Text style={styles.itemSubTitle}>Last Name: {item.lastName}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => deletePerson(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const filterLettersOnly = (text) => text.replace(/[^A-Za-zА-Яа-яЁё\s\-]/g, '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Person</Text>

      <TextInput
        placeholder="First Name"
        value={name}
        onChangeText={(text) => {
          setName(filterLettersOnly(text));
          setErrors((prev) => ({ ...prev, name: null }));
        }}
        style={[styles.input, errors.name ? styles.inputError : null]}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        placeholder="Last Name (optional)"
        value={lastName}
        onChangeText={(text) => {
          setLastName(filterLettersOnly(text));
          setErrors((prev) => ({ ...prev, lastName: null }));
        }}
        style={[styles.input, errors.lastName ? styles.inputError : null]}
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

      <Button title="Add Person" onPress={addPerson} />

      <FlatList
        data={people}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubTitle: {
    fontSize: 14,
    color: '#666',
  },
  delete: {
    color: 'red',
    fontSize: 18,
    paddingHorizontal: 10,
  },
});
