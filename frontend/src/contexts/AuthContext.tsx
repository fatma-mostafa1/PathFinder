import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authService } from "../services/authService";
import { darkColors, lightColors } from "../constants/colors";
import type { AcademicYear, AppSettings, AuthResult, User } from "../types";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  university: string;
  academicYear: AcademicYear;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  settings: AppSettings;
  colors: typeof lightColors;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResult | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ darkMode: false, notifications: true });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [currentSession, onboardingComplete, savedSettings] = await Promise.all([
          authService.getCurrentUser(),
          authService.getOnboardingComplete(),
          authService.getSettings()
        ]);
        setSession(currentSession);
        setHasSeenOnboarding(onboardingComplete);
        setSettings(savedSettings);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const result = await authService.login(email, password, remember);
    setSession(result);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register({
      ...payload,
      selectedCareerPath: "software-engineer",
      careerInterest: "Software Engineer",
      studyHoursPerWeek: 8
    });
    setSession(result);
    await authService.setOnboardingComplete();
    setHasSeenOnboarding(true);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await authService.setOnboardingComplete();
    setHasSeenOnboarding(true);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!session?.user) return;
      const nextUser = { ...session.user, ...updates };
      const nextSession = { ...session, user: nextUser };
      setSession(nextSession);
      if (session.token) {
        await authService.persistUser(nextUser);
      }
    },
    [session]
  );

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...updates };
      void authService.persistSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      settings,
      colors: settings.darkMode ? darkColors : lightColors,
      isLoading,
      hasSeenOnboarding,
      login,
      register,
      forgotPassword,
      logout,
      completeOnboarding,
      updateProfile,
      updateSettings
    }),
    [
      session,
      settings,
      isLoading,
      hasSeenOnboarding,
      login,
      register,
      forgotPassword,
      logout,
      completeOnboarding,
      updateProfile,
      updateSettings
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
};
