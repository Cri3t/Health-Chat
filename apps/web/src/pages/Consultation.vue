<script setup lang="ts">
import ConsultationAssistantCard from "./Consultation/components/ConsultationAssistantCard.vue";
import ConsultationChatHeader from "./Consultation/components/ConsultationChatHeader.vue";
import ConsultationEmotionPanel from "./Consultation/components/ConsultationEmotionPanel.vue";
import ConsultationMessageInput from "./Consultation/components/ConsultationMessageInput.vue";
import ConsultationMessageList from "./Consultation/components/ConsultationMessageList.vue";
import ConsultationSessionList from "./Consultation/components/ConsultationSessionList.vue";
import { useConsultationSession } from "@/composables/useConsultationSession";

const {
  createNewSession,
  currentEmotion,
  handleDeleteSession,
  handleEnterSession,
  isSending,
  messages,
  sendMessage,
  sessionList,
  userInput,
} = useConsultationSession();
</script>

<template>
  <div class="consultation-container">
    <div class="sidebar">
      <ConsultationAssistantCard />
      <ConsultationEmotionPanel :emotion="currentEmotion" />
      <ConsultationSessionList
        :sessions="sessionList"
        @enter="handleEnterSession"
        @delete="handleDeleteSession"
      />
    </div>
    <div class="chat-main">
      <ConsultationChatHeader @new-session="createNewSession" />
      <ConsultationMessageList :messages="messages" :is-sending="isSending" />
      <ConsultationMessageInput
        v-model="userInput"
        :is-sending="isSending"
        @send="sendMessage"
      />
    </div>
  </div>
</template>

<style lang="less" src="@/styles/pages/consultation.less"></style>
