export type SessionStatus = "TEMP" | "ACTIVE";

export type Session = {
  sessionId: string;
  status: SessionStatus;
  sessionTitle: string;
};

export type Message = {
  initialMessage: string;
  sessionTitle: string;
};

export type CreateNewSessionResponse = {
  sessionId: string;
  status: SessionStatus;
  expiryTime: number;
  initialMessage: string;
  messageCount: number;
  startTime: number;
  userHash: number;
};

export type SessionList = { pageNum: string; pageSize: string };

export type NewSession = { initialMessage: string; sessionTitle: string };

export type SenderType = 1 | 2;

export type ConsultationMessage = {
  id: string | number;
  senderType: SenderType;
  content: string;
  createdAt: string;
  isError?: boolean;
};

export type ConsultationSessionListItem = {
  id: string | number;
  sessionTitle: string;
  startedAt?: string;
  lastMessageContent?: string;
  messageCount?: number;
  durationMinutes?: number;
  lastMessageTime?: string;
};

export type ConsultationSessionListResponse = {
  records: ConsultationSessionListItem[];
};

export type ConsultationEmotion = {
  primaryEmotion: string;
  emotionScore: number;
  isNegative: boolean;
  riskLevel: number;
  suggestion: string;
  improvementSuggestions: string[];
  riskDescription: string;
};
