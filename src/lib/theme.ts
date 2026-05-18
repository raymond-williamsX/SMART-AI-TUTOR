export const dashboardStats = [
  { label: "Active learners", value: "1,248", delta: "+18%" },
  { label: "Lessons this week", value: "84", delta: "+12%" },
  { label: "Average mastery", value: "92%", delta: "+6%" },
  { label: "Tutor modes used", value: "4", delta: "+2" },
] as const;

export const tutorModes = [
  {
    title: "Document Tutor",
    description: "Teach directly from uploaded PDFs, notes, and slides with semantic context.",
    status: "Ready for Phase 5",
  },
  {
    title: "Topic Tutor",
    description: "Ask any subject without uploads and get a structured, adaptive explanation.",
    status: "Ready for Phase 7",
  },
  {
    title: "Quiz Coach",
    description: "Turn study sessions into checks for understanding with targeted practice.",
    status: "Ready for Phase 11",
  },
] as const;
