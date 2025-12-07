import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Sensory profile theme options for ClearMind.
 * Each theme is optimized for different accessibility needs.
 */
export type SensoryProfile = "adhd" | "highContrast" | "dyslexia" | "lowStim" | "standard";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
  sensoryProfile: SensoryProfile;
  setSensoryProfile: (profile: SensoryProfile) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
  defaultSensoryProfile?: SensoryProfile;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
  defaultSensoryProfile = "adhd",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [sensoryProfile, setSensoryProfile] = useState<SensoryProfile>(() => {
    if (typeof window === "undefined") return defaultSensoryProfile;
    const stored = localStorage.getItem("clearmind-sensory-profile");
    return (stored as SensoryProfile) || defaultSensoryProfile;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set sensory profile data attribute
    root.setAttribute("data-theme", sensoryProfile);

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
    localStorage.setItem("clearmind-sensory-profile", sensoryProfile);
  }, [theme, switchable, sensoryProfile]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable, sensoryProfile, setSensoryProfile }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
