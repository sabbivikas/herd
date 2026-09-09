import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';
import type { MainTabsParamList } from './types';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { ChartsScreen } from '../screens/charts/ChartsScreen';
import { RadioScreen } from '../screens/radio/RadioScreen';
import { NewsScreen } from '../screens/news/NewsScreen';
import { YouScreen } from '../screens/profile/YouScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Feed: 'play',
  Charts: 'trophy',
  Radio: 'radio',
  News: 'newspaper',
  You: 'person-circle',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          position: route.name === 'Feed' ? 'absolute' : 'relative',
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Radio" component={RadioScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="You" component={YouScreen} />
    </Tab.Navigator>
  );
}
