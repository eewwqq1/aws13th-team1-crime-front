<template>
  <div>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        <span class="text-warning">🚨</span> CRIME SYSTEM
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/reports" class="nav-link" active-class="active">제보 현황</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/stats" class="nav-link" active-class="active">통계 대시보드</router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3">
          <template v-if="user">
            <div class="d-flex align-items-center me-2">
              <span class="badge bg-primary me-2">{{ user.role }}</span>
              <span class="text-light small fw-bold">{{ user.nickname }}님</span>
            </div>
            <button @click="handleLogout" class="btn btn-outline-danger btn-sm px-3">
              로그아웃
            </button>
          </template>

          <template v-else>
            <button @click="handleLogin" class="btn btn-primary btn-sm px-3 fw-bold">
              Google 로그인
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <main class="container">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AuthService } from '@/api/generated/services/AuthService';
import { OpenAPI } from '@/api/generated';

// 사용자 상태 정보
const user = ref<any>(null);

/**
 * 현재 로그인된 사용자 정보 확인 (api/auth/me)
 */
OpenAPI.WITH_CREDENTIALS = true;
const checkUserStatus = async () => {
  try {
    const response = await AuthService.getMeApiAuthMeGet();
    user.value = response;
  } catch (error) {
    console.log("로그인되지 않은 상태입니다.");
    user.value = null;
  }
};

/**
 * 구글 로그인 처리
 * CORS 방지를 위해 백엔드 로그인 URL로 직접 브라우저 이동
 */
const handleLogin = () => {
  window.location.href = 'http://localhost:8000/api/google/login';
};

/**
 * 로그아웃 처리
 */
const handleLogout = async () => {
  if (!confirm("로그아웃 하시겠습니까?")) return;
  try {
    await AuthService.logoutApiAuthLogoutPost();
    user.value = null;
    alert("로그아웃 되었습니다.");
    window.location.href = '/'; // 홈으로 이동하며 상태 초기화
  } catch (error) {
    console.error("Logout Error:", error);
    alert("로그아웃 처리 중 오류가 발생했습니다.");
  }
};

// 앱 시작 시 로그인 상태 확인
onMounted(() => {
  checkUserStatus();
});
</script>

<style>
/* 전역 폰트 및 배경 설정 */
body {
  background-color: #f8f9fa;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

/* 네비게이션 링크 활성화 디자인 */
.nav-link {
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}
.nav-link.active {
  color: #ffc107 !important; /* 강조색 */
  border-bottom: 2px solid #ffc107;
}

/* 페이지 전환 애니메이션 (Fade) */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 추가 커스텀: 버튼 호버 효과 */
.btn {
  border-radius: 8px;
}
</style>