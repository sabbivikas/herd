import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import type { AuthStackParamList } from './types';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { EmailAuthScreen } from '../screens/auth/EmailAuthScreen';
import { AgeGateScreen } from '../screens/auth/AgeGateScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { BlockedScreen } from '../screens/auth/BlockedScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
      <Stack.Screen name="AgeGate" component={AgeGateScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Blocked" component={BlockedScreen} />
    </Stack.Navigator>
  );
}
