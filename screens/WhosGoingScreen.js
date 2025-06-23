import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WhosGoingScreen({ navigation }) {
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const loadPeople = async () => {
      const stored = await AsyncStorage.getItem('people');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPeople(parsed);
        const defaultSelected = {};
        parsed.forEach((p) => (defaultSelected[p.id] = false));
        setSelected(defaultSelected);
      }
    };
    loadPeople();
  }, []);

  const togglePerson = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNext = () => {
    const selectedPeople = people
      .filter((p) => selected[p.id])
      .map((p) => ({ ...p, vetoed: 'no' }));
    if (selectedPeople.length === 0) {
      alert('Please select at least one person!');
      return;
    }
    navigation.navigate('PreFilters', { selectedPeople });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text>{item.name}</Text>
      <Switch
        value={selected[item.id]}
        onValueChange={() => togglePerson(item.id)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who is going?</Text>
      <FlatList data={people} renderItem={renderItem} keyExtractor={(item) => item.id} />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
