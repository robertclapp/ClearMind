export const COOKIE_NAME = "clearmind_session";

export const APP_NAME = "ClearMind";
export const APP_TAGLINE = "Think clearly. Plan flexibly. Work effectively.";
export const APP_DESCRIPTION = "A neurodivergent-first productivity platform combining powerful knowledge management with visual planning and executive function support.";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * Sensory profile theme options for accessibility.
 */
export const SENSORY_PROFILES = {
  adhd: {
    name: "ADHD-Optimized",
    description: "Visual anchors, colorful design, and clear hierarchy",
  },
  highContrast: {
    name: "High Contrast",
    description: "WCAG AAA compliant for visual impairments",
  },
  dyslexia: {
    name: "Dyslexia-Friendly",
    description: "Special fonts and increased spacing",
  },
  lowStim: {
    name: "Low Stimulation",
    description: "Minimal colors and reduced motion",
  },
  standard: {
    name: "Standard",
    description: "Clean, modern design",
  },
} as const;

/**
 * Block types supported in the editor.
 */
export const BLOCK_TYPES = {
  text: "Text",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  bulletList: "Bulleted List",
  numberedList: "Numbered List",
  checkbox: "Checkbox",
  quote: "Quote",
  code: "Code",
  divider: "Divider",
  image: "Image",
  link: "Link",
  database: "Database",
} as const;

/**
 * Database view types.
 */
export const DATABASE_VIEW_TYPES = {
  table: "Table",
  kanban: "Kanban",
  calendar: "Calendar",
  gallery: "Gallery",
  list: "List",
  timeline: "Timeline",
} as const;

/**
 * Database property types.
 */
export const DATABASE_PROPERTY_TYPES = {
  text: "Text",
  number: "Number",
  select: "Select",
  multiSelect: "Multi-Select",
  date: "Date",
  checkbox: "Checkbox",
  url: "URL",
  email: "Email",
  phone: "Phone",
  file: "File",
  relation: "Relation",
  rollup: "Rollup",
  formula: "Formula",
  timeTracking: "Time Tracking",
  status: "Status",
  person: "Person",
} as const;

/**
 * Default colors for timeline events and database items.
 */
export const COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
] as const;

/**
 * Common emoji icons for pages, databases, and events.
 */
export const COMMON_ICONS = [
  "📝", "📚", "📊", "📅", "✅", "🎯", "💡", "🚀",
  "📌", "🔖", "📁", "🗂️", "📂", "🏠", "💼", "🎨",
  "🔧", "⚙️", "🎓", "💻", "📱", "🌟", "⭐", "❤️",
] as const;
