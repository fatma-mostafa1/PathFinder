import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { careers, getCareerById } from "../data/careers";
import { roadmapService } from "../services/roadmapService";
import type { CareerAssessmentResult, CareerPath, ProgressStats, QuizAnswers, RoadmapPhase, RoadmapState } from "../types";
import { calculateRoadmapProgress, normalizeRoadmapProgress } from "../utils/progress";
import { useAuth } from "./AuthContext";

const ROADMAP_KEY = "PATHFINDER_ROADMAP_STATE";

type RoadmapContextValue = {
  selectedCareer: CareerPath | null;
  phases: RoadmapPhase[];
  lastAssessment: CareerAssessmentResult | null;
  isLoading: boolean;
  stats: ProgressStats;
  recentCompletedTasks: string[];
  setCareerPath: (careerId: string) => Promise<void>;
  saveAssessment: (assessment: CareerAssessmentResult) => Promise<void>;
  generateRoadmapFromQuiz: (answers: QuizAnswers) => Promise<CareerPath>;
  updateSkillProgress: (phaseId: string, skillId: string, completed: boolean) => Promise<void>;
  togglePhaseSkill: (phaseId: string, skillId: string) => Promise<void>;
  markPhaseComplete: (phaseId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  getPhaseById: (phaseId: string) => RoadmapPhase | undefined;
};

const RoadmapContext = createContext<RoadmapContextValue | undefined>(undefined);

export function RoadmapProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [state, setState] = useState<RoadmapState>({
    selectedCareerId: null,
    phases: [],
    lastAssessment: null,
    updatedAt: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistState = useCallback(async (nextState: RoadmapState) => {
    await AsyncStorage.setItem(ROADMAP_KEY, JSON.stringify(nextState));
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const raw = await AsyncStorage.getItem(ROADMAP_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as RoadmapState;
          setState({ ...parsed, phases: normalizeRoadmapProgress(parsed.phases) });
          return;
        }

        const careerId = user?.selectedCareerPath || "ai-engineer";
        const { phases } = await roadmapService.getMyRoadmap(careerId);
        const nextState = {
          selectedCareerId: careerId,
          phases,
          lastAssessment: null,
          updatedAt: new Date().toISOString()
        };
        setState(nextState);
        await persistState(nextState);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [persistState, user?.selectedCareerPath]);

  const selectedCareer = state.selectedCareerId ? getCareerById(state.selectedCareerId) : careers[0];

  const saveRoadmapState = useCallback(
    async (nextState: RoadmapState) => {
      setState(nextState);
      await persistState(nextState);
    },
    [persistState]
  );

  const setCareerPath = useCallback(
    async (careerId: string) => {
      setIsLoading(true);
      try {
        const { career, phases } = await roadmapService.getRoadmapByCareer(careerId);
        const nextState: RoadmapState = {
          selectedCareerId: career.id,
          phases,
          lastAssessment: state.lastAssessment ?? null,
          updatedAt: new Date().toISOString()
        };
        await saveRoadmapState(nextState);
        await updateProfile({ selectedCareerPath: career.id, careerInterest: career.title });
      } finally {
        setIsLoading(false);
      }
    },
    [saveRoadmapState, state.lastAssessment, updateProfile]
  );

  const saveAssessment = useCallback(
    async (assessment: CareerAssessmentResult) => {
      await saveRoadmapState({
        ...state,
        selectedCareerId: assessment.bestCareer.id,
        lastAssessment: assessment,
        updatedAt: new Date().toISOString()
      });
      await updateProfile({ selectedCareerPath: assessment.bestCareer.id, careerInterest: assessment.bestCareer.title });
    },
    [saveRoadmapState, state, updateProfile]
  );

  const generateRoadmapFromQuiz = useCallback(
    async (answers: QuizAnswers) => {
      setIsLoading(true);
      try {
        const { career, phases } = await roadmapService.generateRoadmap(answers);
        const nextState: RoadmapState = {
          selectedCareerId: career.id,
          phases,
          lastAssessment: state.lastAssessment ?? null,
          updatedAt: new Date().toISOString()
        };
        await saveRoadmapState(nextState);
        await updateProfile({
          selectedCareerPath: career.id,
          careerInterest: career.title,
          studyHoursPerWeek: answers.studyHoursPerWeek
        });
        return career;
      } finally {
        setIsLoading(false);
      }
    },
    [saveRoadmapState, state.lastAssessment, updateProfile]
  );

  const updateSkillProgress = useCallback(
    async (phaseId: string, skillId: string, completed: boolean) => {
      const phases = await roadmapService.updateSkillProgress(state.phases, phaseId, skillId, completed);
      await saveRoadmapState({
        ...state,
        phases,
        updatedAt: new Date().toISOString()
      });
    },
    [saveRoadmapState, state]
  );

  const togglePhaseSkill = useCallback(
    async (phaseId: string, skillId: string) => {
      const phase = state.phases.find((item) => item.id === phaseId);
      const currentSkill = phase?.skills.find((item) => item.id === skillId);
      if (!currentSkill) return;
      await updateSkillProgress(phaseId, skillId, !currentSkill.completed);
    },
    [state.phases, updateSkillProgress]
  );

  const markPhaseComplete = useCallback(
    async (phaseId: string) => {
      const phases = normalizeRoadmapProgress(
        state.phases.map((phase) =>
          phase.id === phaseId
            ? { ...phase, skills: phase.skills.map((skill) => ({ ...skill, completed: true })) }
            : phase
        )
      );
      await saveRoadmapState({
        ...state,
        phases,
        updatedAt: new Date().toISOString()
      });
    },
    [saveRoadmapState, state]
  );

  const resetProgress = useCallback(async () => {
    const careerId = state.selectedCareerId || user?.selectedCareerPath || "ai-engineer";
    const { phases } = await roadmapService.getRoadmapByCareer(careerId);
    await saveRoadmapState({
      selectedCareerId: careerId,
      phases,
      lastAssessment: state.lastAssessment ?? null,
      updatedAt: new Date().toISOString()
    });
  }, [saveRoadmapState, state.lastAssessment, state.selectedCareerId, user?.selectedCareerPath]);

  const getPhaseById = useCallback((phaseId: string) => state.phases.find((phase) => phase.id === phaseId), [state.phases]);

  const stats = useMemo<ProgressStats>(() => {
    const totalSkills = state.phases.reduce((sum, phase) => sum + phase.skills.length, 0);
    const completedSkills = state.phases.reduce(
      (sum, phase) => sum + phase.skills.filter((skill) => skill.completed).length,
      0
    );

    return {
      overallProgress: calculateRoadmapProgress(state.phases),
      completedSkills,
      totalSkills,
      remainingSkills: Math.max(totalSkills - completedSkills, 0),
      completedPhases: state.phases.filter((phase) => phase.progress === 100).length
    };
  }, [state.phases]);

  const recentCompletedTasks = useMemo(
    () =>
      state.phases
        .flatMap((phase) => phase.skills.filter((skill) => skill.completed).map((skill) => `${skill.title} - ${phase.title}`))
        .slice(-5)
        .reverse(),
    [state.phases]
  );

  const value = useMemo<RoadmapContextValue>(
    () => ({
      selectedCareer,
      phases: state.phases,
      lastAssessment: state.lastAssessment ?? null,
      isLoading,
      stats,
      recentCompletedTasks,
      setCareerPath,
      saveAssessment,
      generateRoadmapFromQuiz,
      updateSkillProgress,
      togglePhaseSkill,
      markPhaseComplete,
      resetProgress,
      getPhaseById
    }),
    [
      selectedCareer,
      state.phases,
      isLoading,
      stats,
      recentCompletedTasks,
      setCareerPath,
      saveAssessment,
      generateRoadmapFromQuiz,
      updateSkillProgress,
      togglePhaseSkill,
      markPhaseComplete,
      resetProgress,
      getPhaseById
    ]
  );

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error("useRoadmap must be used inside RoadmapProvider.");
  }
  return context;
};
