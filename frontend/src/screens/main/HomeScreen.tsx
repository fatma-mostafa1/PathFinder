import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CareerCard } from "../../components/CareerCard";
import { CustomButton } from "../../components/CustomButton";
import { Header } from "../../components/Header";
import { ProgressBar } from "../../components/ProgressBar";
import { SectionTitle } from "../../components/SectionTitle";
import { StatCard } from "../../components/StatCard";
import { careers, recommendedCareerIds } from "../../data/careers";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatform } from "../../contexts/PlatformContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { CareerPath, PlatformModule } from "../../types";

type QuickActionProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
};

function QuickAction({ icon, title, subtitle, color, onPress }: QuickActionProps) {
  const { colors } = useAuth();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: colors.surface,
          borderColor: `${color}55`,
          shadowColor: colors.shadow,
          opacity: pressed ? 0.9 : 1
        }
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.actionSubtitle, { color: colors.mutedText }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedText} />
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, user } = useAuth();
  const { selectedCareer, stats, lastAssessment, setCareerPath } = useRoadmap();
  const { dashboard } = usePlatform();
  const recommendedCareers = recommendedCareerIds
    .map((id) => careers.find((career) => career.id === id))
    .filter(Boolean) as CareerPath[];

  const openAssessment = () => navigation.navigate("RoadmapTab", { screen: "CareerAssessment" });
  const openRoadmap = () => navigation.navigate("RoadmapTab", { screen: "RoadmapMain" });
  const openWorkspace = (initialModule?: PlatformModule) => navigation.navigate("CareerWorkspace", initialModule ? { initialModule } : undefined);
  const openCareerDetails = (careerId: string) =>
    navigation.navigate("ExploreTab", { screen: "CareerDetails", params: { careerId } });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header
          title={`Hi, ${user?.fullName.split(" ")[0] || "Student"}`}
          subtitle="Advanced CS career dashboard for readiness, roadmap, portfolio, and weekly execution."
        />

        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.summaryCard, { shadowColor: colors.shadow }]}
        >
          <View style={styles.summaryPattern}>
            <View style={styles.summaryPatternLine} />
            <View style={[styles.summaryPatternLine, { width: "56%" }]} />
            <View style={[styles.summaryPatternLine, { width: "72%" }]} />
          </View>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Selected career path</Text>
              <Text style={styles.summaryCareer}>{selectedCareer?.title || "Not selected"}</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name={selectedCareer?.icon || "map-outline"} size={28} color="#FFFFFF" />
            </View>
          </View>
          <ProgressBar value={stats.overallProgress} color="#FFFFFF" trackColor="rgba(255,255,255,0.24)" />
          <View style={styles.summaryStats}>
            <View>
              <Text style={styles.statValue}>{dashboard.careerReadinessScore}%</Text>
              <Text style={styles.statLabel}>Career readiness</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{stats.overallProgress}%</Text>
              <Text style={styles.statLabel}>Roadmap progress</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{dashboard.completedSkills}</Text>
              <Text style={styles.statLabel}>Skills completed</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{user?.studyHoursPerWeek || 8}h</Text>
              <Text style={styles.statLabel}>Weekly target</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statGrid}>
          <StatCard label="Completed projects" value={`${dashboard.completedProjects}/${dashboard.totalProjects}`} icon="rocket-outline" accent={colors.secondary} helper={`${dashboard.portfolioReadiness}% portfolio`} />
          <StatCard label="Study streak" value={`${stats.completedSkills > 0 ? Math.min(14, 3 + stats.completedPhases * 2) : 0} days`} icon="flame-outline" accent={colors.danger} helper="Momentum" />
          <StatCard label="Study tasks" value={`${dashboard.completedStudyTasks}/${dashboard.totalStudyTasks}`} icon="calendar-outline" accent={colors.primary} helper="This week" />
          <StatCard label="GitHub readiness" value={`${dashboard.githubReadiness}%`} icon="logo-github" accent={colors.text} helper="Portfolio quality" />
        </View>

        <View style={[styles.nextTaskCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={[styles.nextTaskIcon, { backgroundColor: `${colors.primary}18` }]}>
            <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.nextTaskCopy}>
            <Text style={[styles.nextTaskLabel, { color: colors.mutedText }]}>Next recommended task</Text>
            <Text style={[styles.nextTaskText, { color: colors.text }]}>{dashboard.nextRecommendedTask}</Text>
          </View>
          <CustomButton title="Open" onPress={() => openWorkspace("planner")} variant="outline" icon="open-outline" />
        </View>

        <SectionTitle title="Graduation project workspace" subtitle="Manage skills, projects, resources, resume, interviews, certifications, GitHub, and reminders." />
        <View style={styles.moduleGrid}>
          <ModuleTile title="Skill Tracker" icon="construct-outline" color={colors.primary} onPress={() => openWorkspace("skills")} />
          <ModuleTile title="Projects Portfolio" icon="rocket-outline" color={colors.secondary} onPress={() => openWorkspace("projects")} />
          <ModuleTile title="Learning Resources" icon="library-outline" color={colors.info} onPress={() => openWorkspace("resources")} />
          <ModuleTile title="Study Planner" icon="calendar-outline" color={colors.warning} onPress={() => openWorkspace("planner")} />
          <ModuleTile title="Resume Builder" icon="document-text-outline" color={colors.success} onPress={() => openWorkspace("resume")} />
          <ModuleTile title="Interview Prep" icon="chatbubbles-outline" color={colors.danger} onPress={() => openWorkspace("interview")} />
          <ModuleTile title="Certifications" icon="ribbon-outline" color={colors.primaryDark} onPress={() => openWorkspace("certifications")} />
          <ModuleTile title="GitHub Readiness" icon="logo-github" color={colors.text} onPress={() => openWorkspace("github")} />
          <ModuleTile title="Reminders" icon="notifications-outline" color={colors.secondary} onPress={() => openWorkspace("reminders")} />
        </View>

        <SectionTitle title="Quick actions" subtitle="Generate, refine, or continue your learning plan." />
        <View style={styles.actions}>
          <QuickAction icon="sparkles-outline" title="AI Career Assessment" subtitle="Analyze your fit before generating a roadmap." color={colors.primary} onPress={openAssessment} />
          <QuickAction icon="help-circle-outline" title="Find Best Career Match" subtitle="Compare your goals, skills, and study time." color={colors.secondary} onPress={openAssessment} />
          <QuickAction icon="play-circle-outline" title="Continue Learning" subtitle="Jump back into your active roadmap phases." color={colors.success} onPress={openRoadmap} />
        </View>

        <SectionTitle title="Recommended careers" subtitle="Explore paths that fit CS graduation project goals." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {recommendedCareers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              compact
              match={lastAssessment?.allMatches.find((match) => match.career.id === career.id)}
              onPress={() => openCareerDetails(career.id)}
              onViewRoadmap={() => {
                void setCareerPath(career.id);
                openRoadmap();
              }}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModuleTile({
  title,
  icon,
  color,
  onPress
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
}) {
  const { colors } = useAuth();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.moduleTile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1
        }
      ]}
    >
      <View style={[styles.moduleIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <Text style={[styles.moduleTitle, { color: colors.text }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
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
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    overflow: "hidden",
    ...shadow
  },
  summaryPattern: {
    position: "absolute",
    top: 18,
    right: -18,
    width: 160,
    gap: spacing.md,
    opacity: 0.42
  },
  summaryPatternLine: {
    height: 10,
    width: "86%",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.28)"
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg
  },
  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 13,
    fontWeight: "700"
  },
  summaryCareer: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  statLabel: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  nextTaskCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadow
  },
  nextTaskIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  nextTaskCopy: {
    flex: 1,
    gap: spacing.xs
  },
  nextTaskLabel: {
    fontSize: 12,
    fontWeight: "800"
  },
  nextTaskText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  moduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  moduleTile: {
    width: "30.9%",
    minHeight: 112,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: "center"
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  moduleTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  actions: {
    gap: spacing.md
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  actionCopy: {
    flex: 1,
    gap: spacing.xs
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "900"
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  horizontalList: {
    gap: spacing.md,
    paddingRight: spacing.xl
  }
});
