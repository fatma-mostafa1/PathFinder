import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { radius, spacing } from "../constants/layout";
import type { IconName } from "../types";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function CustomButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style
}: Props) {
  const { colors } = useAuth();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : variant === "danger"
          ? colors.danger
          : "transparent";
  const borderColor = variant === "outline" ? colors.border : backgroundColor;
  const textColor = variant === "outline" || variant === "ghost" ? colors.primary : "#FFFFFF";
  const elevated = variant === "primary" || variant === "secondary" || variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          shadowColor: elevated ? backgroundColor : "transparent",
          elevation: elevated ? 4 : 0,
          shadowOpacity: elevated ? 0.18 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.86 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start"
        },
        variant === "ghost" && styles.ghost,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
          <Text style={[styles.text, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  ghost: {
    borderColor: "transparent",
    minHeight: 40,
    paddingHorizontal: spacing.md
  },
  text: {
    fontSize: 15,
    fontWeight: "700"
  }
});
