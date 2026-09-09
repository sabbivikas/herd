import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  EmailAuth: { mode: 'signin' | 'signup' };
  AgeGate: { email: string; password: string };
  VerifyEmail: { email: string };
  Blocked: undefined;
};

export type OnboardingStackParamList = {
  ProfileSetup: undefined;
  LocationGenres: { userType: 'listener' | 'artist' };
  ArtistExtras: undefined;
};

export type MainTabsParamList = {
  Feed: undefined;
  Charts: undefined;
  Radio: undefined;
  News: undefined;
  You: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};
