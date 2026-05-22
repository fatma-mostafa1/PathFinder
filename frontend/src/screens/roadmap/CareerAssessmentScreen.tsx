import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomButton } from "../../components/CustomButton";
import { Header } from "../../components/Header";
import { ProgressBar } from "../../components/ProgressBar";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { roadmapService } from "../../services/roadmapService";
import { radius, shadow, spacing } from "../../constants/layout";
import type { CareerAssessmentResult, CareerMatch, QuizAnswers } from "../../types";
import type { RoadmapStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RoadmapStackParamList, "CareerAssessment">;

const areas = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data and Analytics",
  "Software Engineering",
  "Backend Systems",
  "Frontend Web",
  "Mobile Apps",
  "Cybersecurity",
  "Cloud",
  "DevOps",
  "UI/UX and Product"
];

const experienceLevels = ["Beginner", "Basic projects", "Intermediate", "Advanced"];
const subjects = ["Algorithms", "Databases", "Math", "Statistics", "Networks", "Design", "Security", "Mobile", "Web", "AI"];
const learningStyles = ["Video courses", "Documentation", "Project-based", "Mentorship", "Books and notes"];
const skills = ["Python", "JavaScript", "TypeScript", "Java", "C++", "SQL", "React", "Node.js", "Linux", "Git", "Figma"];
const assessmentSteps = ["Interests", "Experience", "Goals", "Skills"];

