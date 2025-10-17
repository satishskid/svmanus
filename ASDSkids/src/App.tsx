/**
 * Main App Component for NeuroKinetics AI Platform
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens (will be created next)
import HomeScreen from './screens/HomeScreen';
import ScreeningModule from './screens/ScreeningModule';
import ResultsScreen from './screens/ResultsScreen';
import InterventionScreen from './screens/InterventionScreen';
import CopilotScreen from './screens/CopilotScreen';

export type RootStackParamList = {
  Home: undefined;
  Screening: { childProfile: any };
  Results: { assessmentId: string };
  Intervention: { planId: string };
  Copilot: { conversationId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'NeuroKinetics AI' }}
          />
          <Stack.Screen
            name="Screening"
            component={ScreeningModule}
            options={{ title: 'Autism Screening' }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{ title: 'Assessment Results' }}
          />
          <Stack.Screen
            name="Intervention"
            component={InterventionScreen}
            options={{ title: 'Intervention Plan' }}
          />
          <Stack.Screen
            name="Copilot"
            component={CopilotScreen}
            options={{ title: 'AI Assistant' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
