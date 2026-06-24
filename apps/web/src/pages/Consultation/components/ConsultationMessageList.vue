<script setup lang="ts">
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";
import type { ConsultationMessage } from "@/types/consultation.types";
import robotUrl from "@health-chat/assets/images/robot-fill.png";
import userUrl from "@health-chat/assets/images/users.png";

type Props = {
  messages: ConsultationMessage[];
  isSending: boolean;
};

defineProps<Props>();

const formatMessageContent = (content: string) => {
  return content.replace(/\n/g, "<br>");
};
</script>

<template>
  <div class="chat-messages">
    <div v-if="messages.length === 0" class="message-item ai-message">
      <div class="message-avatar">
        <el-image :src="robotUrl" style="width: 20px; height: 20px" />
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <p>你好，我是小心，你的心理助手。</p>
        </div>
      </div>
    </div>
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item"
      :class="message.senderType === 1 ? 'user-message' : 'ai-message'"
    >
      <div class="message-avatar">
        <el-image
          v-if="message.senderType === 1"
          :src="userUrl"
          style="width: 20px; height: 20px"
        />
        <el-image
          v-if="message.senderType === 2"
          :src="robotUrl"
          style="width: 20px; height: 20px"
        />
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div
            v-if="message.senderType === 2 && isSending && !message.content"
            class="typing-indicator"
          >
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <div v-else-if="message.isError" class="error-message">
            <p>系统错误，请稍后再试</p>
          </div>
          <MarkdownRenderer
            v-else-if="message.senderType === 2 && !message.isError"
            :content="message.content"
            :is-ai-message="true"
            :streaming="isSending && message === messages[messages.length - 1]"
          />
          <p
            v-else-if="message.content"
            v-html="formatMessageContent(message.content)"
          ></p>
        </div>
        <div class="message-time">
          {{
            message.senderType === 2 && isSending
              ? "正在输入..."
              : message.createdAt
          }}
        </div>
      </div>
    </div>
  </div>
</template>
