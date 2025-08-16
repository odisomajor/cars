import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { CarDetailsScreen } from '../screens/details';
import { ChatScreen, ConversationsScreen } from '../screens/chat';
import { NotificationsScreen } from '../screens/notifications';
import { COLORS } from '../constants';

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  
  // Main App Stack
  MainTabs: undefined;
  CarDetails: { carId: string };
  Chat: { userId: string; userName: string };
  Conversations: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    // You can return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="CarDetails"
              component={CarDetailsScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Conversations"
              component={ConversationsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;