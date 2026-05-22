import React, { useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../../components/CustomButton";
import { onboardingSlides } from "../../data/onboarding";
import { useAuth } from "../../contexts/AuthContext";
import { radius, spacing } from "../../constants/layout";

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { colors, completeOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const lastSlide = index === onboardingSlides.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  };

  const goNext = () => {
    if (lastSlide) {
      void completeOnboarding();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.brand, { color: colors.primary }]}>PathFinder</Text>
        <CustomButton title="Skip" onPress={() => void completeOnboarding()} variant="ghost" />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {onboardingSlides.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.visualCard, { borderColor: colors.border }]}
            >
              <View style={styles.visualGrid}>
                <View style={styles.visualStrip} />
                <View style={[styles.visualStrip, styles.visualStripShort]} />
                <View style={[styles.visualStrip, styles.visualStripTiny]} />
              </View>
              <View style={styles.iconRing}>
                <Ionicons name={slide.icon} size={62} color={colors.primary} />
              </View>
              <View style={styles.pathLine}>
                <View style={styles.node} />
                <View style={styles.line} />
                <View style={styles.node} />
                <View style={styles.line} />
                <View style={styles.node} />
              </View>
              <View style={styles.metricPreview}>
                <View style={styles.metricPreviewItem}>
                  <Text style={styles.metricPreviewValue}>7</Text>
                  <Text style={styles.metricPreviewLabel}>phases</Text>
                </View>
                <View style={styles.metricPreviewItem}>
                  <Text style={styles.metricPreviewValue}>42</Text>
                  <Text style={styles.metricPreviewLabel}>skills</Text>
                </View>
              </View>
            </LinearGradient>
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedText }]}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {onboardingSlides.map((slide, dotIndex) => (
            <View
              key={slide.title}
              style={[
                styles.dot,
                {
                  width: dotIndex === index ? 26 : 9,
                  backgroundColor: dotIndex === index ? colors.primary : colors.border
                }
              ]}
            />
          ))}
        </View>
        <CustomButton title={lastSlide ? "Get Started" : "Next"} onPress={goNext} icon="arrow-forward-outline" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    fontSize: 24,
    fontWeight: "900"
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xl
  },
  visualCard: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 1.08,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    overflow: "hidden"
  },
  visualGrid: {
    position: "absolute",
    top: 24,
    left: 24,
    right: 24,
    gap: spacing.md
  },
  visualStrip: {
    height: 12,
    width: "82%",
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.22)"
  },
  visualStripShort: {
    width: "58%"
  },
  visualStripTiny: {
    width: "36%"
  },
  iconRing: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8
  },
  pathLine: {
    width: "72%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm
  },
  node: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: "#FFFFFF"
  },
  line: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.42)"
  },
  metricPreview: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: spacing.md
  },
  metricPreviewItem: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  metricPreviewValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900"
  },
  metricPreviewLabel: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 34
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 340
  },
  footer: {
    padding: spacing.xl,
    gap: spacing.lg
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm
  },
  dot: {
    height: 9,
    borderRadius: radius.pill
  }
});
