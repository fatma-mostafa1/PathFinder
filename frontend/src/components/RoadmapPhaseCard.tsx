import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ProgressBar } from "./ProgressBar";
import { CustomButton } from "./CustomButton";
import { useAuth } from "../contexts/AuthContext";
import { radius, shadow, spacing } from "../constants/layout";
import type { RoadmapPhase } from "../types";

export type RoadmapPhaseStatus = "completed" | "active" | "unlocked" | "locked";

type Props = {
  phase: RoadmapPhase;
  index: number;
  status: RoadmapPhaseStatus;
  isLast: boolean;
  onToggleSkill: (skillId: string) => void;
  onOpenDetails: () => void;
};

export function RoadmapPhaseCard({ phase, index, status, isLast, onToggleSkill, onOpenDetails }: Props) {
  const { colors } = useAuth();
  const [expanded, setExpanded] = useState(status === "active");
  const completedSkills = phase.skills.filter((skill) => skill.completed).length;
  const isLocked = status === "locked";
  const statusMeta = getStatusMeta(status, colors);

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineNode, { backgroundColor: statusMeta.color, borderColor: statusMeta.nodeBorder }]}>
          <Ionicons name={statusMeta.icon} size={18} color="#FFFFFF" />
        </View>
        {!isLast ? <View style={[styles.timelineLine, { backgroundColor: status === "completed" ? colors.success : colors.border }]} /> : null}
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: statusMeta.borderColor,
            shadowColor: colors.shadow,
            opacity: isLocked ? 0.78 : 1
          }
        ]}
      >
        <LinearGradient colors={[`${statusMeta.color}1F`, `${colors.secondary}10`]} style={styles.headerWash} />
        <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={styles.header}>
          <View style={[styles.indexBubble, { backgroundColor: statusMeta.color }]}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                {phase.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusMeta.color}17`, borderColor: `${statusMeta.color}44` }]}>
                <Ionicons name={statusMeta.badgeIcon} size={13} color={statusMeta.color} />
                <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: colors.mutedText }]}>
              {phase.duration} | {completedSkills}/{phase.skills.length} skills complete
            </Text>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color={colors.mutedText} />
        </Pressable>

        <Text style={[styles.description, { color: colors.mutedText }]}>{phase.description}</Text>

        <View style={styles.metricsGrid}>
          <Metric icon="time-outline" label="Duration" value={phase.duration} color={colors.primary} />
          <Metric icon="checkmark-done-outline" label="Completed" value={`${completedSkills}/${phase.skills.length}`} color={colors.success} />
          <Metric icon={statusMeta.badgeIcon} label="Status" value={statusMeta.label} color={statusMeta.color} />
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Phase progress</Text>
            <Text style={[styles.progressValue, { color: statusMeta.color }]}>{phase.progress}%</Text>
          </View>
          <ProgressBar value={phase.progress} color={statusMeta.color} />
        </View>

        {expanded ? (
          <View style={styles.expanded}>
            {isLocked ? (
              <View style={[styles.lockedPanel, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.warning} />
                <Text style={[styles.lockedText, { color: colors.mutedText }]}>
                  Complete the previous phase to unlock skill tracking and detailed actions for this section.
                </Text>
              </View>
            ) : null}

            <View style={styles.skillGrid}>
              {phase.skills.map((skill) => (
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: skill.completed, disabled: isLocked }}
                  disabled={isLocked}
                  key={skill.id}
                  style={[
                    styles.skillRow,
                    {
                      backgroundColor: skill.completed ? `${colors.success}10` : colors.background,
                      borderColor: skill.completed ? `${colors.success}44` : colors.border,
                      opacity: isLocked ? 0.62 : 1
                    }
                  ]}
                  onPress={() => onToggleSkill(skill.id)}
                >
                  <Ionicons
                    name={skill.completed ? "checkmark-circle" : isLocked ? "lock-closed-outline" : "ellipse-outline"}
                    size={22}
                    color={skill.completed ? colors.success : isLocked ? colors.warning : colors.mutedText}
                  />
                  <View style={styles.skillCopy}>
                    <Text style={[styles.skillTitle, { color: colors.text }]} numberOfLines={2}>
                      {skill.title}
                    </Text>
                    {skill.course ? (
                      <Text style={[styles.skillCourse, { color: colors.mutedText }]} numberOfLines={1}>
                        {skill.course}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <CustomButton
              title={isLocked ? "Details locked" : "Open phase details"}
              onPress={onOpenDetails}
              variant="outline"
              icon={isLocked ? "lock-closed-outline" : "open-outline"}
              fullWidth
              disabled={isLocked}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function getStatusMeta(status: RoadmapPhaseStatus, colors: ReturnType<typeof useAuth>["colors"]) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        color: colors.success,
        borderColor: `${colors.success}66`,
        nodeBorder: `${colors.success}33`,
        icon: "checkmark" as const,
        badgeIcon: "checkmark-circle-outline" as const
      };
    case "active":
      return {
        label: "In progress",
        color: colors.primary,
        borderColor: `${colors.primary}66`,
        nodeBorder: `${colors.primary}33`,
        icon: "play" as const,
        badgeIcon: "radio-button-on-outline" as const
      };
    case "unlocked":
      return {
        label: "Unlocked",
        color: colors.secondary,
        borderColor: colors.border,
        nodeBorder: `${colors.secondary}33`,
        icon: "lock-open" as const,
        badgeIcon: "lock-open-outline" as const
      };
    case "locked":
      return {
        label: "Locked",
        color: colors.warning,
        borderColor: colors.border,
        nodeBorder: `${colors.warning}33`,
        icon: "lock-closed" as const,
        badgeIcon: "lock-closed-outline" as const
      };
  }
}

function Metric({
  icon,
  label,
  value,
  color
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  color: string;
}) {
  const { colors } = useAuth();
  return (
    <View style={[styles.metric, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}17` }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View style={styles.metricCopy}>
        <Text style={[styles.metricLabel, { color: colors.mutedText }]}>{label}</Text>
        <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md
  },
  timelineRail: {
    width: 34,
    alignItems: "center"
  },
  timelineNode: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  timelineLine: {
    flex: 1,
    width: 3,
    minHeight: 118,
    marginTop: spacing.xs,
    borderRadius: radius.pill
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
    ...shadow
  },
  headerWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 88
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  indexBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  indexText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800"
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  meta: {
    fontSize: 12,
    fontWeight: "700"
  },
  description: {
    fontSize: 14,
    lineHeight: 20
  },
  metricsGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  metricCopy: {
    flex: 1,
    minWidth: 0
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800"
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "900"
  },
  progressBlock: {
    gap: spacing.sm
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "900"
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "900"
  },
  expanded: {
    gap: spacing.sm
  },
  lockedPanel: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  lockedText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  skillGrid: {
    gap: spacing.sm
  },
  skillRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  skillCopy: {
    flex: 1,
    gap: 2
  },
  skillTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  skillCourse: {
    fontSize: 12
  }
});
