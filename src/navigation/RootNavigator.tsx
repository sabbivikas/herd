import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { useAuth } from '../state/AuthContext';
import { colors } from '../theme';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabs } from './MainTabs';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg },
};

export function RootNavigator() {
  const { loading, session, profileComplete } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer theme={theme}>
      {!session ? <AuthNavigator /> : !profileComplete ? <OnboardingNavigator /> : <MainTabs />}
    </NavigationContainer>
  );
}
