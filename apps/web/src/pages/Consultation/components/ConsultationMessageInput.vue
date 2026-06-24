<script setup lang="ts">
import { computed } from "vue";
import { Promotion } from "@element-plus/icons-vue";

type Props = {
  modelValue: string;
  isSending: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  send: [];
}>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) return;

  event.preventDefault();
  emit("send");
};
</script>

<template>
  <div class="chat-input">
    <div class="input-container">
      <el-input
        v-model="inputValue"
        class="message-input"
        placeholder="今天有什么想跟我聊聊"
        type="textarea"
        :rows="2"
        :autosize="{ minRows: 2, maxRows: 4 }"
        :disabled="isSending"
        clearable
        @keydown.enter="handleEnter"
      />
      <div class="input-footer">
        <span>按 Enter 发送</span>
        <span>{{ modelValue.length }}/500</span>
      </div>
    </div>
    <div class="send-btn">
      <el-button
        type="primary"
        class="send-btn"
        :disabled="!modelValue.trim() || isSending || modelValue.length > 500"
        @click="emit('send')"
      >
        <el-icon><Promotion /></el-icon>
      </el-button>
    </div>
  </div>
</template>
