export type StudyMessageRole = "user" | "assistant";

export type StudySessionMessage = {
  id: string;
  role: StudyMessageRole;
  content: string;
  createdAt: string;
};

export type StudySessionRecord = {
  id: string;
  title: string;
  topicCategory: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
  messages: StudySessionMessage[];
};
