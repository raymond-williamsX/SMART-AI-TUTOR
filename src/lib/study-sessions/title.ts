const STOP_WORDS = new Set([
  "teach",
  "me",
  "help",
  "understand",
  "please",
  "explain",
  "the",
  "a",
  "an",
  "to",
  "for",
  "with",
  "about",
  "like",
  "i",
  "need",
  "show",
  "how",
  "can",
  "you",
]);

export const DEFAULT_STUDY_SESSION_TITLE = "New study session";

export function generateStudySessionTitle(prompt: string) {
  const words = prompt
    .replace(/[^\u0000-\u007F]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word.toLowerCase()));

  const chosen = words.slice(0, 4).map((word) => word[0].toUpperCase() + word.slice(1));
  return chosen.length > 0 ? chosen.join(" ") : DEFAULT_STUDY_SESSION_TITLE;
}
