import { ref, type Ref } from "vue";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ElMessage } from "element-plus";
import type { ConsultationMessage } from "@/types/consultation.types";

type StreamPayload = {
  code: string | number;
  data?: {
    content?: string;
  };
  message?: string;
};

type UseStreamingAiResponseOptions = {
  messages: Ref<ConsultationMessage[]>;
  onDone?: () => void;
  onClose?: () => void;
};

const padDatePart = (value: number) => String(value).padStart(2, "0");

const formatLocalDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());
  const seconds = padDatePart(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const createUserMessage = (content: string): ConsultationMessage => ({
  id: Date.now(),
  senderType: 1,
  content,
  createdAt: formatLocalDateTime(new Date()),
});

const createAiMessage = (): ConsultationMessage => ({
  id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  senderType: 2,
  content: "",
  createdAt: formatLocalDateTime(new Date()),
});

const parseStreamPayload = (raw: string): StreamPayload | null => {
  try {
    return JSON.parse(raw) as StreamPayload;
  } catch {
    return null;
  }
};

export function useStreamingAiResponse({
  messages,
  onDone,
  onClose,
}: UseStreamingAiResponseOptions) {
  const isSending = ref(false);

  const appendUserMessage = (userMessage: string) => {
    messages.value.push(createUserMessage(userMessage));
  };

  const handleErrorAIResponse = (errorMessage: string) => {
    const lastAiMessage = messages.value[messages.value.length - 1];
    if (lastAiMessage?.senderType === 2) {
      lastAiMessage.content = "AI回复错误。";
    }

    isSending.value = false;
    ElMessage.error(errorMessage);
  };

  const handleAIResponse = (sessionId: string, userMessage: string) => {
    if (isSending.value) {
      ElMessage.warning("正在发送消息，请稍后");
      return;
    }

    isSending.value = true;
    messages.value.push(createAiMessage());
    const streamingMessage = messages.value[messages.value.length - 1];

    let contentBuffer = "";
    let flushTimer: ReturnType<typeof window.setTimeout> | null = null;

    const clearFlushTimer = () => {
      if (flushTimer === null) return;

      window.clearTimeout(flushTimer);
      flushTimer = null;
    };

    const flushContentBuffer = () => {
      if (!contentBuffer) {
        clearFlushTimer();
        return;
      }

      streamingMessage!.content += contentBuffer;
      contentBuffer = "";
      clearFlushTimer();
    };

    const scheduleFlushContentBuffer = () => {
      if (flushTimer !== null) return;

      flushTimer = window.setTimeout(() => {
        flushTimer = null;
        flushContentBuffer();
      }, 30);
    };

    const controller = new AbortController();

    void fetchEventSource("/api/psychological-chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") ?? "",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        sessionId,
        userMessage,
      }),
      signal: controller.signal,

      onopen: async (response) => {
        const contentType = response.headers.get("Content-Type") ?? "";
        if (!contentType.includes("text/event-stream")) {
          const errorData = (await response.json()) as { message?: string };
          ElMessage.error(errorData.message || "返回数据非流式");
          controller.abort();
        }
      },

      onmessage: (streamEvent) => {
        const raw = streamEvent.data.trim();
        if (!raw) return;

        if (streamEvent.event === "done") {
          flushContentBuffer();
          isSending.value = false;
          controller.abort();
          onDone?.();
          return;
        }

        const payload = parseStreamPayload(raw);
        if (!payload) {
          flushContentBuffer();
          handleErrorAIResponse("AI回复数据格式错误");
          return;
        }

        const code = String(payload.code);
        if (code === "200" && payload.data?.content) {
          contentBuffer += payload.data.content;
          scheduleFlushContentBuffer();
        } else if (code !== "200") {
          flushContentBuffer();
          handleErrorAIResponse(payload.message || "AI回复错误");
        }
      },

      onerror: (error) => {
        flushContentBuffer();
        handleErrorAIResponse(
          error instanceof Error ? error.message : "AI回复错误，请稍后再试",
        );
        throw error;
      },

      onclose: () => {
        flushContentBuffer();
        isSending.value = false;
        onClose?.();
      },
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;

      flushContentBuffer();
      handleErrorAIResponse(
        error instanceof Error ? error.message : "AI回复错误，请稍后再试",
      );
    });
  };

  return {
    appendUserMessage,
    handleAIResponse,
    isSending,
  };
}
