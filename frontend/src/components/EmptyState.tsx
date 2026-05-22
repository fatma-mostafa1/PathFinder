import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "./CustomButton";
import { useAuth } from "../contexts/AuthContext";
import { radius, shadow, spacing } from "../constants/layout";
import type { IconName } from "../types";

type Props = {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = "map-outline", title, message, actionLabel, onAction }: Props) {
  const { colors } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <LinearGradient colors={[`${colors.primary}22`, `${colors.secondary}22`]} style={styles.topWash} />
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
      {actionLabel && onAction ? <CustomButton title={actionLabel} onPress={onAction} icon="arrow-forward-outline" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    overflow: "hidden",
    ...shadow
  },
  topWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 86
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center"
  }
});
