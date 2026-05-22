import type { IconName } from "../types";

export const onboardingSlides: Array<{
  title: string;
  subtitle: string;
  icon: IconName;
}> = [
  {
    title: "Discover your best CS career path",
    subtitle:
      "Compare in-demand software, data, AI, cloud, mobile, and security tracks based on your strengths.",
    icon: "compass-outline"
  },
  {
    title: "Get a personalized learning roadmap",
    subtitle:
      "Turn your goals into focused phases with skills, courses, projects, and realistic timelines.",
    icon: "map-outline"
  },
  {
    title: "Track skills, courses, and progress",
    subtitle:
      "Stay consistent with completion tracking, weekly study targets, streaks, and dashboard insights.",
    icon: "stats-chart-outline"
  }
];
