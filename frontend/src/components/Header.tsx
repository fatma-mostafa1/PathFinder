import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { spacing } from "../constants/layout";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function Header({ title, subtitle, showBack = false, right }: Props) {
  const navigation = useNavigation();
  const { colors } = useAuth();

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={[styles.back, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.md
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    fontSize: 26,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20
  }
});
