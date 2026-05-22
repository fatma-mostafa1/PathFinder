import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ProgressBar } from "../../components/ProgressBar";
import { RoadmapPhaseCard } from "../../components/RoadmapPhaseCard";
import { SectionTitle } from "../../components/SectionTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { RoadmapStackParamList } from "../../navigation/types";
import type { RoadmapPhaseStatus } from "../../components/RoadmapPhaseCard";

type Props = NativeStackScreenProps<RoadmapStackParamList, "RoadmapMain">;

export function RoadmapScreen({ navigation }: Props) {
  const { colors } = useAuth();
  const { selectedCareer, phases, stats, isLoading, togglePhaseSkill } = useRoadmap();
  const firstIncompleteIndex = phases.findIndex((phase) => phase.progress < 100);
  const activeIndex = firstIncompleteIndex === -1 ? phases.length - 1 : firstIncompleteIndex;
  const activePhase = phases[activeIndex];

  if (isLoading && phases.length === 0) {
    return <LoadingSpinner message="Preparing your personalized roadmap..." />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header
          title="Roadmap"
          subtitle={selectedCareer ? `${selectedCareer.title} learning path` : "Personalized career learning path"}
          right={<CustomButton title="Assess" onPress={() => navigation.navigate("CareerAssessment")} variant="outline" icon="analytics-outline" />}
        />

        {phases.length === 0 ? (
          <EmptyState
            title="No roadmap generated"
            message="Complete the career assessment to generate a personalized roadmap."
            actionLabel="Start Assessment"
            onAction={() => navigation.navigate("CareerAssessment")}
          />
        ) : (
          <>
            <LinearGradient
              colors={[selectedCareer?.color || colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.overview, { shadowColor: colors.shadow }]}
            >
              <View style={styles.overviewHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name={selectedCareer?.icon || "map-outline"} size={26} color="#FFFFFF" />
                </View>
                <View style={styles.overviewCopy}>
                  <Text style={styles.overviewTitle}>{selectedCareer?.title}</Text>
                  <Text style={styles.overviewSubtitle}>
                    {phases.length} phases | {stats.totalSkills} skills | {stats.completedSkills} complete
                  </Text>
                </View>
              </View>
              <ProgressBar
                value={stats.overallProgress}
                showLabel
                color="#FFFFFF"
                trackColor="rgba(255,255,255,0.24)"
                labelColor="#FFFFFF"
              />
              <View style={styles.overviewStats}>
                <OverviewStat label="Current phase" value={activePhase?.title || "Completed"} icon="flag-outline" />
                <OverviewStat label="Unlocked" value={`${Math.min(activeIndex + 1, phases.length)}/${phases.length}`} icon="lock-open-outline" />
                <OverviewStat label="Remaining" value={`${stats.remainingSkills} skills`} icon="layers-outline" />
              </View>
            </LinearGradient>

            <SectionTitle
              title="Interactive roadmap timeline"
              subtitle="Follow unlocked phases, expand details, track skills, and progress through the guided sequence."
            />
            <View style={styles.phaseList}>
              {phases.map((phase, index) => {
                const status = getPhaseStatus(phase.progress, index, activeIndex);
                return (
                  <RoadmapPhaseCard
                    key={phase.id}
                    phase={phase}
                    index={index}
                    status={status}
                    isLast={index === phases.length - 1}
                    onToggleSkill={(skillId) => void togglePhaseSkill(phase.id, skillId)}
                    onOpenDetails={() => navigation.navigate("RoadmapDetails", { phaseId: phase.id })}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getPhaseStatus(progress: number, index: number, activeIndex: number): RoadmapPhaseStatus {
  if (progress === 100) return "completed";
  if (index === activeIndex) return "active";
  if (progress > 0 || index < activeIndex) return "unlocked";
  return "locked";
}

function OverviewStat({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Ionicons>["name"] }) {
  return (
    <View style={styles.overviewStat}>
      <Ionicons name={icon} size={16} color="#FFFFFF" />
      <View style={styles.overviewStatCopy}>
        <Text style={styles.overviewStatValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.overviewStatLabel}>{label}</Text>
      </View>
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
  overview: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: "hidden",
    ...shadow
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  overviewCopy: {
    flex: 1,
    gap: spacing.xs
  },
  overviewTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  overviewSubtitle: {
    color: "#E0F2FE",
    fontSize: 13,
    fontWeight: "700"
  },
  overviewStats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  overviewStat: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  overviewStatCopy: {
    flex: 1,
    minWidth: 0
  },
  overviewStatValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  overviewStatLabel: {
    color: "#DBEAFE",
    fontSize: 10,
    fontWeight: "800"
  },
  phaseList: {
    gap: spacing.lg
  }
});
