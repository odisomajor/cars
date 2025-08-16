import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import HomeScreen from './screens/home/HomeScreen';
import MainTabNavigator from './navigation/MainTabNavigator';

// Store
import { useAuthStore } from './store/authStore';

// Types
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    // TODO: Add proper loading screen
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <Stack.Screen name="Main" component={MainTabNavigator} />
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}