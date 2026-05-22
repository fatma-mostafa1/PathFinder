import { careers, getCareerById } from "../data/careers";
import type { CareerPath } from "../types";
import { apiRequest, USE_BACKEND_API } from "./api";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const careerService = {
  async getAllCareers() {
    if (USE_BACKEND_API) {
      return apiRequest<CareerPath[]>("/careers");
    }
    await delay();
    return careers;
  },

  async getCareerDetails(careerId: string) {
    if (USE_BACKEND_API) {
      return apiRequest<CareerPath>(`/careers/${careerId}`);
    }
    await delay(300);
    return getCareerById(careerId);
  }
};
