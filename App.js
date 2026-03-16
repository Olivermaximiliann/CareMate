import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen, CheckInScreen, ChatScreen, MedicineScreen, SOSScreen } from './src/screens';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Hjem: { focused: 'home', unfocused: 'home-outline' },
  'Check-in': { focused: 'heart-circle', unfocused: 'heart-circle-outline' },
  'AI-assistent': { focused: 'chatbubble-ellipses', unfocused: 'chatbubble-ellipses-outline' },
  Medicin: { focused: 'medkit', unfocused: 'medkit-outline' },
  'Hjælp': { focused: 'call', unfocused: 'call-outline' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              const icons = TAB_ICONS[route.name];
              const iconName = focused ? icons.focused : icons.unfocused;
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              height: 90,
              paddingBottom: 14,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.white,
            },
            tabBarLabelStyle: {
              fontSize: 16,
              fontWeight: '600',
            },
            tabBarIconStyle: {
              marginTop: 6,
            },
          })}
        >
          <Tab.Screen name="Hjem" component={HomeScreen} />
          <Tab.Screen name="Check-in" component={CheckInScreen} />
          <Tab.Screen name="AI-assistent" component={ChatScreen} />
          <Tab.Screen name="Medicin" component={MedicineScreen} />
          <Tab.Screen
            name="Hjælp"
            component={SOSScreen}
            options={{
              tabBarLabelStyle: {
                fontSize: 16,
                fontWeight: '700',
                color: colors.danger,
              },
              tabBarIconStyle: { marginTop: 6 },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
