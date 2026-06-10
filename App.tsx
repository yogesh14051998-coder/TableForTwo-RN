import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';
import { T42 } from './src/theme/theme';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: T42.gold,
    background: T42.background,
    card: T42.surface,
    text: T42.textPrimary,
    border: T42.stroke,
    notification: T42.purple,
  },
};

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
