import type { ProgressStats } from "../types";
import { apiRequest, USE_BACKEND_API } from "./api";

export type ProgressSummaryResponse = ProgressStats & {
  weeklyStudyHours: number;
  currentStreak: number;
  recentCompletedTasks: string[];
};

export const progressService = {
  async getSummary() {
    if (!USE_BACKEND_API) {
      return null;
    }

    return apiRequest<ProgressSummaryResponse>("/progress/summary");
  }
};
