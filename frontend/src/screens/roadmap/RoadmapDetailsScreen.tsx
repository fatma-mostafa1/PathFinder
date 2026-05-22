import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomButton } from "../../components/CustomButton";
import { EmptyState } from "../../components/EmptyState";
import { Header } from "../../components/Header";
import { ProgressBar } from "../../components/ProgressBar";
import { SectionTitle } from "../../components/SectionTitle";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { RoadmapStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RoadmapStackParamList, "RoadmapDetails">;

export function RoadmapDetailsScreen({ route, navigation }: Props) {
  const { colors } = useAuth();
  const { getPhaseById, markPhaseComplete } = useRoadmap();
  const phase = getPhaseById(route.params.phaseId);

  if (!phase) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <Header title="Phase Details" showBack />
          <EmptyState title="Phase not found" message="This roadmap phase may have been reset." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title={phase.title} subtitle={phase.duration} showBack />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <Text style={[styles.description, { color: colors.mutedText }]}>{phase.detailedExplanation}</Text>
          <ProgressBar value={phase.progress} showLabel color={colors.secondary} />
        </View>

        <SectionTitle title="Skills to learn" />
        <View style={styles.list}>
          {phase.skills.map((skill) => (
            <View key={skill.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons
                name={skill.completed ? "checkmark-circle" : "ellipse-outline"}
                size={21}
                color={skill.completed ? colors.success : colors.mutedText}
              />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{skill.title}</Text>
                {skill.course ? <Text style={[styles.rowSubtitle, { color: colors.mutedText }]}>{skill.course}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Recommended courses" />
        <BulletList items={phase.courses} />

        <SectionTitle title="Recommended projects" />
        <BulletList items={phase.projects} />

        <View style={[styles.timeCard, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name="time-outline" size={22} color={colors.primary} />
          <Text style={[styles.timeText, { color: colors.text }]}>Estimated time: {phase.duration}</Text>
        </View>

        <CustomButton
          title="Mark phase as complete"
          onPress={() => {
            void markPhaseComplete(phase.id);
            navigation.goBack();
          }}
          icon="checkmark-done-outline"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function BulletList({ items }: { items: string[] }) {
  const { colors } = useAuth();
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="arrow-forward-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.rowTitle, { color: colors.text }]}>{item}</Text>
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
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow
  },
  description: {
    fontSize: 15,
    lineHeight: 23
  },
  list: {
    gap: spacing.sm
  },
  row: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  rowText: {
    flex: 1,
    gap: spacing.xs
  },
  rowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: "600"
  },
  timeCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  timeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800"
  }
});
