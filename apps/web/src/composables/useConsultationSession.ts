import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  createNewSession as createNewSessionApi,
  deleteSessionMessage as deleteSessionMessageApi,
  getSessionEmotion as getSessionEmotionApi,
  getSessionList as getSessionListApi,
  getSessionMessage as getSessionMessageApi,
} from "@/api";
import type {
  ConsultationEmotion,
  ConsultationMessage,
  ConsultationSessionListItem,
  NewSession,
  Session,
} from "@/types/consultation.types";
import { useStreamingAiResponse } from "./useStreamingAiResponse";

const createDefaultEmotion = (): ConsultationEmotion => ({
  primaryEmotion: "中性",
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: "情绪稳定，继续保持哦！",
  improvementSuggestions: [],
  riskDescription: "",
});

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export function useConsultationSession() {
  const userInput = ref("");
  const currentSession = ref<Session | null>(null);
  const sessionList = ref<ConsultationSessionListItem[]>([]);
  const messages = ref<ConsultationMessage[]>([]);
  const currentEmotion = ref<ConsultationEmotion>(createDefaultEmotion());

  const getSessionList = async () => {
    try {
      const res = await getSessionListApi({ pageNum: "1", pageSize: "10" });
      sessionList.value = res.records ?? [];
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, "获取会话列表失败"));
    }
  };

  const getSessionEmotion = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      const formattedId = sessionId.startsWith("session_")
        ? sessionId
        : `session_${sessionId}`;
      currentEmotion.value = await getSessionEmotionApi({
        sessionId: formattedId,
      });
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, "获取情绪分析失败"));
    }
  };

  const { appendUserMessage, handleAIResponse, isSending } =
    useStreamingAiResponse({
      messages,
      onDone: () => {
        void getSessionList();
        void getSessionEmotion(currentSession.value?.sessionId || "");
      },
      onClose: () => {
        void getSessionEmotion(currentSession.value?.sessionId || "");
      },
    });

  const createNewSession = () => {
    const draftSession = {
      sessionId: "temp_" + Date.now(),
      status: "TEMP",
      sessionTitle: "新会话",
    } satisfies Session;

    currentSession.value = draftSession;
    messages.value = [];
    userInput.value = "";
    isSending.value = false;
  };

  const handleEnterSession = async (session: ConsultationSessionListItem) => {
    if (session.id === null || session.id === undefined) {
      ElMessage.error("会话ID不存在");
      return;
    }

    const sessionId = String(session.id);

    try {
      const messageDetail = await getSessionMessageApi({ sessionId });
      await getSessionEmotion(sessionId);
      messages.value = messageDetail;
      currentSession.value = {
        sessionId: "session_" + sessionId,
        status: "ACTIVE",
        sessionTitle: session.sessionTitle,
      };
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, "系统错误"));
    }
  };

  const handleDeleteSession = async (sessionId: string | number) => {
    try {
      await deleteSessionMessageApi({ sessionId: String(sessionId) });
      void getSessionList();
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, "删除会话失败"));
    }
  };

  const startSession = async (userMessage: string) => {
    const sessionParams: NewSession = {
      initialMessage: userMessage,
      sessionTitle:
        currentSession.value?.sessionTitle === "新会话"
          ? `宁渡AI助手 - ${new Date().toLocaleString()}`
          : currentSession.value?.sessionTitle || "",
    };

    try {
      const res = await createNewSessionApi(sessionParams);
      const sessionData = {
        sessionId: res.sessionId,
        status: res.status,
        sessionTitle: sessionParams.sessionTitle,
      } satisfies Session;

      if (currentSession.value?.status === "TEMP") {
        Object.assign(currentSession.value, sessionData);
      } else {
        currentSession.value = sessionData;
      }

      void getSessionList();
      appendUserMessage(userMessage);
      handleAIResponse(currentSession.value.sessionId, userMessage);
    } catch (error: unknown) {
      ElMessage.error(getErrorMessage(error, "创建会话失败"));
    }
  };

  const sendMessage = () => {
    if (!userInput.value.trim()) return;
    if (isSending.value) {
      ElMessage.error("请稍后再发送");
      return;
    }

    const userMessage = userInput.value.trim();
    userInput.value = "";

    if (
      currentSession.value?.status === "TEMP" ||
      !currentSession.value?.sessionId
    ) {
      void startSession(userMessage);
      return;
    }

    appendUserMessage(userMessage);
    handleAIResponse(currentSession.value.sessionId, userMessage);
  };

  onMounted(() => {
    void getSessionList();
    createNewSession();
  });

  return {
    createNewSession,
    currentEmotion,
    currentSession,
    getSessionList,
    handleDeleteSession,
    handleEnterSession,
    isSending,
    messages,
    sendMessage,
    sessionList,
    userInput,
  };
}
