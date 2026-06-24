<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import avatarUrl from "@health-chat/assets/images/like.png";

const emit = defineEmits<{
  "new-session": [];
}>();
</script>

<template>
  <div class="chat-header">
    <div class="header-left">
      <div class="chat-avatar">
        <el-image :src="avatarUrl" style="width: 40px; height: 40px" />
      </div>
      <div class="chat-info">
        <h2>小心</h2>
        <p>你最贴心的心理健康助手</p>
      </div>
    </div>
    <div class="header-right">
      <el-button circle title="创建新会话" @click="emit('new-session')">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>
  </div>
</template>
