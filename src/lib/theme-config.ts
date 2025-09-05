// Theme configuration for the Bike Violation Management System
// This file defines theme variables and utilities for consistent theming

export const themeConfig = {
  // Color schemes for different components
  colors: {
    primary: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.922 0 0)",
    },
    secondary: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    accent: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    muted: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    background: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.145 0 0)",
    },
    foreground: {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    card: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    cardForeground: {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    popover: {
      light: "oklch(1 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    popoverForeground: {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    border: {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 10%)",
    },
    input: {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 15%)",
    },
    ring: {
      light: "oklch(0.708 0 0)",
      dark: "oklch(0.556 0 0)",
    },
    destructive: {
      light: "oklch(0.577 0.245 27.325)",
      dark: "oklch(0.704 0.191 22.216)",
    },
    // Status colors
    success: {
      light: "oklch(0.646 0.222 41.116)",
      dark: "oklch(0.488 0.243 264.376)",
    },
    warning: {
      light: "oklch(0.828 0.189 84.429)",
      dark: "oklch(0.696 0.17 162.48)",
    },
    info: {
      light: "oklch(0.6 0.118 184.704)",
      dark: "oklch(0.769 0.188 70.08)",
    },
    error: {
      light: "oklch(0.577 0.245 27.325)",
      dark: "oklch(0.704 0.191 22.216)",
    },
  },

  // Sidebar specific colors
  sidebar: {
    background: {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.205 0 0)",
    },
    foreground: {
      light: "oklch(0.145 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    primary: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.488 0.243 264.376)",
    },
    primaryForeground: {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    accent: {
      light: "oklch(0.97 0 0)",
      dark: "oklch(0.269 0 0)",
    },
    accentForeground: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.985 0 0)",
    },
    border: {
      light: "oklch(0.922 0 0)",
      dark: "oklch(1 0 0 / 10%)",
    },
    ring: {
      light: "oklch(0.708 0 0)",
      dark: "oklch(0.556 0 0)",
    },
  },

  // Chart colors for data visualization
  chart: {
    colors: {
      light: [
        "oklch(0.646 0.222 41.116)",
        "oklch(0.6 0.118 184.704)",
        "oklch(0.398 0.07 227.392)",
        "oklch(0.828 0.189 84.429)",
        "oklch(0.769 0.188 70.08)",
      ],
      dark: [
        "oklch(0.488 0.243 264.376)",
        "oklch(0.696 0.17 162.48)",
        "oklch(0.769 0.188 70.08)",
        "oklch(0.627 0.265 303.9)",
        "oklch(0.645 0.246 16.439)",
      ],
    },
  },

  // Border radius values
  borderRadius: {
    none: "0",
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    full: "9999px",
  },

  // Spacing values
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
  },

  // Font weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Transitions
  transitions: {
    fast: "150ms ease-in-out",
    normal: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },

  // Z-index values
  zIndex: {
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modalBackdrop: "1040",
    modal: "1050",
    popover: "1060",
    tooltip: "1070",
  },
};

// Utility function to get theme-aware color
export function getThemeColor(colorKey: string, theme: "light" | "dark" = "light"): string | undefined {
  const keys = colorKey.split(".");
  // Start from the root so callers can pass paths like "colors.primary" or "sidebar.background.light"
  let current: unknown = themeConfig;

  for (const k of keys) {
    if (current && typeof current === "object" && k in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  // If the resolved value is an object with light/dark properties, prefer those
  if (current && typeof current === "object") {
    const asRecord = current as Record<string, unknown>;
    if (typeof asRecord[theme] === "string") return asRecord[theme] as string;
    // sometimes callers may pass the full color object directly (e.g. chart.color arrays)
    // fallthrough to stringify arrays or reject non-string values
    if (Array.isArray(current) && typeof current[0] === "string") return current[0] as string;
    return undefined;
  }

  if (typeof current === "string") return current;

  return undefined;
}

// Utility function to get CSS custom property
export function getCSSVariable(varName: string) {
  return `var(--${varName})`;
}

// Theme-aware class utilities
export const themeClasses = {
  // Background classes
  bg: {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    muted: "bg-muted",
    background: "bg-background",
    card: "bg-card",
    popover: "bg-popover",
  },
  
  // Text classes
  text: {
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    accent: "text-accent-foreground",
    muted: "text-muted-foreground",
    foreground: "text-foreground",
    card: "text-card-foreground",
    popover: "text-popover-foreground",
  },
  
  // Border classes
  border: {
    default: "border-border",
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    muted: "border-muted",
  },
  
  // Status classes
  status: {
    success: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50",
    warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/50",
    error: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50",
    info: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50",
  },
};

export default themeConfig;
