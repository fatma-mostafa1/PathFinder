import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { Header } from "../../components/Header";
import { ProgressBar } from "../../components/ProgressBar";
import { SectionTitle } from "../../components/SectionTitle";
import { learningResources } from "../../data/platform";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatform } from "../../contexts/PlatformContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type {
  CertificationStatus,
  PlatformModule,
  ResourceDifficulty,
  ResourceType,
  SkillLevel,
  SkillTrackerStatus
} from "../../types";
import type { HomeStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<HomeStackParamList, "CareerWorkspace">;

const modules: { id: PlatformModule; title: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { id: "skills", title: "Skills", icon: "construct-outline" },
  { id: "projects", title: "Projects", icon: "rocket-outline" },
  { id: "resources", title: "Resources", icon: "library-outline" },
  { id: "planner", title: "Planner", icon: "calendar-outline" },
  { id: "resume", title: "Resume", icon: "document-text-outline" },
  { id: "interview", title: "Interview", icon: "chatbubbles-outline" },
  { id: "certifications", title: "Certs", icon: "ribbon-outline" },
  { id: "github", title: "GitHub", icon: "logo-github" },
  { id: "reminders", title: "Reminders", icon: "notifications-outline" }
];

const skillStatuses: SkillTrackerStatus[] = ["Not Started", "In Progress", "Completed"];
const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];
const certStatuses: CertificationStatus[] = ["Planned", "In Progress", "Completed"];
const resourceTypes: ("All" | ResourceType)[] = ["All", "Course", "Documentation", "Video", "Book", "Practice", "Article"];
const resourceDifficulties: ("All" | ResourceDifficulty)[] = ["All", "Beginner", "Intermediate", "Advanced"];

