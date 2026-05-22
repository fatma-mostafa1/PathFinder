import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { CustomInput } from "../../components/CustomInput";
import { useAuth } from "../../contexts/AuthContext";
import { radius, shadow, spacing } from "../../constants/layout";
import type { AuthStackParamList } from "../../navigation/types";
import { isValidEmail, passwordMessage } from "../../utils/validation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { colors, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const validate = () => {
    const nextErrors = {
      email: isValidEmail(email) ? "" : "Enter a valid email address.",
      password: passwordMessage(password)
    };
    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email, password, remember);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Try again.";
      setErrors({ form: message });
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.logo}>
              <Ionicons name="navigate" size={34} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.brand, { color: colors.text }]}>PathFinder</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>
              Sign in to continue your personalized CS career roadmap.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <CustomInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="student@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />
            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              icon="lock-closed-outline"
              isPassword
              passwordVisible={passwordVisible}
              onTogglePassword={() => setPasswordVisible((value) => !value)}
              error={errors.password}
            />

            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember((value) => !value)}>
                <Ionicons
                  name={remember ? "checkbox" : "square-outline"}
                  size={22}
                  color={remember ? colors.primary : colors.mutedText}
                />
                <Text style={[styles.optionText, { color: colors.text }]}>Remember me</Text>
              </TouchableOpacity>
              <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Forgot Password?</Text>
              </Pressable>
            </View>

            {errors.form ? <Text style={[styles.formError, { color: colors.danger }]}>{errors.form}</Text> : null}
            <CustomButton title="Login" onPress={handleLogin} loading={loading} icon="log-in-outline" fullWidth />
          </View>

          <View style={styles.footerTextRow}>
            <Text style={[styles.footerText, { color: colors.mutedText }]}>New to PathFinder?</Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Create account</Text>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xl
  },
  brandBlock: {
    alignItems: "center",
    gap: spacing.md
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  brand: {
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadow
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  optionText: {
    fontSize: 14,
    fontWeight: "700"
  },
  linkText: {
    fontSize: 14,
    fontWeight: "800"
  },
  formError: {
    fontSize: 13,
    fontWeight: "700"
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
  }
});
