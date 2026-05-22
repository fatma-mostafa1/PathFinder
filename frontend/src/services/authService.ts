import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppSettings, AuthResult, User } from "../types";
import { apiRequest, clearStoredToken, getStoredToken, setStoredToken, USE_BACKEND_API } from "./api";

const USER_KEY = "PATHFINDER_USER";
const USERS_KEY = "PATHFINDER_REGISTERED_USERS";
const ONBOARDING_KEY = "PATHFINDER_ONBOARDING_COMPLETE";
const SETTINGS_KEY = "PATHFINDER_SETTINGS";

const delay = (ms = 650) => new Promise((resolve) => setTimeout(resolve, ms));

const demoUser: User = {
  id: "demo-user",
  fullName: "PathFinder Student",
  email: "student@pathfinder.app",
  university: "Faculty of Computer Science",
  academicYear: "Third year",
  selectedCareerPath: "ai-engineer",
  careerInterest: "AI Engineer",
  studyHoursPerWeek: 10,
  createdAt: new Date().toISOString()
};

const readRegisteredUsers = async () => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [demoUser];
};

const saveRegisteredUsers = async (users: User[]) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const normalizeUser = (payload: any): User => ({
  id: String(payload.id),
  fullName: payload.fullName ?? payload.full_name,
  email: payload.email,
  university: payload.university,
  academicYear: payload.academicYear ?? payload.academic_year,
  selectedCareerPath: payload.selectedCareerPath ?? payload.selected_career_id ?? payload.selected_career_path,
  careerInterest: payload.careerInterest ?? payload.career_interest,
  studyHoursPerWeek: payload.studyHoursPerWeek ?? payload.study_hours_per_week ?? 8,
  createdAt: payload.createdAt ?? payload.created_at ?? new Date().toISOString()
});

const persistSession = async (token: string, user: User) => {
  await Promise.all([setStoredToken(token), AsyncStorage.setItem(USER_KEY, JSON.stringify(user))]);
};

export const authService = {
  async login(email: string, password: string, remember: boolean): Promise<AuthResult> {
    if (USE_BACKEND_API) {
      const result = await apiRequest<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password, remember }
      });
      const user = normalizeUser(result.user);
      if (remember) {
        await persistSession(result.token, user);
      }
      return { token: result.token, user };
    }

    await delay();
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid email or password.");
    }

    const users = await readRegisteredUsers();
    const existing = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
    const user =
      existing ||
      ({
        ...demoUser,
        id: `mock-${Date.now()}`,
        fullName: email
          .split("@")[0]
          .split(/[._-]/)
          .filter(Boolean)
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join(" ") || "CS Student",
        email: email.trim().toLowerCase()
      } satisfies User);
    const token = `mock-token-${user.id}-${Date.now()}`;

    if (remember) {
      await persistSession(token, user);
    } else {
      await Promise.all([clearStoredToken(), AsyncStorage.removeItem(USER_KEY)]);
    }

    return { token, user };
  },

  async register(payload: Omit<User, "id" | "createdAt"> & { password: string }): Promise<AuthResult> {
    if (USE_BACKEND_API) {
      const result = await apiRequest<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        auth: false,
        body: {
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
          university: payload.university,
          academicYear: payload.academicYear,
          selectedCareerPath: payload.selectedCareerPath,
          careerInterest: payload.careerInterest,
          studyHoursPerWeek: payload.studyHoursPerWeek
        }
      });
      const user = normalizeUser(result.user);
      await persistSession(result.token, user);
      return { token: result.token, user };
    }

    await delay(800);
    const users = await readRegisteredUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (emailExists) {
      throw new Error("This email is already registered.");
    }

    const user: User = {
      id: `user-${Date.now()}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      university: payload.university.trim(),
      academicYear: payload.academicYear,
      selectedCareerPath: payload.selectedCareerPath,
      careerInterest: payload.careerInterest,
      studyHoursPerWeek: payload.studyHoursPerWeek,
      createdAt: new Date().toISOString()
    };
    const token = `mock-token-${user.id}-${Date.now()}`;
    await saveRegisteredUsers([user, ...users]);
    await persistSession(token, user);
    return { token, user };
  },

  async forgotPassword(email: string) {
    await delay(500);
    if (!email.includes("@")) {
      throw new Error("Enter a valid email address.");
    }
    return true;
  },

  async logout() {
    await Promise.all([clearStoredToken(), AsyncStorage.removeItem(USER_KEY)]);
  },

  async getCurrentUser(): Promise<AuthResult | null> {
    const [token, rawUser] = await Promise.all([getStoredToken(), AsyncStorage.getItem(USER_KEY)]);
    if (!token || !rawUser) return null;

    if (USE_BACKEND_API) {
      try {
        const user = await apiRequest<any>("/users/me");
        const normalizedUser = normalizeUser(user);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
        return { token, user: normalizedUser };
      } catch {
        await this.logout();
        return null;
      }
    }

    return { token, user: JSON.parse(rawUser) as User };
  },

  async persistUser(user: User) {
    if (USE_BACKEND_API) {
      const updated = await apiRequest<any>("/users/me", {
        method: "PUT",
        body: {
          fullName: user.fullName,
          university: user.university,
          academicYear: user.academicYear,
          selectedCareerPath: user.selectedCareerPath,
          careerInterest: user.careerInterest,
          studyHoursPerWeek: user.studyHoursPerWeek
        }
      });
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(updated)));
      return;
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getOnboardingComplete() {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "true";
  },

  async setOnboardingComplete() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  },

  async getSettings(): Promise<AppSettings> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as AppSettings) : { darkMode: false, notifications: true };
  },

  async persistSettings(settings: AppSettings) {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
