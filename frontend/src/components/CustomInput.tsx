import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { radius, spacing } from "../constants/layout";
import type { IconName } from "../types";

type Props = TextInputProps & {
  label: string;
  error?: string;
  icon?: IconName;
  isPassword?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
};

export function CustomInput({ label, error, icon, isPassword, passwordVisible, onTogglePassword, style, ...props }: Props) {
  const { colors } = useAuth();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface
          }
        ]}
      >
        {icon ? <Ionicons name={icon} size={20} color={colors.mutedText} /> : null}
        <TextInput
          placeholderTextColor={colors.mutedText}
          secureTextEntry={isPassword && !passwordVisible}
          style={[styles.input, { color: colors.text }, style]}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity accessibilityRole="button" onPress={onTogglePassword} hitSlop={12}>
            <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    fontSize: 14,
    fontWeight: "700"
  },
  inputRow: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.md
  },
  error: {
    fontSize: 12,
    fontWeight: "600"
  }
});
