import type { RoadmapPhase } from "../types";

export const calculatePhaseProgress = (phase: RoadmapPhase) => {
  if (phase.skills.length === 0) return 0;
  const completed = phase.skills.filter((skill) => skill.completed).length;
  return Math.round((completed / phase.skills.length) * 100);
};

export const calculateRoadmapProgress = (phases: RoadmapPhase[]) => {
  const totalSkills = phases.reduce((sum, phase) => sum + phase.skills.length, 0);
  if (totalSkills === 0) return 0;
  const completedSkills = phases.reduce(
    (sum, phase) => sum + phase.skills.filter((skill) => skill.completed).length,
    0
  );
  return Math.round((completedSkills / totalSkills) * 100);
};

export const normalizeRoadmapProgress = (phases: RoadmapPhase[]) =>
  phases.map((phase) => ({
    ...phase,
    progress: calculatePhaseProgress(phase)
  }));
