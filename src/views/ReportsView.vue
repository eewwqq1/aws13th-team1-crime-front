<template>
  <div class="container pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4 pt-4">
      <h2 class="fw-bold">🚨 범죄 제보 시스템</h2>
      <div class="d-flex align-items-center gap-3">
        <span v-if="currentUser" class="badge bg-light text-dark border">
          👤 {{ currentUser.nickname || currentUser.email }} ({{ translateRole(currentUser.role) }})
        </span>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" v-model="isAdmin" id="adminSwitch" @change="onAdminToggle">
          <label class="form-check-label fw-bold" :class="isAdmin ? 'text-danger' : ''" for="adminSwitch">
            {{ isAdmin ? '관리자 모드' : '유저 모드' }}
          </label>
        </div>
      </div>
    </div>

    <div v-if="!isAdmin || isEditing" class="card shadow-sm mb-5 border-0 bg-light">
      <div class="card-header bg-white border-bottom-0 pt-3">
        <h5 class="fw-bold mb-0">{{ isEditing ? '📝 제보 수정하기' : '📣 새 제보 등록' }}</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12">
            <input v-model="form.title" class="form-control" placeholder="제보 제목을 입력하세요">
          </div>
          <div class="col-12">
            <textarea v-model="form.content" class="form-control" rows="3" placeholder="상세 내용을 입력하세요"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold">📍 지역 ID</label>
            <input v-model.number="form.region_id" type="number" class="form-control">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold">📂 유형 ID</label>
            <input v-model.number="form.crime_type_id" type="number" class="form-control">
          </div>
          <div class="col-12 text-end mt-4">
            <button v-if="isEditing" @click="cancelEdit" class="btn btn-outline-secondary me-2 px-4">취소</button>
            <button @click="handleSubmit" :class="isEditing ? 'btn btn-info text-white' : 'btn btn-success'" class="px-4 fw-bold">
              {{ isEditing ? '수정완료' : '제보하기' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0 fw-bold text-dark">
          <span v-if="isAdmin">📋 전체 제보 관리</span>
          <span v-else>📜 내 제보 현황</span>
        </h5>
        <div class="d-flex gap-2">
          <select v-model="filterStatus" class="form-select form-select-sm w-auto" :disabled="!isAdmin">
            <option :value="undefined">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>
          <button @click="loadReports" class="btn btn-dark btn-sm px-3">조회</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
          <tr>
            <th class="ps-3">ID</th>
            <th>제목</th>
            <th>지역/유형</th>
            <th>상태</th>
            <th class="text-center">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td class="ps-3 text-muted">#{{ report.id }}</td>
            <td class="fw-bold">{{ report.title }}</td>
            <td>
              <span class="badge bg-light text-dark border-0">
                {{ report.region?.province || '지역'+report.region_id }} / {{ report.crime_type?.minor || '유형'+report.crime_type_id }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadge(report.status)">
                {{ translateStatus(report.status) }}
              </span>
            </td>
            <td class="text-center pe-3">
              <div v-if="isAdmin" class="btn-group btn-group-sm">
                <template v-if="report.status === 'pending' || !report.status">
                  <button @click="handleApprove(report.id)" class="btn btn-success px-3">승인</button>
                  <button @click="handleReject(report.id)" class="btn btn-danger px-3">거절</button>
                </template>
                <span v-else class="text-muted small fw-bold">처리완료</span>
              </div>

              <div v-else class="btn-group btn-group-sm">
                <button @click="startEdit(report)" class="btn btn-outline-primary px-3">수정</button>
                <button @click="handleDelete(report.id)" class="btn btn-outline-danger px-3">삭제</button>
              </div>
            </td>
          </tr>
          <tr v-if="reports.length === 0">
            <td colspan="5" class="text-center py-5 text-muted">데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ReportsService, AdminService, AuthService, OpenAPI } from '@/api/generated';

// 백엔드 주소 강제 고정 (구글 로그인 세션 유지용)
OpenAPI.BASE = 'http://localhost:8000';
OpenAPI.WITH_CREDENTIALS = true;

const isAdmin = ref(false);
const currentUser = ref<any>(null);
const reports = ref<any[]>([]);
const filterStatus = ref<any>(undefined);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = reactive({
  title: '',
  content: '',
  region_id: 1,
  crime_type_id: 1,
  user_id: 0
});

// 사용자 정보 로드
const fetchUser = async () => {
  try {
    currentUser.value = await AuthService.getMeApiAuthMeGet();
    form.user_id = currentUser.value.id;
    if (currentUser.value.role === 'admin') {
      isAdmin.value = true;
    }
  } catch (e) {
    console.warn("로그인 정보가 없습니다.");
  }
};

// 관리자 토글 시 리스트 즉시 새로고침
const onAdminToggle = () => {
  reports.value = [];
  loadReports();
};

// 리스트 로드 (404 에러 방지를 위해 경로 최적화)
const loadReports = async () => {
  try {
    if (isAdmin.value) {
      // 관리자: GET /api/reports (AdminService 사용)
      reports.value = await AdminService.getReportsApiReportsGet(filterStatus.value, 0, 100);
    } else {
      // 일반 유저: 404를 피하기 위해 AdminService와 동일한 경로를 시도하거나 ReportsService 파라미터 체크
      // Swagger 분석상 AdminService의 함수가 /api/reports 경로를 확실히 타격함
      reports.value = await AdminService.getReportsApiReportsGet(undefined, 0, 100);
    }
    console.log("Data Loaded:", reports.value);
  } catch (e: any) {
    console.error("Load failed:", e);
    if (e.status === 404) {
      alert("서버 경로를 찾을 수 없습니다 (404). 백엔드 라우터를 확인하세요.");
    }
  }
};

const handleSubmit = async () => {
  if (!form.title || !form.content) return alert("내용을 입력하세요");

  try {
    if (isEditing.value && editingId.value) {
      await ReportsService.updateReportApiReportIdPut(editingId.value, form as any);
      alert("성공적으로 수정되었습니다.");
    } else {
      await ReportsService.createReportApiPost(form as any);
      alert("제보가 등록되었습니다.");
    }
    resetForm();
    await loadReports();
  } catch (e) {
    alert("처리 중 오류가 발생했습니다. 권한을 확인하세요.");
  }
};

const startEdit = (report: any) => {
  isEditing.value = true;
  editingId.value = report.id;
  form.title = report.title;
  form.content = report.content;
  form.region_id = report.region_id;
  form.crime_type_id = report.crime_type_id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => { resetForm(); };

const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  form.title = ''; form.content = '';
};

const handleDelete = async (id: number) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await ReportsService.deleteReportApiReportIdDelete(id);
    await loadReports();
  } catch (e) { alert("삭제 실패"); }
};