const initialAnswers: QuizAnswers = {
  preferredArea: "",
  experienceLevel: "",
  favoriteSubjects: [],
  careerGoal: "",
  studyHoursPerWeek: 8,
  learningStyle: "",
  currentSkills: []
};

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useAuth();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border
        }
      ]}
    >
      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function CareerAssessmentScreen({ navigation }: Props) {
  const { colors } = useAuth();
  const { setCareerPath, saveAssessment } = useRoadmap();
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [assessment, setAssessment] = useState<CareerAssessmentResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const toggleArrayValue = (key: "favoriteSubjects" | "currentSkills", value: string) => {
    setAnswers((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value]
      };
    });
  };

  const validate = () => {
    if (!answers.preferredArea || !answers.experienceLevel || !answers.learningStyle || !answers.careerGoal.trim()) {
      setError("Complete the assessment fields before analyzing your career fit.");
      return false;
    }
    if (answers.favoriteSubjects.length === 0 || answers.currentSkills.length === 0) {
      setError("Choose at least one favorite subject and one current skill.");
      return false;
    }
    return true;
  };

  const validateStep = (step: number) => {
    if (step === 0 && !answers.preferredArea) {
      setError("Choose your preferred CS area to continue.");
      return false;
    }
    if (step === 1 && (!answers.experienceLevel || !answers.learningStyle || answers.favoriteSubjects.length === 0)) {
      setError("Select your experience level, learning style, and at least one favorite subject.");
      return false;
    }
    if (step === 2 && !answers.careerGoal.trim()) {
      setError("Write your career goal before continuing.");
      return false;
    }
    if (step === 3 && answers.currentSkills.length === 0) {
      setError("Choose at least one current skill before analyzing your fit.");
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, assessmentSteps.length - 1));
  };

  const submit = async () => {
    if (!validate()) return;
    setError("");
    setAssessment(null);
    setLoading(true);
    try {
      const result = await roadmapService.assessCareer(answers);
      await saveAssessment(result);
      setAssessment(result);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Career assessment failed. Try again.";
      setError(message);
      Alert.alert("Assessment failed", message);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    if (!assessment) return;
    setGenerating(true);
    try {
      await setCareerPath(assessment.bestCareer.id);
      Alert.alert("Roadmap generated", `${assessment.bestCareer.title} is now your personalized roadmap.`);
      navigation.navigate("RoadmapMain");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Header title="Career Assessment" subtitle="AI-style matching for your CS career direction." showBack />

        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { shadowColor: colors.shadow }]}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={30} color="#FFFFFF" />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Smart Career Fit Analysis</Text>
            <Text style={styles.heroSubtitle}>
              A guided multi-step quiz scores interests, skills, experience, learning style, subjects, and weekly hours against every career path.
            </Text>
          </View>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <StepHeader currentStep={currentStep} />

          {currentStep === 0 ? (
            <Question title="Preferred CS area">
              <View style={styles.chips}>
                {areas.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    active={answers.preferredArea === area}
                    onPress={() => setAnswers((current) => ({ ...current, preferredArea: area }))}
                  />
                ))}
              </View>
            </Question>
          ) : null}

          {currentStep === 1 ? (
            <>
              <Question title="Programming experience level">
                <View style={styles.chips}>
                  {experienceLevels.map((level) => (
                    <Chip
                      key={level}
                      label={level}
                      active={answers.experienceLevel === level}
                      onPress={() => setAnswers((current) => ({ ...current, experienceLevel: level }))}
                    />
                  ))}
                </View>
              </Question>

              <Question title="Favorite subjects">
                <View style={styles.chips}>
                  {subjects.map((subject) => (
                    <Chip
                      key={subject}
                      label={subject}
                      active={answers.favoriteSubjects.includes(subject)}
                      onPress={() => toggleArrayValue("favoriteSubjects", subject)}
                    />
                  ))}
                </View>
              </Question>

              <Question title="Preferred learning style">
                <View style={styles.chips}>
                  {learningStyles.map((style) => (
                    <Chip
                      key={style}
                      label={style}
                      active={answers.learningStyle === style}
                      onPress={() => setAnswers((current) => ({ ...current, learningStyle: style }))}
                    />
                  ))}
                </View>
              </Question>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <Question title="Career goal">
                <TextInput
                  value={answers.careerGoal}
                  onChangeText={(careerGoal) => setAnswers((current) => ({ ...current, careerGoal }))}
                  placeholder="Example: I want to build AI products or get a backend internship."
                  placeholderTextColor={colors.mutedText}
                  multiline
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                />
              </Question>

              <Question title="Weekly available study hours">
                <View style={styles.stepper}>
                  <Pressable
                    style={[styles.stepperButton, { backgroundColor: colors.surfaceMuted }]}
                    onPress={() => setAnswers((current) => ({ ...current, studyHoursPerWeek: Math.max(2, current.studyHoursPerWeek - 1) }))}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </Pressable>
                  <View style={[styles.hoursPanel, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.hoursValue, { color: colors.text }]}>{answers.studyHoursPerWeek}</Text>
                    <Text style={[styles.hoursLabel, { color: colors.mutedText }]}>hours / week</Text>
                  </View>
                  <Pressable
                    style={[styles.stepperButton, { backgroundColor: colors.surfaceMuted }]}
                    onPress={() => setAnswers((current) => ({ ...current, studyHoursPerWeek: Math.min(30, current.studyHoursPerWeek + 1) }))}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </Pressable>
                </View>
              </Question>
            </>
          ) : null}

          {currentStep === 3 ? (
            <Question title="Current skills">
              <View style={styles.chips}>
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    active={answers.currentSkills.includes(skill)}
                    onPress={() => toggleArrayValue("currentSkills", skill)}
                  />
                ))}
              </View>
            </Question>
          ) : null}

          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          <View style={styles.stepActions}>
            {currentStep > 0 ? (
              <CustomButton title="Back" onPress={() => setCurrentStep((step) => Math.max(step - 1, 0))} variant="outline" icon="arrow-back-outline" />
            ) : null}
            {currentStep < assessmentSteps.length - 1 ? (
              <CustomButton title="Next" onPress={goNext} icon="arrow-forward-outline" style={styles.stepActionButton} />
            ) : (
              <CustomButton title="Analyze Career Fit" onPress={submit} loading={loading} icon="analytics-outline" style={styles.stepActionButton} />
            )}
          </View>
        </View>

        {assessment ? <AssessmentResults result={assessment} onGenerateRoadmap={generateRoadmap} generating={generating} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepHeader({ currentStep }: { currentStep: number }) {
  const { colors } = useAuth();
  return (
    <View style={styles.stepHeader}>
      {assessmentSteps.map((step, index) => {
        const active = index === currentStep;
        const completed = index < currentStep;
        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: active || completed ? colors.primary : colors.surfaceMuted,
                  borderColor: active || completed ? colors.primary : colors.border
                }
              ]}
            >
              <Text style={[styles.stepDotText, { color: active || completed ? "#FFFFFF" : colors.mutedText }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, { color: active ? colors.text : colors.mutedText }]} numberOfLines={1}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function AssessmentResults({
  result,
  onGenerateRoadmap,
  generating
}: {
  result: CareerAssessmentResult;
  onGenerateRoadmap: () => void;
  generating: boolean;
}) {
  const { colors } = useAuth();

  return (
    <View style={styles.results}>
      <LinearGradient
        colors={[result.bestCareer.color, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.resultHero, { shadowColor: colors.shadow }]}
      >
        <View style={styles.resultTop}>
          <View style={styles.resultIcon}>
            <Ionicons name={result.bestCareer.icon} size={30} color="#FFFFFF" />
          </View>
          <View style={styles.resultCopy}>
            <Text style={styles.resultLabel}>Best matched career path</Text>
            <Text style={styles.resultTitle}>{result.bestCareer.title}</Text>
          </View>
          <View style={styles.matchCircle}>
            <Text style={styles.matchValue}>{result.matchPercentage}%</Text>
            <Text style={styles.matchLabel}>match</Text>
          </View>
        </View>
        <ProgressBar value={result.matchPercentage} height={10} color="#FFFFFF" trackColor="rgba(255,255,255,0.24)" />
      </LinearGradient>

      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <Text style={[styles.resultSectionTitle, { color: colors.text }]}>Top 3 alternative careers</Text>
        <View style={styles.alternativeList}>
          {result.alternatives.map((match) => (
            <AlternativeCareer key={match.career.id} match={match} />
          ))}
        </View>
      </View>

      <CareerMatchBreakdown result={result} />

      <InsightList title="Strengths" icon="checkmark-circle-outline" color={colors.success} items={result.strengths} />
      <InsightList title="Weaknesses" icon="alert-circle-outline" color={colors.warning} items={result.weaknesses} />
      <InsightList title="Recommended skills to improve" icon="construct-outline" color={colors.primary} items={result.recommendedSkills} badges />

      <CustomButton
        title={`Generate ${result.bestCareer.title} Roadmap`}
        onPress={onGenerateRoadmap}
        loading={generating}
        icon="map-outline"
        fullWidth
      />
    </View>
  );
}

function CareerMatchBreakdown({ result }: { result: CareerAssessmentResult }) {
  const { colors } = useAuth();
  const fallbackMatches = [
    {
      career: result.bestCareer,
      matchPercentage: result.matchPercentage,
      reasons: ["Best overall alignment with your assessment profile."]
    },
    ...result.alternatives
  ];
  const matches = result.allMatches?.length ? result.allMatches : fallbackMatches;

  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.resultSectionHeader}>
        <Ionicons name="podium-outline" size={20} color={colors.primary} />
        <Text style={[styles.resultSectionTitle, { color: colors.text }]}>Career match breakdown</Text>
      </View>
      <Text style={[styles.breakdownSubtitle, { color: colors.mutedText }]}>
        Ranked match percentages for each career path based on your quiz answers and selected skills.
      </Text>
      <View style={styles.matchBreakdownList}>
        {matches.map((match, index) => (
          <CareerMatchRow key={match.career.id} match={match} index={index} />
        ))}
      </View>
    </View>
  );
}

function CareerMatchRow({ match, index }: { match: CareerMatch; index: number }) {
  const { colors } = useAuth();
  const isTopMatch = index === 0;

  return (
    <View
      style={[
        styles.matchRow,
        {
          backgroundColor: isTopMatch ? `${match.career.color}12` : colors.background,
          borderColor: isTopMatch ? `${match.career.color}55` : colors.border
        }
      ]}
    >
      <View style={[styles.matchRank, { backgroundColor: isTopMatch ? match.career.color : colors.surfaceMuted }]}>
        <Text style={[styles.matchRankText, { color: isTopMatch ? "#FFFFFF" : colors.mutedText }]}>{index + 1}</Text>
      </View>
      <View style={[styles.matchIcon, { backgroundColor: `${match.career.color}1F` }]}>
        <Ionicons name={match.career.icon} size={19} color={match.career.color} />
      </View>
      <View style={styles.matchInfo}>
        <View style={styles.matchHeader}>
          <Text style={[styles.matchTitle, { color: colors.text }]} numberOfLines={1}>
            {match.career.title}
          </Text>
          <Text style={[styles.matchScore, { color: match.career.color }]}>{match.matchPercentage}%</Text>
        </View>
        <ProgressBar value={match.matchPercentage} height={7} color={match.career.color} />
        <Text style={[styles.matchReason, { color: colors.mutedText }]} numberOfLines={2}>
          {match.reasons[0] || "Transferable CS foundations support this path."}
        </Text>
      </View>
    </View>
  );
}

function AlternativeCareer({ match }: { match: CareerMatch }) {
  const { colors } = useAuth();
  return (
    <View style={[styles.alternativeCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.alternativeIcon, { backgroundColor: `${match.career.color}1F` }]}>
        <Ionicons name={match.career.icon} size={20} color={match.career.color} />
      </View>
      <View style={styles.alternativeCopy}>
        <Text style={[styles.alternativeTitle, { color: colors.text }]}>{match.career.title}</Text>
        <Text style={[styles.alternativeReason, { color: colors.mutedText }]} numberOfLines={2}>
          {match.reasons[0]}
        </Text>
      </View>
      <Text style={[styles.alternativeScore, { color: match.career.color }]}>{match.matchPercentage}%</Text>
    </View>
  );
}

function InsightList({
  title,
  icon,
  color,
  items,
  badges = false
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  items: string[];
  badges?: boolean;
}) {
  const { colors } = useAuth();
  return (
    <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.resultSectionHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.resultSectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={badges ? styles.badgeGrid : styles.insightList}>
        {items.map((item) =>
          badges ? (
            <View key={item} style={[styles.skillBadge, { backgroundColor: `${color}17`, borderColor: `${color}55` }]}>
              <Text style={[styles.skillBadgeText, { color }]}>{item}</Text>
            </View>
          ) : (
            <View key={item} style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: color }]} />
              <Text style={[styles.insightText, { color: colors.mutedText }]}>{item}</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useAuth();
  return (
    <View style={styles.question}>
      <Text style={[styles.questionTitle, { color: colors.text }]}>{title}</Text>
      {children}
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
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
    ...shadow
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
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: "#DBEAFE",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xl,
    ...shadow
  },
  question: {
    gap: spacing.md
  },
  stepHeader: {
    flexDirection: "row",
    gap: spacing.sm
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 0
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: "900"
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800"
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: "900"
  },
  chips: {
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
  chipText: {
    fontSize: 13,
    fontWeight: "800"
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    textAlignVertical: "top"
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  stepperButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  hoursPanel: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "900"
  },
  hoursLabel: {
    fontSize: 12,
    fontWeight: "800"
  },
  error: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19
  },
  stepActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  stepActionButton: {
    flex: 1
  },
  results: {
    gap: spacing.lg
  },
  resultHero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  resultIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  resultCopy: {
    flex: 1,
    gap: spacing.xs
  },
  resultLabel: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "800"
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900"
  },
  matchCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.38)",
    alignItems: "center",
    justifyContent: "center"
  },
  matchValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900"
  },
  matchLabel: {
    color: "#E0F2FE",
    fontSize: 10,
    fontWeight: "800"
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  resultSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  resultSectionTitle: {
    fontSize: 17,
    fontWeight: "900"
  },
  breakdownSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  matchBreakdownList: {
    gap: spacing.sm
  },
  matchRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  matchRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  matchRankText: {
    fontSize: 12,
    fontWeight: "900"
  },
  matchIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  matchInfo: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  matchTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900"
  },
  matchScore: {
    fontSize: 16,
    fontWeight: "900"
  },
  matchReason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  alternativeList: {
    gap: spacing.sm
  },
  alternativeCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  alternativeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  alternativeCopy: {
    flex: 1,
    gap: spacing.xs
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: "900"
  },
  alternativeReason: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  alternativeScore: {
    fontSize: 17,
    fontWeight: "900"
  },
  insightList: {
    gap: spacing.sm
  },
  insightRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  skillBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: "900"
  }
});
