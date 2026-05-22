import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { spacing } from "../constants/layout";

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function SectionTitle({ title, subtitle, action }: Props) {
  const { colors } = useAuth();

  return (
    <View style={styles.row}>
      <View style={styles.textGroup}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  textGroup: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 20,
    fontWeight: "800"
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18
  }
});
