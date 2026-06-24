<script setup lang="ts">
import robotUrl from "@health-chat/assets/images/robot-fill.png";
</script>

<template>
  <div class="ai-assistant-info">
    <div class="breathing-circle">
      <el-image :src="robotUrl" style="width: 40px; height: 40px" />
    </div>
    <div class="assistant-name">小心</div>
    <div class="online-status">
      <div class="status-dot"></div>
      在线
    </div>
  </div>
</template>
