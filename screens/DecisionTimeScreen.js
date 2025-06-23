import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';

export default function DecisionTimeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/its-decision-time.android.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>It's Decision Time!</Text>
      <Button
        title="Start"
        color="#1e90ff"
        onPress={() => navigation.navigate('WhosGoing')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});
