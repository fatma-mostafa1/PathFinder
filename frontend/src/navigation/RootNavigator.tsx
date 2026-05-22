import React from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { SplashScreen } from "../screens/onboarding/SplashScreen";

export function RootNavigator() {
  const { colors, isLoading, user, hasSeenOnboarding, settings } = useAuth();
  const baseTheme = settings.darkMode ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isLoading ? (
        <SplashScreen />
      ) : !hasSeenOnboarding ? (
        <OnboardingScreen />
      ) : user ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
