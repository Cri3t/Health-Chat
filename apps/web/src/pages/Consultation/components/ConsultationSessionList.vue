<script setup lang="ts">
import { ChatRound, Clock, Delete } from "@element-plus/icons-vue";
import type { ConsultationSessionListItem } from "@/types/consultation.types";

type Props = {
  sessions: ConsultationSessionListItem[];
};

defineProps<Props>();

const emit = defineEmits<{
  enter: [session: ConsultationSessionListItem];
  delete: [sessionId: string | number];
}>();
</script>

<template>
  <div class="session-history">
    <h4 class="section-title">会话历史</h4>
    <div v-if="sessions.length > 0" class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        @click="emit('enter', session)"
      >
        <div class="session-info">
          <div class="session-title">
            <span>{{ session.sessionTitle }}</span>
            <div class="session-meta">
              <span class="session-time"></span>
            </div>
            <div class="session-preview">
              {{ session.lastMessageContent || "暂无消息" }}
            </div>
            <div class="session-stats">
              <span>
                <el-icon><ChatRound /></el-icon>
                {{ session.messageCount || 0 }}
              </span>
              <span>
                <el-icon><Clock /></el-icon>
                {{ session.startedAt }}
              </span>
            </div>
          </div>
          <div class="session-actions">
            <el-button
              text
              type="danger"
              size="small"
              title="删除会话"
              :icon="Delete"
              circle
              @click.stop="emit('delete', session.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
