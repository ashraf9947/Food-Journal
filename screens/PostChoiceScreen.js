import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PostChoiceScreen({ route }) {
  const { restaurant } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>Your Final Choice</Text>

      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{restaurant?.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Cuisine:</Text>
          <Text style={styles.value}>{restaurant?.cuisine}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>{'$'.repeat(restaurant?.price || 0)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Rating:</Text>
          <Text style={styles.value}>{'★'.repeat(restaurant?.rating || 0)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery:</Text>
          <Text style={styles.value}>{restaurant?.hasDelivery ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    paddingBottom: 80,
  },
  detailsBox: {
    borderWidth: 2,
    borderColor: '#000000',
    padding: 10,
    width: '96%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    marginBottom: 10,
  },
  label: {
    width: 70,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  value: {
    width: 300,
  },
});