const handleApprove = async (id: number) => {
  try {
    await AdminService.approveReportApiReportsReportIdApprovePost(id);
    alert("제보가 승인되었습니다.");
    await loadReports();
  } catch (e) { alert("승인 실패"); }
};

const handleReject = async (id: number) => {
  try {
    await AdminService.rejectReportApiReportsReportIdRejectPost(id);
    alert("제보가 거절되었습니다.");
    await loadReports();
  } catch (e) { alert("거절 실패"); }
};

// 뱃지 및 텍스트 유틸리티
const getStatusBadge = (status: string) => {
  if (status === 'approved') return 'badge bg-success px-3';
  if (status === 'rejected') return 'badge bg-danger px-3';
  return 'badge bg-warning text-dark px-3';
};

const translateStatus = (status: string) => {
  const map: any = { 'pending': '대기중', 'approved': '승인됨', 'rejected': '거절됨' };
  return map[status] || '대기중';
};

const translateRole = (role: string) => {
  return role === 'admin' ? '관리자' : '일반유저';
};

onMounted(async () => {
  await fetchUser();
  await loadReports();
});
</script>

<style scoped>
/* 테이블 행 호버 효과 */
.table-hover tbody tr:hover {
  background-color: rgba(0,0,0,0.02);
}
.btn {
  border-radius: 6px;
  transition: all 0.2s;
}
.card {
  border-radius: 12px;
}
</style>