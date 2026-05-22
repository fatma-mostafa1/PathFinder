import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { ProgressBar } from "../../components/ProgressBar";
import { SectionTitle } from "../../components/SectionTitle";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatform } from "../../contexts/PlatformContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";

export function ProgressScreen() {
  const { colors, user } = useAuth();
  const { selectedCareer, phases, stats, recentCompletedTasks } = useRoadmap();
  const { dashboard } = usePlatform();
  const currentStreak = stats.completedSkills > 0 ? Math.min(14, 3 + stats.completedPhases * 2) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Progress Analytics" subtitle={`Track ${selectedCareer?.title || "career"} readiness across roadmap, skills, portfolio, and interviews.`} />

        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.overviewCard, { shadowColor: colors.shadow }]}
        >
          <View style={styles.overviewPattern}>
            <View style={styles.overviewPatternLine} />
            <View style={[styles.overviewPatternLine, { width: "52%" }]} />
          </View>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewLabel}>Career readiness score</Text>
              <Text style={styles.overviewValue}>{dashboard.careerReadinessScore}%</Text>
            </View>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{stats.overallProgress}%</Text>
              <Text style={styles.circleLabel}>roadmap</Text>
            </View>
          </View>
          <ProgressBar value={dashboard.careerReadinessScore} height={12} color="#FFFFFF" trackColor="rgba(255,255,255,0.24)" />
        </LinearGradient>

        <View style={styles.metricGrid}>
          <StatCard label="Completed skills" value={dashboard.completedSkills} icon="checkmark-done-outline" accent={colors.success} />
          <StatCard label="Completed projects" value={`${dashboard.completedProjects}/${dashboard.totalProjects}`} icon="rocket-outline" accent={colors.secondary} />
          <StatCard label="Weekly study hours" value={`${user?.studyHoursPerWeek || 8}h`} icon="calendar-outline" accent={colors.primary} />
          <StatCard label="Current streak" value={`${currentStreak} days`} icon="flame-outline" accent={colors.danger} />
        </View>

        <SectionTitle title="Progress analytics" subtitle="Roadmap completion, skills progress, projects, GitHub, interviews, and career readiness." />
        <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <AnalyticsRow label="Roadmap completion" value={stats.overallProgress} color={colors.primary} />
          <AnalyticsRow label="Skills progress" value={Math.round((dashboard.completedSkills / Math.max(dashboard.totalSkills, 1)) * 100)} color={colors.success} />
          <AnalyticsRow label="Completed projects" value={dashboard.portfolioReadiness} color={colors.secondary} />
          <AnalyticsRow label="Interview readiness" value={dashboard.interviewReadiness} color={colors.danger} />
          <AnalyticsRow label="GitHub portfolio readiness" value={dashboard.githubReadiness} color={colors.text} />
        </View>

        <View style={styles.strengthGrid}>
          <InsightCard title="Strongest areas" icon="trending-up-outline" color={colors.success} items={dashboard.strongestAreas} />
          <InsightCard title="Weakest areas" icon="warning-outline" color={colors.warning} items={dashboard.weakestAreas} />
        </View>

        <SectionTitle title="Progress by phase" />
        <View style={styles.phaseList}>
          {phases.map((phase) => (
            <View key={phase.id} style={[styles.phaseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.phaseText}>
                <Text style={[styles.phaseTitle, { color: colors.text }]}>{phase.title}</Text>
                <Text style={[styles.phaseMeta, { color: colors.mutedText }]}>{phase.duration}</Text>
              </View>
              <View style={styles.phaseProgress}>
                <ProgressBar value={phase.progress} showLabel />
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Recent completed tasks" />
        {recentCompletedTasks.length ? (
          <View style={styles.recentList}>
            {recentCompletedTasks.map((task) => (
              <View key={task} style={[styles.recentRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.recentText, { color: colors.text }]}>{task}</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="checkmark-done-outline"
            title="No completed tasks yet"
            message="Mark skills complete in your roadmap and they will appear here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AnalyticsRow({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useAuth();
  return (
    <View style={styles.analyticsRow}>
      <View style={styles.analyticsHeader}>
        <Text style={[styles.analyticsLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.analyticsValue, { color }]}>{value}%</Text>
      </View>
      <ProgressBar value={value} color={color} />
    </View>
  );
}

function InsightCard({
  title,
  icon,
  color,
  items
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  items: string[];
}) {
  const { colors } = useAuth();
  return (
    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.insightHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.insightTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item} style={styles.insightLine}>
          <View style={[styles.insightDot, { backgroundColor: color }]} />
          <Text style={[styles.insightText, { color: colors.mutedText }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxl
  },
  overviewCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    overflow: "hidden",
    ...shadow
  },
  overviewPattern: {
    position: "absolute",
    top: 20,
    right: -18,
    width: 150,
    gap: spacing.md,
    opacity: 0.4
  },
  overviewPatternLine: {
    height: 10,
    width: "82%",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.3)"
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg
  },
  overviewLabel: {
    color: "#DBEAFE",
    fontSize: 13,
    fontWeight: "700"
  },
  overviewValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900"
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center"
  },
  circleText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900"
  },
  circleLabel: {
    color: "#E0F2FE",
    fontSize: 11,
    fontWeight: "700"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  analyticsCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  analyticsRow: {
    gap: spacing.sm
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  analyticsLabel: {
    fontSize: 13,
    fontWeight: "900"
  },
  analyticsValue: {
    fontSize: 13,
    fontWeight: "900"
  },
  strengthGrid: {
    gap: spacing.md
  },
  insightCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "900"
  },
  insightLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  phaseList: {
    gap: spacing.md
  },
  phaseRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  phaseText: {
    flex: 1,
    gap: spacing.xs
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: "800"
  },
  phaseMeta: {
    fontSize: 12,
    fontWeight: "600"
  },
  phaseProgress: {
    width: 136
  },
  recentList: {
    gap: spacing.sm
  },
  recentRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700"
  }
});
