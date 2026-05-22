import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "./CustomButton";
import { useAuth } from "../contexts/AuthContext";
import { radius, shadow, spacing } from "../constants/layout";
import type { CareerMatch, CareerPath } from "../types";

type Props = {
  career: CareerPath;
  compact?: boolean;
  match?: CareerMatch;
  onPress?: () => void;
  onViewRoadmap?: () => void;
};

export function CareerCard({ career, compact = false, match, onPress, onViewRoadmap }: Props) {
  const { colors } = useAuth();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : null,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          opacity: pressed ? 0.94 : 1
        }
      ]}
    >
      <LinearGradient colors={[`${career.color}24`, "transparent"]} style={styles.topAccent} />
      <View style={styles.topRow}>
        <LinearGradient colors={[`${career.color}33`, `${career.color}14`]} style={styles.iconWrap}>
          <Ionicons name={career.icon} size={24} color={career.color} />
        </LinearGradient>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {career.title}
          </Text>
          <Text style={[styles.difficulty, { color: career.color }]}>{career.difficulty}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.mutedText }]} numberOfLines={compact ? 2 : 3}>
        {career.description}
      </Text>

      {match ? (
        <View style={[styles.matchPanel, { backgroundColor: `${career.color}10`, borderColor: `${career.color}44` }]}>
          <View style={styles.matchHeader}>
            <Text style={[styles.matchLabel, { color: colors.text }]}>Career match</Text>
            <Text style={[styles.matchValue, { color: career.color }]}>{match.matchPercentage}%</Text>
          </View>
          <View style={[styles.matchTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.matchFill, { width: `${Math.max(0, Math.min(100, match.matchPercentage))}%`, backgroundColor: career.color }]} />
          </View>
          <Text style={[styles.matchReason, { color: colors.mutedText }]} numberOfLines={2}>
            {match.reasons[0] || "This path matches your selected interests and skills."}
          </Text>
        </View>
      ) : null}

      <View style={styles.skillWrap}>
        {career.requiredSkills.slice(0, compact ? 3 : 4).map((skill) => (
          <View key={skill} style={[styles.badge, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.text }]} numberOfLines={1}>
              {skill}
            </Text>
          </View>
        ))}
      </View>

      {!compact ? (
        <View style={[styles.insightRow, { borderColor: colors.border }]}>
          <View style={styles.insight}>
            <Ionicons name="school-outline" size={15} color={career.color} />
            <Text style={[styles.insightText, { color: colors.mutedText }]}>{career.roadmapPreview.length} phases</Text>
          </View>
          <View style={styles.insight}>
            <Ionicons name="briefcase-outline" size={15} color={career.color} />
            <Text style={[styles.insightText, { color: colors.mutedText }]}>{career.projects.length} projects</Text>
          </View>
        </View>
      ) : null}

      {onViewRoadmap ? (
        <CustomButton title="View roadmap" onPress={onViewRoadmap} variant="outline" icon="map-outline" fullWidth />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
    ...shadow
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 82
  },
  compact: {
    width: 260
  },
  topRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 17,
    fontWeight: "800"
  },
  difficulty: {
    fontSize: 12,
    fontWeight: "800"
  },
  description: {
    fontSize: 14,
    lineHeight: 20
  },
  matchPanel: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: "900"
  },
  matchValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  matchTrack: {
    height: 7,
    borderRadius: radius.pill,
    overflow: "hidden"
  },
  matchFill: {
    height: "100%",
    borderRadius: radius.pill
  },
  matchReason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  badge: {
    maxWidth: "100%",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700"
  },
  insightRow: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    flexDirection: "row",
    gap: spacing.lg
  },
  insight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  insightText: {
    fontSize: 12,
    fontWeight: "800"
  }
});
