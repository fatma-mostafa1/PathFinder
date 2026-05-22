import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomButton } from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";
import { Header } from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { careers } from "../../data/careers";
import { radius, spacing } from "../../constants/layout";
import type { AcademicYear } from "../../types";
import { requiredMessage } from "../../utils/validation";

const academicYears: AcademicYear[] = ["Preparatory", "First year", "Second year", "Third year", "Fourth year", "Graduate"];

export function EditProfileScreen() {
  const { colors, user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [academicYear, setAcademicYear] = useState<AcademicYear>(user?.academicYear || "First year");
  const [careerInterest, setCareerInterest] = useState(user?.careerInterest || "Software Engineer");
  const [studyHours, setStudyHours] = useState(String(user?.studyHoursPerWeek || 8));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async () => {
    const nextErrors = {
      fullName: requiredMessage(fullName, "Full name"),
      university: requiredMessage(university, "University / College"),
      careerInterest: requiredMessage(careerInterest, "Career interest"),
      studyHours: Number(studyHours) > 0 ? "" : "Study hours must be greater than zero."
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const selectedCareer = careers.find((career) => career.title === careerInterest);
    await updateProfile({
      fullName,
      university,
      academicYear,
      careerInterest,
      selectedCareerPath: selectedCareer?.id || user?.selectedCareerPath,
      studyHoursPerWeek: Number(studyHours)
    });
    Alert.alert("Profile updated", "Your profile changes have been saved locally.");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Header title="Edit Profile" subtitle="Update your academic and learning preferences." showBack />
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CustomInput label="Full name" value={fullName} onChangeText={setFullName} icon="person-outline" error={errors.fullName} />
            <CustomInput
              label="University / College"
              value={university}
              onChangeText={setUniversity}
              icon="school-outline"
              error={errors.university}
            />
            <SelectionGroup
              title="Academic year"
              options={academicYears}
              selected={academicYear}
              onSelect={(value) => setAcademicYear(value as AcademicYear)}
            />
            <SelectionGroup
              title="Career interest"
              options={careers.map((career) => career.title)}
              selected={careerInterest}
              onSelect={setCareerInterest}
            />
            <CustomInput
              label="Study hours per week"
              value={studyHours}
              onChangeText={setStudyHours}
              keyboardType="number-pad"
              icon="time-outline"
              error={errors.studyHours}
            />
            <CustomButton title="Save changes" onPress={() => void save()} icon="save-outline" fullWidth />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SelectionGroup({
  title,
  options,
  selected,
  onSelect
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const { colors } = useAuth();
  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option === selected;
          return (
            <Text
              key={option}
              onPress={() => onSelect(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceMuted,
                  borderColor: active ? colors.primary : colors.border,
                  color: active ? "#FFFFFF" : colors.text
                }
              ]}
            >
              {option}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxl
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg
  },
  group: {
    gap: spacing.sm
  },
  label: {
    fontSize: 14,
    fontWeight: "700"
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
    paddingVertical: spacing.sm,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "800"
  }
});
