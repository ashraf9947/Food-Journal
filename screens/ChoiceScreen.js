import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CustomButton from './components/CustomButton';

export default function ChoiceScreen({ route, navigation }) {
  const params = route.params || {};
  const filteredRestaurants = params.filteredRestaurants || [];
  const selectedPeople = params.selectedPeople || [];

  const [participantsList, setParticipantsList] = useState(
    selectedPeople.map((p) => ({ ...p, vetoed: 'no' }))
  );
  const [chosenRestaurant, setChosenRestaurant] = useState(null);
  const [selectedVisible, setSelectedVisible] = useState(false);
  const [vetoVisible, setVetoVisible] = useState(false);
  const [vetoDisabled, setVetoDisabled] = useState(false);
  const [vetoText, setVetoText] = useState('VETO');

  const getRandom = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const chooseRestaurant = () => {
    const index = getRandom(0, filteredRestaurants.length - 1);
    setChosenRestaurant(filteredRestaurants[index]);
    setSelectedVisible(true);
  };

  const handleVeto = (vetoPersonKey) => {
    const updatedPeople = participantsList.map((p) =>
      p.key === vetoPersonKey ? { ...p, vetoed: 'yes' } : p
    );
    setParticipantsList(updatedPeople);

    const updatedRestaurants = filteredRestaurants.filter(
      (r) => r.name !== chosenRestaurant.name
    );

    if (updatedRestaurants.length === 0) {
      alert('No more restaurants left!');
      setSelectedVisible(false);
      setVetoVisible(false);
      return;
    }

    const newChoice =
      updatedRestaurants[getRandom(0, updatedRestaurants.length - 1)];
    setChosenRestaurant(newChoice);

    const anyoneLeft = updatedPeople.some((p) => p.vetoed === 'no');
    setVetoText(anyoneLeft ? 'VETO' : 'NO VETOES LEFT');
    setVetoDisabled(!anyoneLeft);

    setVetoVisible(false);
    setSelectedVisible(true);
  };

  if (filteredRestaurants.length === 0 || selectedPeople.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', padding: 20 }}>
          Please go through the Who's Going and Filter screens first.
        </Text>
        <CustomButton text="Back" onPress={() => navigation.navigate('WhosGoing')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Choice Screen</Text>

      <FlatList
        data={participantsList}
        keyExtractor={(item) => item.key || item.id || item.name}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.name}>{item.firstName || item.name}</Text>
            <Text>{item.vetoed}</Text>
          </View>
        )}
      />

      <CustomButton text="Choose Random" onPress={chooseRestaurant} />

      <Modal visible={selectedVisible} animationType="slide">
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInnerContainer}>
            <Text style={styles.selectedName}>{chosenRestaurant?.name}</Text>
            <View style={styles.selectedDetails}>
              <Text style={styles.selectedDetailsLine}>
                This is a {'★'.repeat(chosenRestaurant?.rating || 0)} star restaurant
              </Text>
              <Text style={styles.selectedDetailsLine}>
                Cuisine: {chosenRestaurant?.cuisine}
              </Text>
              <Text style={styles.selectedDetailsLine}>
                Price: {'$'.repeat(chosenRestaurant?.price || 0)}
              </Text>
              <Text style={styles.selectedDetailsLine}>
                {chosenRestaurant?.hasDelivery ? 'DOES' : 'DOES NOT'} deliver
              </Text>
            </View>

            <CustomButton
              text="ACCEPT"
              onPress={() => {
                setSelectedVisible(false);
                navigation.navigate('PostChoice', {
                  restaurant: chosenRestaurant,
                });
              }}
            />

            <CustomButton
              text={vetoText}
              onPress={() => {
                if (!vetoDisabled) {
                  setSelectedVisible(false);
                  setVetoVisible(true);
                }
              }}
              disabled={vetoDisabled}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={vetoVisible} animationType="slide">
        <View style={styles.vetoContainer}>
          <View style={styles.vetoContainerInner}>
            <Text style={styles.vetoHeadline}>Who Vetoed?</Text>

            <ScrollView style={styles.vetoScrollViewContainer}>
              {participantsList
                .filter((p) => p.vetoed === 'no')
                .map((p) => (
                  <TouchableOpacity
                    key={p.key || p.id || p.name}
                    style={styles.vetoParticipantContainer}
                    onPress={() => handleVeto(p.key)}
                  >
                    <Text style={styles.vetoParticipantName}>
                      {p.firstName || p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.vetoButtonContainer}>
              <CustomButton
                text="NEVER MIND"
                onPress={() => {
                  setVetoVisible(false);
                  setSelectedVisible(true);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headline: { fontSize: 28, marginBottom: 20 },
  list: { width: '94%' },
  listItem: {
    flexDirection: 'row',
    marginVertical: 4,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  name: { flex: 1 },

  selectedContainer: { flex: 1, justifyContent: 'center' },
  selectedInnerContainer: { alignItems: 'center' },
  selectedName: { fontSize: 32 },
  selectedDetails: {
    paddingTop: 80,
    paddingBottom: 80,
    alignItems: 'center',
  },
  selectedDetailsLine: { fontSize: 18 },

  vetoContainer: { flex: 1, justifyContent: 'center' },
  vetoContainerInner: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  vetoHeadline: { fontSize: 32, fontWeight: 'bold' },
  vetoScrollViewContainer: { height: '50%' },
  vetoParticipantContainer: { paddingVertical: 20 },
  vetoParticipantName: { fontSize: 24 },
  vetoButtonContainer: { width: '100%', alignItems: 'center', paddingTop: 40 },
});
