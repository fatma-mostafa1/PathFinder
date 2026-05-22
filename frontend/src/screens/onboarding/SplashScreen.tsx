import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { lightColors } from "../../constants/colors";
import { spacing } from "../../constants/layout";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoMark}>
        <Ionicons name="navigate" size={46} color={lightColors.primary} />
      </View>
      <Text style={styles.name}>PathFinder</Text>
      <Text style={styles.subtitle}>Personalized Career and Learning Roadmaps for CS Students</Text>
      <ActivityIndicator color="#FFFFFF" size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl
  },
  name: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: "#DBEAFE",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
    maxWidth: 330
  },
  spinner: {
    marginTop: spacing.xxl
  }
});
