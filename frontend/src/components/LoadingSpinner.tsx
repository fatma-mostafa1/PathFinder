import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "../contexts/AuthContext";
import { radius, shadow, spacing } from "../constants/layout";

type Props = {
  message?: string;
};

export function LoadingSpinner({ message = "Loading..." }: Props) {
  const { colors } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <LinearGradient colors={[`${colors.primary}24`, `${colors.secondary}1A`]} style={styles.mark}>
          <ActivityIndicator size="large" color={colors.primary} />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.text }]}>PathFinder</Text>
        <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  card: {
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    ...shadow
  },
  mark: {
    width: 86,
    height: 86,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 22,
    fontWeight: "900"
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20
  }
});
