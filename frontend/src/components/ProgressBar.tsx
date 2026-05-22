import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { radius, spacing } from "../constants/layout";

type Props = {
  value: number;
  height?: number;
  showLabel?: boolean;
  color?: string;
  trackColor?: string;
  labelColor?: string;
};

export function ProgressBar({ value, height = 8, showLabel = false, color, trackColor, labelColor }: Props) {
  const { colors } = useAuth();
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height, backgroundColor: trackColor || colors.border }]}>
        <View style={[styles.fill, { width: `${normalized}%`, backgroundColor: color || colors.primary }]} />
      </View>
      {showLabel ? <Text style={[styles.label, { color: labelColor || colors.mutedText }]}>{normalized}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  track: {
    flex: 1,
    overflow: "hidden",
    borderRadius: radius.pill
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill
  },
  label: {
    width: 42,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700"
  }
});
