<script setup lang="ts">
import type { ConsultationEmotion } from "@/types/consultation.types";

type Props = {
  emotion: ConsultationEmotion;
};

const props = defineProps<Props>();

const getIntensityClass = (dot: number) => {
  const score = props.emotion.emotionScore;
  if (score >= 66) {
    return dot <= 3;
  }

  if (score >= 33) {
    return dot <= 2;
  }

  return dot <= 1;
};

const getRiskLevel = (level: number) => {
  switch (level) {
    case 0:
      return "正常";
    case 1:
      return "关注";
    case 2:
      return "预警";
    case 3:
      return "危机";
    default:
      return "未知风险";
  }
};
</script>

<template>
  <div class="emotion-garden">
    <div class="garden-header">
      <div class="garden-title">情绪花园</div>
    </div>
    <div class="garden-main">
      <div class="emotion-info">
        <div class="emotion-name">{{ emotion.primaryEmotion }}</div>
        <div class="emotion-score">{{ emotion.emotionScore }}</div>
      </div>
      <div class="warm-tips">
        <div class="emotion-status-text">
          <span class="status-label">今天感觉</span>
          <span class="status-emotion">{{
            emotion.isNegative ? "需要关注" : "很不错"
          }}</span>
        </div>
        <div class="emotion-intensity">
          <span class="intensity-dots">
            <span
              v-for="dot in 3"
              :key="dot"
              class="dot"
              :class="{ active: getIntensityClass(dot) }"
            ></span>
          </span>
          <span class="intensity-level">{{ getRiskLevel(emotion.riskLevel) }}</span>
        </div>
        <div v-if="emotion.suggestion" class="warm-suggestion">
          <div class="suggestion-icon">💡</div>
          <div class="suggestion-content">
            <div class="suggestion-title">温暖建议</div>
            <div class="suggestion-text">
              {{ emotion.suggestion }}
            </div>
          </div>
        </div>

        <div class="healing-actions">
          <div class="actions-title">治愈小行动</div>
          <div class="actions-list">
            <div
              v-for="action in emotion.improvementSuggestions"
              :key="action"
              class="action-item"
            >
              <div class="action-icon">✨</div>
              <div class="action-text">{{ action }}</div>
            </div>
          </div>
        </div>
        <div
          v-if="emotion.riskLevel > 1 && emotion.isNegative"
          class="risk-notice"
        >
          <div class="notice-icon">🤗</div>
          <div class="notice-content">
            <div class="notice-title">温馨提示</div>
            <div class="notice-text">
              {{ emotion.riskDescription }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
