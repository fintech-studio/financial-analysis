export const SPACING = {
  section: {
    py: "py-12",
    px: "px-4 sm:px-6 lg:px-8",
  },
  container: "max-w-7xl mx-auto",
  gap: {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export const TRANSITIONS = {
  default: "transition-all duration-200 ease-in-out",
  hover: "hover:shadow-lg hover:-translate-y-1",
} as const;
