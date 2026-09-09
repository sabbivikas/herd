import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import type { OnboardingStackParamList } from './types';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { LocationGenresScreen } from '../screens/auth/LocationGenresScreen';
import { ArtistExtrasScreen } from '../screens/auth/ArtistExtrasScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="LocationGenres" component={LocationGenresScreen} />
      <Stack.Screen name="ArtistExtras" component={ArtistExtrasScreen} />
    </Stack.Navigator>
  );
}
