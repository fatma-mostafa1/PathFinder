import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";
import { useAuth } from "../../contexts/AuthContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { AuthStackParamList } from "../../navigation/types";
import type { AcademicYear } from "../../types";
import { isValidEmail, passwordMessage, requiredMessage } from "../../utils/validation";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const academicYears: AcademicYear[] = ["Preparatory", "First year", "Second year", "Third year", "Fourth year", "Graduate"];

export function RegisterScreen({ navigation }: Props) {
  const { colors, register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [academicYear, setAcademicYear] = useState<AcademicYear>("First year");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {
      fullName: requiredMessage(fullName, "Full name"),
      email: isValidEmail(email) ? "" : "Enter a valid email address.",
      password: passwordMessage(password),
      confirmPassword: password === confirmPassword ? "" : "Passwords do not match.",
      university: requiredMessage(university, "University / College")
    };
    setErrors(nextErrors);
    return Object.values(nextErrors).every((message) => !message);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ fullName, email, password, university, academicYear });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed. Try again.";
      Alert.alert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={[styles.backButton, { borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
              <Text style={[styles.subtitle, { color: colors.mutedText }]}>Start with your academic profile.</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <LinearGradient colors={[`${colors.primary}20`, `${colors.secondary}18`]} style={styles.formBanner}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
              <View style={styles.formBannerText}>
                <Text style={[styles.formBannerTitle, { color: colors.text }]}>Student profile setup</Text>
                <Text style={[styles.formBannerSubtitle, { color: colors.mutedText }]}>Used to personalize your first roadmap.</Text>
              </View>
            </LinearGradient>
            <CustomInput label="Full name" value={fullName} onChangeText={setFullName} icon="person-outline" error={errors.fullName} />
            <CustomInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />
            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible((value) => !value)}
              error={errors.password}
            />
            <CustomInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="shield-checkmark-outline"
              isPassword
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible((value) => !value)}
              error={errors.confirmPassword}
            />
            <CustomInput
              label="University / College"
              value={university}
              onChangeText={setUniversity}
              icon="school-outline"
              error={errors.university}
            />

            <View style={styles.group}>
              <Text style={[styles.label, { color: colors.text }]}>Academic year</Text>
              <View style={styles.chips}>
                {academicYears.map((year) => {
                  const active = year === academicYear;
                  return (
                    <Pressable
                      key={year}
                      onPress={() => setAcademicYear(year)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.primary : colors.surfaceMuted,
                          borderColor: active ? colors.primary : colors.border
                        }
                      ]}
                    >
                      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.text }]}>{year}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <CustomButton title="Register" onPress={handleRegister} loading={loading} icon="person-add-outline" fullWidth />
          </View>

          <View style={styles.footerTextRow}>
            <Text style={[styles.footerText, { color: colors.mutedText }]}>Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    gap: spacing.xl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow
  },
  formBanner: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  formBannerText: {
    flex: 1,
    gap: spacing.xs
  },
  formBannerTitle: {
    fontSize: 14,
    fontWeight: "900"
  },
  formBannerSubtitle: {
    fontSize: 12,
    fontWeight: "700"
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
    paddingVertical: spacing.sm
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800"
  },
  footerTextRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600"
  },
  linkText: {
    fontSize: 14,
    fontWeight: "800"
  }
});
