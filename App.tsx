import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './app/(tabs)/index'; // Apuntando a la lógica existente

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true, // Habilitar gestos
            gestureDirection: 'horizontal', // Dirección horizontal
            ...TransitionPresets.SlideFromRightIOS, // Animación premium suave
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* Aquí se registrarían el resto de pantallas */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}