import React from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useRoadmap } from "../../contexts/RoadmapContext";
import { radius, spacing } from "../../constants/layout";

function SettingRow({
  icon,
  title,
  subtitle,
  right,
  danger,
  onPress
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useAuth();
  return (
    <View onTouchEnd={onPress} style={[styles.settingRow, { borderColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? `${colors.danger}1A` : colors.surfaceMuted }]}>
        <Ionicons name={icon} size={21} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: danger ? colors.danger : colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.settingSubtitle, { color: colors.mutedText }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SettingsScreen() {
  const { colors, settings, updateSettings, logout } = useAuth();
  const { resetProgress } = useRoadmap();

  const confirmReset = () => {
    Alert.alert("Reset roadmap progress", "This will clear completed skills for your current roadmap.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => void resetProgress()
      }
    ]);
  };

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => void logout() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header title="Settings" subtitle="Control app preferences and roadmap state." showBack />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="moon-outline"
            title="Dark mode"
            subtitle="Switch the app interface theme."
            right={
              <Switch
                value={settings.darkMode}
                onValueChange={(darkMode) => void updateSettings({ darkMode })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Study reminders and roadmap updates."
            right={
              <Switch
                value={settings.notifications}
                onValueChange={(notifications) => void updateSettings({ notifications })}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingRow
            icon="refresh-outline"
            title="Reset roadmap progress"
            subtitle="Clear completed skills and restart your plan."
            danger
            onPress={confirmReset}
          />
          <SettingRow
            icon="information-circle-outline"
            title="About PathFinder"
            subtitle="Personalized Career and Learning Roadmaps for CS Students."
            onPress={() =>
              Alert.alert(
                "About PathFinder",
                "PathFinder helps CS students choose career paths, generate learning roadmaps, track progress, and manage their academic profile."
              )
            }
          />
          <SettingRow icon="log-out-outline" title="Logout" danger onPress={confirmLogout} />
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
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden"
  },
  settingRow: {
    minHeight: 76,
    padding: spacing.lg,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  settingCopy: {
    flex: 1,
    gap: spacing.xs
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "900"
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  }
});
