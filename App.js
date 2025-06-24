import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './components/auth/authScreen';
import HomeScreen from './screens/homeScreen';
import { initDatabase, executeSql } from './components/database/database';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const Stack = createStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🟡 Initializing database...');
        await initDatabase();

        let result;

        if (Platform.OS === 'web') {
          result = await executeSql('SELECT * FROM users');
        } else {
          result = await executeSql('SELECT name FROM sqlite_master WHERE type="table"');
        }

        console.log('📦 Database test query result:', result.rows._array);

        setDbInitialized(true);
      } catch (err) {
        console.error('❌ Database initialization failed:', err);
        setError(err);
      }
    };

    initializeApp();
  }, []);

  const handleRetry = async () => {
    setError(null);
    setDbInitialized(false);
    try {
      await initDatabase();
      setDbInitialized(true);
    } catch (err) {
      setError(err);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <Button 
          title="Retry Initialization" 
          onPress={handleRetry}
          color="#841584"
        />
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Food Journal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});
