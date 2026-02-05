<script setup lang="ts">
// 방금 만든 제보 관리 컴포넌트를 가져옵니다.
import ReportsView from './components/ReportsView.vue';
import { onMounted } from 'vue';
import { OpenAPI } from '@/api/generated';
import StatsView from "@/components/StatsView.vue";

// 앱이 시작될 때 API의 Base URL을 전역 설정합니다.
onMounted(() => {
  OpenAPI.BASE = 'http://127.0.0.1:8000';
});
</script>

<template>
  <main>
    <ReportsView />
    <StatsView />
  </main>
</template>

<style>
/* 간단한 전역 스타일 */
#app {
  width: 100%;
  display: flex;
  justify-content: center; /* 자식 요소들을 가로 중앙으로 */
}
body {
  font-family: Arial, sans-serif;
  background-color: #f4f7f6;
  margin: 0;
  color: #333;
}

main {
  padding: 20px;
}
</style>