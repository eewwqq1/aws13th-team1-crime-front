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

    <div v-if="!isAdmin || isEditing" class="card shadow-sm mb-4 border-0 bg-light">
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
          <div class="col-12 text-end mt-3">
            <button v-if="isEditing" @click="cancelEdit" class="btn btn-outline-secondary me-2">취소</button>
            <button @click="handleSubmit" :class="isEditing ? 'btn btn-info text-white' : 'btn btn-success'">
              {{ isEditing ? '수정완료' : '제보하기' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body bg-white">
        <div v-if="!isAdmin" class="row g-2 align-items-center">
          <div class="col-md-4">
            <input v-model="searchFilters.keyword" class="form-control form-control-sm" placeholder="🔍 제목/내용 검색" @keyup.enter="resetAndLoad">
          </div>
          <div class="col-md-2">
            <input v-model.number="searchFilters.region_id" type="number" class="form-control form-control-sm" placeholder="📍 지역 ID">
          </div>
          <div class="col-md-2">
            <input v-model.number="searchFilters.crime_type_id" type="number" class="form-control form-control-sm" placeholder="📂 유형 ID">
          </div>
          <div class="col-md-2">
            <select v-model="sortBy" class="form-select form-select-sm" @change="resetAndLoad">
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
          <div class="col-md-2 d-grid">
            <button @click="resetAndLoad" class="btn btn-dark btn-sm">검색</button>
          </div>
        </div>
        <div v-else class="d-flex justify-content-between align-items-center">
          <span class="fw-bold text-danger small">⚠️ 관리자: 상태별 전체 목록을 조회합니다.</span>
          <select v-model="filterStatus" class="form-select form-select-sm w-auto" @change="resetAndLoad">
            <option :value="undefined">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
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
                {{ report.region?.province || '지역 ' + report.region_id }} /
                {{ report.crime_type?.minor || '유형 ' + report.crime_type_id }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadge(report)">
                {{ translateStatus(report) }}
              </span>
            </td>
            <td class="text-center pe-3">
              <div v-if="isAdmin" class="btn-group btn-group-sm">
                <template v-if="isPending(report)">
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
            <td colspan="5" class="text-center py-5 text-muted">조회된 데이터가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer bg-white d-flex justify-content-center py-3 border-0">
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item active">
              <span class="page-link bg-dark border-dark">{{ currentPage + 1 }}</span>
            </li>
            <li class="page-item" :class="{ disabled: reports.length < pageSize }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ReportsService, AdminService, AuthService, OpenAPI } from '@/api/generated';

OpenAPI.BASE = 'http://localhost:8000';
OpenAPI.WITH_CREDENTIALS = true;

const isAdmin = ref(false);
const currentUser = ref<any>(null);
const reports = ref<any[]>([]);
const filterStatus = ref<any>(undefined);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const sortBy = ref('latest');

// 페이지네이션 상태
const currentPage = ref(0);
const pageSize = 10;

const searchFilters = reactive({
  keyword: '',
  region_id: undefined as number | undefined,
  crime_type_id: undefined as number | undefined
});

const form = reactive({
  title: '',
  content: '',
  region_id: 1,
  crime_type_id: 1,
  user_id: 0
});

// 1. 객체 내부에서 상태 필드를 안전하게 추출하는 핵심 함수
const getStatus = (report: any) => {
  if (!report) return 'pending';
  // 백엔드 응답 필드가 다를 수 있으므로 여러 후보를 체크합니다.
  const s = report.status || report.report_status || report.state || 'pending';
  return String(s).toLowerCase().trim();
};

const translateStatus = (report: any) => {
  const s = getStatus(report);
  const map: any = {
    'pending': '대기중',
    'approved': '승인됨',
    'rejected': '거절됨'
  };
  return map[s] || '대기중';
};
// 3. 템플릿에서 :class="getStatusBadge(report)" 로 호출할 때 사용
const getStatusBadge = (report: any) => {
  const s = getStatus(report);
  if (s === 'approved') return 'badge bg-success px-3';
  if (s === 'rejected') return 'badge bg-danger px-3';
  return 'badge bg-warning text-dark px-3';
};

// 4. 템플릿에서 v-if="isPending(report)" 로 호출할 때 사용
const isPending = (report: any) => {
  return getStatus(report) === 'pending';
};

const translateRole = (role: string) => role === 'admin' ? '관리자' : '일반유저';

// 로직
const loadReports = async () => {
  try {
    const skip = currentPage.value * pageSize;

    if (isAdmin.value) {
      reports.value = await AdminService.getReportsApiReportsGet(
          filterStatus.value,
          skip,
          pageSize
      );
    } else {
      // 'latest' 고정값 대신 sortBy.value를 전달
      reports.value = await ReportsService.getReportsApiGet(
          searchFilters.region_id || undefined,
          searchFilters.crime_type_id || undefined,
          skip,
          pageSize,
          searchFilters.keyword || undefined,
          sortBy.value // <--- 선택한 정렬 기준 반영
      );
    }
  } catch (e) {
    console.error("Load failed:", e);
  }
};

const resetAndLoad = () => {
  currentPage.value = 0;
  loadReports();
};

const changePage = (page: number) => {
  if (page < 0) return;
  currentPage.value = page;
  loadReports();
};

const onAdminToggle = () => {
  resetAndLoad();
};

// ... handleSubmit, handleApprove, handleReject, handleDelete, startEdit 등은 이전과 동일 ...
// (지면상 생략하지만 기존 로직 그대로 유지하시면 됩니다)

const handleSubmit = async () => {
  if (!form.title || !form.content) return alert("내용을 입력하세요");
  try {
    if (isEditing.value && editingId.value) {
      await ReportsService.updateReportApiReportIdPut(editingId.value, form as any);
      alert("수정되었습니다.");
    } else {
      await ReportsService.createReportApiPost(form as any);
      alert("제보가 등록되었습니다.");
    }
    resetForm();
    await loadReports();
  } catch (e) { alert("오류 발생"); }
};

const handleApprove = async (id: number) => {
  try {
    await AdminService.approveReportApiReportsReportIdApprovePost(id);
    alert("승인 완료");
    await loadReports();
  } catch (e) { alert("승인 실패"); }
};

const handleReject = async (id: number) => {
  try {
    await AdminService.rejectReportApiReportsReportIdRejectPost(id);
    alert("거절 완료");
    await loadReports();
  } catch (e) { alert("거절 실패"); }
};

const handleDelete = async (id: number) => {
  if (!confirm("삭제하시겠습니까?")) return;
  await ReportsService.deleteReportApiReportIdDelete(id);
  loadReports();
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

const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  form.title = ''; form.content = '';
};

const cancelEdit = () => resetForm();

onMounted(async () => {
  try {
    currentUser.value = await AuthService.getMeApiAuthMeGet();
    form.user_id = currentUser.value.id;
    if (currentUser.value.role === 'admin') isAdmin.value = true;
  } catch (e) {}
  await loadReports();
});
</script>
<style scoped>
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