import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { createDefaultCertifications, createDefaultInterviews, createDefaultProjects, createDefaultSkills } from "../data/platform";
import { platformService } from "../services/platformService";
import type {
  CertificationStatus,
  DashboardSummary,
  PlatformState,
  PortfolioProject,
  ReminderSettings,
  ResumeData,
  SkillLevel,
  SkillTrackerStatus,
  StudyPlan
} from "../types";
import { useAuth } from "./AuthContext";
import { useRoadmap } from "./RoadmapContext";

type PlatformContextValue = {
  state: PlatformState;
  isLoading: boolean;
  dashboard: DashboardSummary;
  updateSkill: (skillId: string, updates: { level?: SkillLevel; status?: SkillTrackerStatus }) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<PortfolioProject>) => Promise<void>;
  toggleStudyTask: (taskId: string) => Promise<void>;
  generateStudyPlan: (targetDate: string) => Promise<void>;
  updateResume: (updates: Partial<ResumeData>) => Promise<void>;
  toggleInterviewTask: (taskId: string) => Promise<void>;
  updateCertification: (certificationId: string, status: CertificationStatus) => Promise<void>;
  toggleGithubItem: (itemId: string) => Promise<void>;
  updateReminders: (updates: Partial<ReminderSettings>) => Promise<void>;
};

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { selectedCareer, stats, phases } = useRoadmap();
  const careerId = selectedCareer?.id || user?.selectedCareerPath || "software-engineer";
  const weeklyHours = user?.studyHoursPerWeek || 8;
  const [state, setState] = useState<PlatformState>({
    skills: [],
    projects: [],
    studyPlan: { weeklyHours, targetDate: "", tasks: [] },
    resume: { education: "", skills: "", projects: "", certifications: "", experience: "" },
    interviewTasks: [],
    certifications: [],
    githubChecklist: [],
    reminders: {
      weeklyGoalReminders: true,
      roadmapDeadlineReminders: true,
      studyStreakReminders: true,
      preferredDay: "Saturday",
      preferredTime: "7:00 PM"
    },
    updatedAt: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const activeState = useMemo(() => filterPlatformState(state, careerId), [careerId, state]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const loaded = await platformService.getPlatformState(careerId, weeklyHours);
        setState({
          ...loaded,
          skills: ensureCareerItems(loaded.skills, careerId, () => createDefaultSkills(careerId)),
          projects: ensureCareerItems(loaded.projects, careerId, () => createDefaultProjects(careerId)),
          interviewTasks: ensureCareerItems(loaded.interviewTasks, careerId, () => createDefaultInterviews(careerId)),
          certifications: ensureCareerItems(loaded.certifications, careerId, () => createDefaultCertifications(careerId))
        });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [careerId, weeklyHours]);

  const saveState = useCallback(async (nextState: PlatformState) => {
    const stamped = { ...nextState, updatedAt: new Date().toISOString() };
    setState(stamped);
    await platformService.savePlatformState(stamped);
  }, []);

  const updateSkill = useCallback(
    async (skillId: string, updates: { level?: SkillLevel; status?: SkillTrackerStatus }) => {
      const next = state.skills.map((skill) =>
        skill.id === skillId
          ? {
              ...skill,
              ...updates,
              progress: updates.status ? statusToProgress(updates.status) : skill.progress
            }
          : skill
      );
      await saveState({ ...state, skills: next });
    },
    [saveState, state]
  );

  const updateProject = useCallback(
    async (projectId: string, updates: Partial<PortfolioProject>) => {
      const next = state.projects.map((project) => (project.id === projectId ? { ...project, ...updates } : project));
      await saveState({ ...state, projects: next });
    },
    [saveState, state]
  );

  const toggleStudyTask = useCallback(
    async (taskId: string) => {
      const studyPlan: StudyPlan = {
        ...state.studyPlan,
        tasks: state.studyPlan.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
      };
      await saveState({ ...state, studyPlan });
    },
    [saveState, state]
  );

  const generateStudyPlan = useCallback(
    async (targetDate: string) => {
      const studyPlan = await platformService.generateStudyPlan(careerId, weeklyHours, targetDate);
      await saveState({ ...state, studyPlan });
    },
    [careerId, saveState, state, weeklyHours]
  );

  const updateResume = useCallback(
    async (updates: Partial<ResumeData>) => {
      await saveState({ ...state, resume: { ...state.resume, ...updates } });
    },
    [saveState, state]
  );

  const toggleInterviewTask = useCallback(
    async (taskId: string) => {
      const interviewTasks = state.interviewTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task));
      await saveState({ ...state, interviewTasks });
    },
    [saveState, state]
  );

  const updateCertification = useCallback(
    async (certificationId: string, status: CertificationStatus) => {
      const certifications = state.certifications.map((certification) =>
        certification.id === certificationId ? { ...certification, status } : certification
      );
      await saveState({ ...state, certifications });
    },
    [saveState, state]
  );

  const toggleGithubItem = useCallback(
    async (itemId: string) => {
      const githubChecklist = state.githubChecklist.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item));
      await saveState({ ...state, githubChecklist });
    },
    [saveState, state]
  );

  const updateReminders = useCallback(
    async (updates: Partial<ReminderSettings>) => {
      await saveState({ ...state, reminders: { ...state.reminders, ...updates } });
    },
    [saveState, state]
  );

  const dashboard = useMemo(
    () => buildDashboardSummary(activeState, stats, phases.map((phase) => phase.title), weeklyHours),
    [activeState, phases, stats, weeklyHours]
  );

  const value = useMemo<PlatformContextValue>(
    () => ({
      state: activeState,
      isLoading,
      dashboard,
      updateSkill,
      updateProject,
      toggleStudyTask,
      generateStudyPlan,
      updateResume,
      toggleInterviewTask,
      updateCertification,
      toggleGithubItem,
      updateReminders
    }),
    [
      activeState,
      isLoading,
      dashboard,
      updateSkill,
      updateProject,
      toggleStudyTask,
      generateStudyPlan,
      updateResume,
      toggleInterviewTask,
      updateCertification,
      toggleGithubItem,
      updateReminders
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

function ensureCareerItems<T extends { careerId?: string; careerIds?: string[] }>(items: T[], careerId: string, factory: () => T[]) {
  const matching = items.filter((item) => item.careerId === careerId || item.careerIds?.includes(careerId));
  return matching.length ? items : [...items, ...factory()];
}

function filterPlatformState(state: PlatformState, careerId: string): PlatformState {
  return {
    ...state,
    skills: state.skills.filter((item) => item.careerId === careerId),
    projects: state.projects.filter((item) => item.careerId === careerId),
    interviewTasks: state.interviewTasks.filter((item) => item.careerIds.includes(careerId)),
    certifications: state.certifications.filter((item) => item.careerIds.includes(careerId))
  };
}

function statusToProgress(status: SkillTrackerStatus) {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 55;
  return 0;
}

function percentage(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function buildDashboardSummary(state: PlatformState, stats: { overallProgress: number; completedSkills: number; totalSkills: number }, phaseTitles: string[], weeklyHours: number): DashboardSummary {
  const completedProjects = state.projects.filter((project) => project.completed).length;
  const completedStudyTasks = state.studyPlan.tasks.filter((task) => task.done).length;
  const completedInterviews = state.interviewTasks.filter((task) => task.completed).length;
  const completedCertifications = state.certifications.filter((certification) => certification.status === "Completed").length;
  const githubDone = state.githubChecklist.filter((item) => item.completed).length;
  const trackedSkillDone = state.skills.filter((skill) => skill.status === "Completed").length;
  const skillProgress = percentage(trackedSkillDone, state.skills.length);
  const portfolioReadiness = percentage(completedProjects, state.projects.length);
  const interviewReadiness = percentage(completedInterviews, state.interviewTasks.length);
  const certificationProgress = percentage(completedCertifications, state.certifications.length);
  const githubReadiness = percentage(githubDone, state.githubChecklist.length);
  const careerReadinessScore = Math.round(
    stats.overallProgress * 0.3 +
      skillProgress * 0.2 +
      portfolioReadiness * 0.2 +
      interviewReadiness * 0.15 +
      githubReadiness * 0.1 +
      certificationProgress * 0.05
  );

  const nextRecommendedTask =
    state.studyPlan.tasks.find((task) => !task.done)?.title ||
    state.skills.find((skill) => skill.status !== "Completed")?.title ||
    state.projects.find((project) => !project.completed)?.title ||
    "Review your resume and prepare a portfolio walkthrough.";

  return {
    careerReadinessScore,
    portfolioReadiness,
    completedProjects,
    totalProjects: state.projects.length,
    completedSkills: Math.max(stats.completedSkills, trackedSkillDone),
    totalSkills: Math.max(stats.totalSkills, state.skills.length),
    completedStudyTasks,
    totalStudyTasks: state.studyPlan.tasks.length,
    interviewReadiness,
    certificationProgress,
    githubReadiness,
    nextRecommendedTask,
    recentActivity: [
      `${stats.overallProgress}% roadmap progress across ${phaseTitles.length} phases`,
      `${completedProjects}/${state.projects.length} portfolio projects completed`,
      `${completedStudyTasks}/${state.studyPlan.tasks.length} weekly study tasks done`,
      `${weeklyHours}h weekly study target configured`
    ],
    strongestAreas: [
      portfolioReadiness >= 60 ? "Portfolio execution" : "Roadmap consistency",
      githubReadiness >= 60 ? "GitHub profile quality" : "Learning discipline"
    ],
    weakestAreas: [
      portfolioReadiness < 50 ? "Complete more portfolio projects" : "Add stronger project documentation",
      interviewReadiness < 50 ? "Increase interview practice" : "Add certifications or deployment evidence"
    ]
  };
}

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformProvider.");
  }
  return context;
};
