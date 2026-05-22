import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CareerCard } from "../../components/CareerCard";
import { Header } from "../../components/Header";
import { SectionTitle } from "../../components/SectionTitle";
import { careers } from "../../data/careers";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, spacing } from "../../constants/layout";

const filters = ["All", "Beginner Friendly", "Intermediate", "Advanced"] as const;

export function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAuth();
  const { lastAssessment, setCareerPath } = useRoadmap();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filteredCareers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return careers.filter((career) => {
      const matchesFilter = filter === "All" || career.difficulty === filter;
      const matchesQuery =
        !normalizedQuery ||
        career.title.toLowerCase().includes(normalizedQuery) ||
        career.description.toLowerCase().includes(normalizedQuery) ||
        career.requiredSkills.join(" ").toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Explore" subtitle="Compare career paths and set the one that fits your goals." />

        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search careers, skills, or tools"
            placeholderTextColor={colors.mutedText}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => {
            const active = item === filter;
            return (
              <Text
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    color: active ? "#FFFFFF" : colors.text,
                    borderColor: active ? colors.primary : colors.border
                  }
                ]}
              >
                {item}
              </Text>
            );
          })}
        </ScrollView>

        <SectionTitle title="Available career paths" subtitle={`${filteredCareers.length} paths available`} />
        <View style={styles.list}>
          {filteredCareers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              match={lastAssessment?.allMatches.find((match) => match.career.id === career.id)}
              onPress={() => navigation.navigate("CareerDetails", { careerId: career.id })}
              onViewRoadmap={() => {
                void setCareerPath(career.id);
                navigation.navigate("RoadmapTab", { screen: "RoadmapMain" });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  searchBox: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  searchInput: {
    flex: 1,
    fontSize: 15
  },
  filters: {
    gap: spacing.sm,
    paddingRight: spacing.xl
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: "hidden",
    fontSize: 13,
    fontWeight: "800"
  },
  list: {
    gap: spacing.lg
  }
});