export function CareerWorkspaceScreen({ route }: Props) {
  const { colors, user } = useAuth();
  const { selectedCareer } = useRoadmap();
  const { state, dashboard } = usePlatform();
  const [activeModule, setActiveModule] = useState<PlatformModule>(route.params?.initialModule || "skills");

  useEffect(() => {
    if (route.params?.initialModule) {
      setActiveModule(route.params.initialModule);
    }
  }, [route.params?.initialModule]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Header
          title="Career Workspace"
          subtitle={`${selectedCareer?.title || "CS"} platform tools for graduation project readiness.`}
          showBack
        />

        <LinearGradient
          colors={[selectedCareer?.color || colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { shadowColor: colors.shadow }]}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name={selectedCareer?.icon || "briefcase-outline"} size={30} color="#FFFFFF" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>Career readiness score</Text>
              <Text style={styles.heroTitle}>{dashboard.careerReadinessScore}% ready</Text>
              <Text style={styles.heroSubtitle}>{user?.studyHoursPerWeek || 8} weekly study hours configured</Text>
            </View>
          </View>
          <ProgressBar value={dashboard.careerReadinessScore} color="#FFFFFF" trackColor="rgba(255,255,255,0.24)" />
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moduleTabs}>
          {modules.map((module) => {
            const active = activeModule === module.id;
            return (
              <Pressable
                key={module.id}
                onPress={() => setActiveModule(module.id)}
                style={[
                  styles.moduleTab,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border
                  }
                ]}
              >
                <Ionicons name={module.icon} size={17} color={active ? "#FFFFFF" : colors.primary} />
                <Text style={[styles.moduleTabText, { color: active ? "#FFFFFF" : colors.text }]}>{module.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeModule === "skills" ? <SkillTrackerModule /> : null}
        {activeModule === "projects" ? <ProjectsModule /> : null}
        {activeModule === "resources" ? <ResourcesModule careerId={selectedCareer?.id || "software-engineer"} /> : null}
        {activeModule === "planner" ? <PlannerModule /> : null}
        {activeModule === "resume" ? <ResumeModule /> : null}
        {activeModule === "interview" ? <InterviewModule /> : null}
        {activeModule === "certifications" ? <CertificationsModule /> : null}
        {activeModule === "github" ? <GithubModule /> : null}
        {activeModule === "reminders" ? <RemindersModule /> : null}

        <SectionTitle title="Recent activity" subtitle="Signals used by the dashboard score." />
        <View style={styles.list}>
          {dashboard.recentActivity.map((activity) => (
            <InfoRow key={activity} icon="pulse-outline" title={activity} color={colors.primary} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SkillTrackerModule() {
  const { colors } = useAuth();
  const { state, updateSkill } = usePlatform();
  return (
    <ModuleSection title="Skill Tracker" subtitle="Track skill level, status, progress, and recommended resources.">
      <View style={styles.list}>
        {state.skills.map((skill) => (
          <View key={skill.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{skill.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{skill.resources.slice(0, 2).join(" | ")}</Text>
              </View>
              <Text style={[styles.percent, { color: colors.primary }]}>{skill.progress}%</Text>
            </View>
            <ProgressBar value={skill.progress} color={colors.primary} />
            <ChipRow
              items={skillStatuses}
              active={skill.status}
              onPress={(status) => void updateSkill(skill.id, { status: status as SkillTrackerStatus })}
            />
            <ChipRow
              items={skillLevels}
              active={skill.level}
              onPress={(level) => void updateSkill(skill.id, { level: level as SkillLevel })}
              compact
            />
          </View>
        ))}
      </View>
    </ModuleSection>
  );
}

function ProjectsModule() {
  const { colors } = useAuth();
  const { state, dashboard, updateProject } = usePlatform();
  return (
    <ModuleSection title="Projects Portfolio" subtitle="Complete suggested projects and attach GitHub links for portfolio evidence.">
      <ReadinessCard label="Portfolio readiness" value={dashboard.portfolioReadiness} color={colors.secondary} />
      <View style={styles.list}>
        {state.projects.map((project) => (
          <View key={project.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{project.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{project.description}</Text>
              </View>
              <Switch value={project.completed} onValueChange={(completed) => void updateProject(project.id, { completed })} />
            </View>
            <View style={styles.badgeWrap}>
              {project.skills.map((skill) => (
                <Badge key={skill} label={skill} color={colors.secondary} />
              ))}
            </View>
            <TextInput
              value={project.githubUrl}
              onChangeText={(githubUrl) => void updateProject(project.id, { githubUrl })}
              placeholder="GitHub repository link"
              placeholderTextColor={colors.mutedText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>
        ))}
      </View>
    </ModuleSection>
  );
}

function ResourcesModule({ careerId }: { careerId: string }) {
  const { colors } = useAuth();
  const [typeFilter, setTypeFilter] = useState<(typeof resourceTypes)[number]>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof resourceDifficulties)[number]>("All");
  const filtered = useMemo(
    () =>
      learningResources.filter((resource) => {
        const careerMatch = resource.careerIds.includes(careerId) || resource.careerIds.length > 5;
        const typeMatch = typeFilter === "All" || resource.type === typeFilter;
        const difficultyMatch = difficultyFilter === "All" || resource.difficulty === difficultyFilter;
        return careerMatch && typeMatch && difficultyMatch;
      }),
    [careerId, difficultyFilter, typeFilter]
  );

  return (
    <ModuleSection title="Learning Resources" subtitle="Filter courses, docs, videos, books, practice platforms, and articles by difficulty.">
      <ChipRow items={resourceTypes} active={typeFilter} onPress={(item) => setTypeFilter(item as (typeof resourceTypes)[number])} />
      <ChipRow items={resourceDifficulties} active={difficultyFilter} onPress={(item) => setDifficultyFilter(item as (typeof resourceDifficulties)[number])} />
      <View style={styles.list}>
        {filtered.map((resource) => (
          <View key={resource.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{resource.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{resource.provider} | {resource.type} | {resource.difficulty}</Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.bodyText, { color: colors.mutedText }]}>{resource.description}</Text>
          </View>
        ))}
      </View>
    </ModuleSection>
  );
}

function PlannerModule() {
  const { colors } = useAuth();
  const { state, generateStudyPlan, toggleStudyTask } = usePlatform();
  const [targetDate, setTargetDate] = useState(state.studyPlan.targetDate || "2026-08-30");
  return (
    <ModuleSection title="Weekly Study Planner" subtitle="Generate a weekly schedule from your roadmap, available hours, and target completion date.">
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <TextInput
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="Target completion date, e.g. 2026-08-30"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <CustomButton title="Generate study schedule" onPress={() => void generateStudyPlan(targetDate)} icon="calendar-outline" fullWidth />
      </View>
      <View style={styles.list}>
        {state.studyPlan.tasks.map((task) => (
          <Pressable
            key={task.id}
            onPress={() => void toggleStudyTask(task.id)}
            style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: task.done ? `${colors.success}66` : colors.border }]}
          >
            <Ionicons name={task.done ? "checkmark-circle" : "ellipse-outline"} size={22} color={task.done ? colors.success : colors.mutedText} />
            <View style={styles.rowCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{task.day}: {task.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{task.phaseTitle} | {task.durationHours}h</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ModuleSection>
  );
}

function ResumeModule() {
  const { colors } = useAuth();
  const { state, updateResume } = usePlatform();
  const fields: { key: keyof typeof state.resume; label: string }[] = [
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "projects", label: "Projects" },
    { key: "certifications", label: "Certifications" },
    { key: "experience", label: "Experience" }
  ];

  return (
    <ModuleSection title="Resume Builder" subtitle="Save resume sections locally and preview a professional CS student resume.">
      {fields.map((field) => (
        <View key={field.key} style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
          <TextInput
            value={state.resume[field.key]}
            onChangeText={(value) => void updateResume({ [field.key]: value })}
            multiline
            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          />
        </View>
      ))}
      <View style={[styles.resumePreview, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <Text style={[styles.previewName, { color: colors.text }]}>CS Student Resume Preview</Text>
        {fields.map((field) => (
          <View key={field.key} style={styles.previewSection}>
            <Text style={[styles.previewHeading, { color: colors.primary }]}>{field.label}</Text>
            <Text style={[styles.bodyText, { color: colors.mutedText }]}>{state.resume[field.key]}</Text>
          </View>
        ))}
      </View>
    </ModuleSection>
  );
}

function InterviewModule() {
  const { colors } = useAuth();
  const { state, dashboard, toggleInterviewTask } = usePlatform();
  return (
    <ModuleSection title="Interview Preparation" subtitle="Technical questions, behavioral prompts, and coding practice by career path.">
      <ReadinessCard label="Interview readiness" value={dashboard.interviewReadiness} color={colors.danger} />
      <View style={styles.list}>
        {state.interviewTasks.map((task) => (
          <Pressable
            key={task.id}
            onPress={() => void toggleInterviewTask(task.id)}
            style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: task.completed ? `${colors.success}66` : colors.border }]}
          >
            <Ionicons name={task.completed ? "checkmark-circle" : "radio-button-off-outline"} size={22} color={task.completed ? colors.success : colors.mutedText} />
            <View style={styles.rowCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{task.category} | {task.difficulty}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{task.prompt}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ModuleSection>
  );
}

function CertificationsModule() {
  const { colors } = useAuth();
  const { state, dashboard, updateCertification } = usePlatform();
  return (
    <ModuleSection title="Certifications Tracker" subtitle="Plan, start, and complete certifications recommended for your selected career path.">
      <ReadinessCard label="Certification progress" value={dashboard.certificationProgress} color={colors.primary} />
      <View style={styles.list}>
        {state.certifications.map((certification) => (
          <View key={certification.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{certification.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{certification.issuer} | {certification.description}</Text>
            <ChipRow
              items={certStatuses}
              active={certification.status}
              onPress={(status) => void updateCertification(certification.id, status as CertificationStatus)}
            />
          </View>
        ))}
      </View>
    </ModuleSection>
  );
}

function GithubModule() {
  const { colors } = useAuth();
  const { state, dashboard, toggleGithubItem } = usePlatform();
  return (
    <ModuleSection title="GitHub Portfolio Readiness" subtitle="Checklist for profile quality, READMEs, pinned projects, deployed links, and clean structure.">
      <ReadinessCard label="GitHub readiness" value={dashboard.githubReadiness} color={colors.text} />
      <View style={styles.list}>
        {state.githubChecklist.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => void toggleGithubItem(item.id)}
            style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: item.completed ? `${colors.success}66` : colors.border }]}
          >
            <Ionicons name={item.completed ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.completed ? colors.success : colors.mutedText} />
            <View style={styles.rowCopy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>{item.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ModuleSection>
  );
}

function RemindersModule() {
  const { colors } = useAuth();
  const { state, updateReminders } = usePlatform();
  return (
    <ModuleSection title="Notifications and Reminders" subtitle="Configure reminder UI for weekly goals, roadmap deadlines, and study streaks.">
      <ReminderRow
        title="Weekly goal reminders"
        value={state.reminders.weeklyGoalReminders}
        onValueChange={(weeklyGoalReminders) => void updateReminders({ weeklyGoalReminders })}
      />
      <ReminderRow
        title="Roadmap deadline reminders"
        value={state.reminders.roadmapDeadlineReminders}
        onValueChange={(roadmapDeadlineReminders) => void updateReminders({ roadmapDeadlineReminders })}
      />
      <ReminderRow
        title="Study streak reminders"
        value={state.reminders.studyStreakReminders}
        onValueChange={(studyStreakReminders) => void updateReminders({ studyStreakReminders })}
      />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Preferred reminder day</Text>
        <TextInput
          value={state.reminders.preferredDay}
          onChangeText={(preferredDay) => void updateReminders({ preferredDay })}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Preferred reminder time</Text>
        <TextInput
          value={state.reminders.preferredTime}
          onChangeText={(preferredTime) => void updateReminders({ preferredTime })}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />
      </View>
    </ModuleSection>
  );
}

function ModuleSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View style={styles.moduleSection}>
      <SectionTitle title={title} subtitle={subtitle} />
      {children}
    </View>
  );
}

function ChipRow({
  items,
  active,
  onPress,
  compact = false
}: {
  items: readonly string[];
  active: string;
  onPress: (item: string) => void;
  compact?: boolean;
}) {
  const { colors } = useAuth();
  return (
    <View style={styles.chipRow}>
      {items.map((item) => {
        const selected = item === active;
        return (
          <Pressable
            key={item}
            onPress={() => onPress(item)}
            style={[
              styles.chip,
              compact ? styles.compactChip : null,
              {
                backgroundColor: selected ? colors.primary : colors.background,
                borderColor: selected ? colors.primary : colors.border
              }
            ]}
          >
            <Text style={[styles.chipText, { color: selected ? "#FFFFFF" : colors.text }]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ReadinessCard({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useAuth();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.percent, { color }]}>{value}%</Text>
      </View>
      <ProgressBar value={value} color={color} />
    </View>
  );
}

function ReminderRow({ title, value, onValueChange }: { title: string; value: boolean; onValueChange: (value: boolean) => void }) {
  const { colors } = useAuth();
  return (
    <View style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="notifications-outline" size={21} color={colors.primary} />
      <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]}>{title}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function InfoRow({ icon, title, color }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; color: string }) {
  const { colors } = useAuth();
  return (
    <View style={[styles.rowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.cardSubtitle, { color: colors.text, flex: 1 }]}>{title}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: `${color}55`, backgroundColor: `${color}14` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
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
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  heroLabel: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "800"
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: "#E0F2FE",
    fontSize: 13,
    fontWeight: "700"
  },
  moduleTabs: {
    gap: spacing.sm,
    paddingRight: spacing.xl
  },
  moduleTab: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  moduleTabText: {
    fontSize: 13,
    fontWeight: "900"
  },
  moduleSection: {
    gap: spacing.lg
  },
  list: {
    gap: spacing.md
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  rowCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  cardTitleWrap: {
    flex: 1,
    gap: spacing.xs
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  percent: {
    fontSize: 20,
    fontWeight: "900"
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  compactChip: {
    paddingVertical: 7
  },
  chipText: {
    fontSize: 12,
    fontWeight: "900"
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900"
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: "700"
  },
  textArea: {
    minHeight: 94,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top"
  },
  fieldBlock: {
    gap: spacing.sm
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "900"
  },
  resumePreview: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  previewName: {
    fontSize: 20,
    fontWeight: "900"
  },
  previewSection: {
    gap: spacing.xs
  },
  previewHeading: {
    fontSize: 13,
    fontWeight: "900"
  }
});
