import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'react-native';
import CustomButton from './screens/components/CustomButton';

import PeopleScreen from './screens/PeopleScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import DecisionScreen from './screens/DecisionScreen';

import DecisionTimeScreen from './screens/DecisionTimeScreen';
import WhosGoingScreen from './screens/WhosGoingScreen';
import PreFiltersScreen from './screens/PreFiltersScreen';
import ChoiceScreen from './screens/ChoiceScreen';
import PostChoiceScreen from './screens/PostChoiceScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Decision"
      screenOptions={({ route }) => ({
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ focused }) => {
          let icon;
          if (route.name === 'People') {
            icon = require('./assets/icon-people.png');
          } else if (route.name === 'Decision') {
            icon = require('./assets/icon-decision.png');
          } else if (route.name === 'Restaurants') {
            icon = require('./assets/icon-restaurants.png');
          }
          return (
            <Image
              source={icon}
              style={{ width: 20, height: 20, tintColor: focused ? '#000' : '#888' }}
            />
          );
        },
        tabBarShowIcon: true,
      })}
    >
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Decision" component={DecisionScreen} />
      <Tab.Screen name="Restaurants" component={RestaurantsScreen} />
      {/* ❌ НЕ добавляем Choice в табы */}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        {/* Основное таб-меню */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Внутренние экраны */}
        <Stack.Screen
          name="DecisionTime"
          component={DecisionTimeScreen}
          options={{
            headerShown: true,
            headerTitle: 'Decision Time',
            headerRight: () => (
              <CustomButton
                text="All Done"
                onPress={() => {
                  alert('All Done pressed!');
                }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="WhosGoing"
          component={WhosGoingScreen}
          options={{ title: "Who's Going?" }}
        />
        <Stack.Screen
          name="PreFilters"
          component={PreFiltersScreen}
          options={{ title: 'Filter Restaurants' }}
        />
        <Stack.Screen
          name="Choice"
          component={ChoiceScreen}
          options={{ title: 'Make a Choice' }}
        />
        <Stack.Screen
          name="PostChoice"
          component={PostChoiceScreen}
          options={{ title: 'Your Final Choice' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
