import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { Header } from "../../components/Header";
import { SectionTitle } from "../../components/SectionTitle";
import { getCareerById } from "../../data/careers";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { ExploreStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ExploreStackParamList, "CareerDetails">;

export function CareerDetailsScreen({ route, navigation }: Props) {
  const { colors } = useAuth();
  const { setCareerPath } = useRoadmap();
  const career = getCareerById(route.params.careerId);

  const handleSetCareer = async () => {
    await setCareerPath(career.id);
    Alert.alert("Career path updated", `${career.title} is now your selected roadmap.`);
    navigation.navigate("ExploreMain");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title={career.title} subtitle={career.difficulty} showBack />

        <LinearGradient
          colors={[career.color, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroPattern}>
            <View style={styles.heroPatternLine} />
            <View style={[styles.heroPatternLine, { width: "58%" }]} />
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name={career.icon} size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>{career.title}</Text>
          <Text style={styles.heroText}>{career.description}</Text>
        </LinearGradient>

        <Section title="Overview" text={career.overview} />
        <DetailList title="Main responsibilities" items={career.responsibilities} icon="briefcase-outline" />
        <DetailList title="Required technical skills" items={career.technicalSkills} icon="construct-outline" />
        <DetailList title="Recommended tools" items={career.tools} icon="build-outline" />
        <DetailList title="Suggested projects" items={career.projects} icon="rocket-outline" />

        <SectionTitle title="Learning roadmap preview" />
        <View style={styles.previewList}>
          {career.roadmapPreview.map((phase, index) => (
            <View key={phase} style={[styles.previewRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.previewNumber, { backgroundColor: `${career.color}1A` }]}>
                <Text style={[styles.previewNumberText, { color: career.color }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.previewText, { color: colors.text }]}>{phase}</Text>
            </View>
          ))}
        </View>

        <CustomButton title="Set as My Career Path" onPress={() => void handleSetCareer()} icon="flag-outline" fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  const { colors } = useAuth();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionText, { color: colors.mutedText }]}>{text}</Text>
    </View>
  );
}

function DetailList({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const { colors } = useAuth();
  return (
    <View style={styles.detailBlock}>
      <SectionTitle title={title} />
      <View style={styles.detailList}>
        {items.map((item) => (
          <View key={item} style={[styles.detailRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name={icon} size={19} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
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
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: "hidden"
  },
  heroPattern: {
    position: "absolute",
    top: 22,
    right: -24,
    width: 150,
    gap: spacing.md,
    opacity: 0.38
  },
  heroPatternLine: {
    height: 10,
    width: "86%",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.3)"
  },
  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900"
  },
  heroText: {
    color: "#ECFEFF",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600"
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 23
  },
  detailBlock: {
    gap: spacing.md
  },
  detailList: {
    gap: spacing.sm
  },
  detailRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  previewList: {
    gap: spacing.sm
  },
  previewRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  previewNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center"
  },
  previewNumberText: {
    fontSize: 14,
    fontWeight: "900"
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  }
});
