import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { radius, shadow, spacing } from "../constants/layout";
import type { IconName } from "../types";

type Props = {
  label: string;
  value: string | number;
  icon: IconName;
  accent: string;
  helper?: string;
};

export function StatCard({ label, value, icon, accent, helper }: Props) {
  const { colors } = useAuth();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={21} color={accent} />
      </View>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
      {helper ? <Text style={[styles.helper, { color: accent }]}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47.8%",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  value: {
    fontSize: 23,
    fontWeight: "900"
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
  },
  helper: {
    fontSize: 11,
    fontWeight: "900"
  }
});
