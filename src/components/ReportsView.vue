<template>
  <div class="report-container" :class="{ 'admin-theme': isAdmin }">

    <div class="mode-toggle">
      <span class="mode-label" :class="{ 'active': isAdmin }">
        {{ isAdmin ? '관리자 모드' : '유저 모드' }}
      </span>
      <label class="switch">
        <input type="checkbox" v-model="isAdmin">
        <span class="slider round"></span>
      </label>
    </div>

    <h1>🚨 범죄 제보 시스템</h1>

    <section class="report-form card">
      <h3>{{ isEditing ? '📝 제보 수정하기' : '📣 새 제보 등록' }}</h3>

      <div class="input-group">
        <input v-model="form.title" placeholder="제목을 입력하세요" class="main-input" />
        <textarea v-model="form.content" placeholder="내용을 상세히 입력해주세요" class="main-textarea"></textarea>
      </div>

      <div class="id-inputs">
        <div class="form-group">
          <label>지역 ID</label>
          <input v-model.number="form.region_id" type="number" />
        </div>
        <div class="form-group">
          <label>유형 ID</label>
          <input v-model.number="form.crime_type_id" type="number" />
        </div>
        <div class="form-group">
          <label>사용자 ID</label>
          <input v-model.number="form.user_id" type="number" />
        </div>
      </div>

      <div class="button-container">
        <button v-if="!isEditing" @click="handleSubmit" class="btn-submit" :disabled="loading">제보하기</button>
        <template v-else>
          <button @click="handleSubmit" class="btn-edit">수정완료</button>
          <button @click="cancelEdit" class="btn-cancel">취소</button>
        </template>
      </div>
    </section>

    <hr class="divider" />

    <section class="report-list">
      <div class="list-header">
        <h3>📊 제보 현황</h3>
      </div>

      <div class="list-controls card">
        <div class="search-box">
          <input v-model="searchKeyword" @keyup.enter="loadReports" placeholder="검색어 입력..." />
          <button @click="loadReports" class="btn-search">🔍</button>
        </div>

        <div class="filter-group-inline">
          <input v-model.number="filterRegion" type="number" placeholder="지역" class="small-input" />
          <input v-model.number="filterType" type="number" placeholder="유형" class="small-input" />
          <select v-model="sortBy" @change="loadReports" class="sort-select">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
          <button @click="loadReports" class="btn-load">조회</button>
        </div>
      </div>

      <div v-if="loading" class="status">데이터 로딩 중...</div>

      <div v-else class="table-wrapper card">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>지역</th>
            <th>유형</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="report in reports" :key="report.id" :class="{ 'editing-row': editingId === report.id }">
            <td>{{ report.id }}</td>
            <td class="title-cell">
              {{ report.title }}
              <span v-if="report.status" class="status-tag" :class="report.status.toLowerCase()">{{ report.status }}</span>
            </td>
            <td>{{ report.region.province }} {{ report.region.city }}</td>
            <td>{{ report.crime_type.minor }}</td>
            <td>{{ new Date(report.created_at).toLocaleDateString() }}</td>
            <td class="actions">
              <template v-if="isAdmin">
                <button @click="approveReport(report.id)" class="btn-action btn-approve">승인</button>
                <button @click="rejectReport(report.id)" class="btn-action btn-reject">거절</button>
              </template>
              <template v-else>
                <button @click="startEdit(report)" class="btn-action btn-edit-small">수정</button>
                <button @click="deleteReport(report.id)" class="btn-action btn-delete-small">삭제</button>
              </template>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="btn-page">이전</button>
      <span class="page-info"><strong>{{ currentPage }}</strong> 페이지</span>
      <button :disabled="reports.length < pageSize" @click="changePage(currentPage + 1)" class="btn-page">다음</button>
      <select v-model.number="pageSize" @change="() => { currentPage = 1; loadReports(); }" class="size-select">
        <option :value="5">5개씩</option>
        <option :value="10">10개씩</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
/* 스크립트 로직은 이전과 동일 (isAdmin, loadReports 등) */
import { ref, onMounted, reactive } from 'vue';
import { ReportsService } from '@/api/generated/services/ReportsService';
import type { ReportRead } from '@/api/generated/models/ReportRead';

const isAdmin = ref(false);
const reports = ref<ReportRead[]>([]);
const loading = ref(false);
const filterRegion = ref<number | null>(null);
const filterType = ref<number | null>(null);
const searchKeyword = ref('');
const sortBy = ref('latest');
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

const form = reactive({
  title: '', content: '', region_id: 1, crime_type_id: 1, user_id: 1
});

const loadReports = async () => {
  loading.value = true;
  const skip = (currentPage.value - 1) * pageSize.value;
  try {
    reports.value = await ReportsService.getReportsApiGet(
        filterRegion.value || undefined,
        filterType.value || undefined,
        skip,
        pageSize.value,
        searchKeyword.value || undefined,
        sortBy.value,
    );
  } catch (e) {
    alert("목록 로드 실패");
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => { currentPage.value = page; loadReports(); };

const startEdit = (report: ReportRead) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  isEditing.value = true;
  editingId.value = report.id;
  form.title = report.title;
  form.content = report.content;
  form.region_id = report.region.id;
  form.crime_type_id = report.crime_type.id;
  form.user_id = report.user_id;
};

const handleSubmit = async () => {
  if (!form.title || !form.content) return alert("내용을 입력해주세요.");
  try {
    if (isEditing.value && editingId.value) {
      await ReportsService.patchReportApiReportIdPatch(editingId.value, form);
      alert("수정되었습니다.");
    } else {
      await ReportsService.createReportApiPost(form as any);
      alert("등록되었습니다.");
    }
    resetForm();
    await loadReports();
  } catch (e) { alert("저장 실패"); }
};

const resetForm = () => {
  isEditing.value = false; editingId.value = null;
  form.title = ''; form.content = ''; form.region_id = 1; form.crime_type_id = 1;
};
const cancelEdit = () => resetForm();

const deleteReport = async (id: number) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await ReportsService.deleteReportApiReportIdDelete(id);
    await loadReports();
  } catch (e) { alert("삭제 실패"); }
};

// 승인/거절 가상 함수 (백엔드 연결용)
const approveReport = async (id: number) => { alert(`ID ${id} 승인 처리 (통계 반영)`); };
const rejectReport = async (id: number) => { alert(`ID ${id} 거절 처리`); };

onMounted(loadReports);
</script>

<style scoped>
/* 1. 기본 레이아웃 & 폰트 */
.report-container {
  max-width: 1200px; margin: 0 auto; padding: 40px 20px;
  font-family: 'Pretendard', -apple-system, sans-serif;
  transition: background-color 0.4s ease;
  min-height: 100vh;
}

/* 2. 카드 공통 스타일 (이전 스타일 유지) */
.card {
  background: #fff; border-radius: 12px; padding: 25px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.05); margin-bottom: 25px;
  border: 1px solid #f0f0f0;
}

/* 3. 폼 스타일 최적화 (Input 창 정렬 복구) */
.input-group input, .input-group textarea {
  width: 100%; padding: 12px; margin-bottom: 12px;
  border: 1px solid #ddd; border-radius: 6px;
  box-sizing: border-box; font-size: 15px;
}
.main-textarea { height: 120px; resize: vertical; }

.id-inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 10px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #666; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }

/* 4. 필터 & 리스트 컨트롤 */
.list-controls { display: flex; justify-content: space-between; align-items: center; gap: 20px; background: #fafafa; }
.search-box { display: flex; flex: 2; gap: 8px; }
.search-box input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
.filter-group-inline { display: flex; flex: 3; gap: 10px; justify-content: flex-end; }
.small-input { width: 70px; text-align: center; }
.sort-select { padding: 10px; border-radius: 6px; border: 1px solid #ddd; }

/* 5. 버튼 스타일 */
button { border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.btn-submit { background: #42b983; color: white; width: 120px; padding: 12px; }
.btn-edit { background: #3498db; color: white; padding: 12px 20px; }
.btn-cancel { background: #95a5a6; color: white; padding: 12px 20px; margin-left: 10px; }
.btn-search, .btn-load { background: #333; color: white; padding: 0 15px; }

/* 액션 버튼 (승인/거절/수정/삭제) */
.btn-action { padding: 6px 12px; font-size: 12px; margin-left: 5px; }
.btn-approve { background: #27ae60; color: white; }
.btn-reject { background: #e74c3c; color: white; }
.btn-edit-small { background: #f39c12; color: white; }
.btn-delete-small { border: 1px solid #e74c3c; color: #e74c3c; background: transparent; }

/* 6. 테이블 스타일 (카드 안에 포함) */
.table-wrapper { padding: 0; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { background: #f8f9fa; padding: 15px; text-align: left; color: #333; font-weight: 700; border-bottom: 2px solid #eee; }
td { padding: 15px; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
.title-cell { font-weight: 600; }

/* 7. 관리자 테마 스타일 (배경만 변경, 내부 정렬 유지) */
.admin-theme { background-color: #1a202c; }
.admin-theme h1, .admin-theme h3 { color: #edf2f7; }
.admin-theme .card { background: #2d3748; border-color: #4a5568; color: #edf2f7; }
.admin-theme .form-group label { color: #a0aec0; }
.admin-theme th { background: #2d3748; color: #a0aec0; border-bottom-color: #4a5568; }
.admin-theme td { border-bottom-color: #4a5568; }

/* 8. 모드 토글 스위치 */
.mode-toggle { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-bottom: 15px; }
.mode-label { font-size: 12px; font-weight: 800; color: #999; }
.mode-label.active { color: #e74c3c; }

.switch { position: relative; width: 50px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #cbd5e0; transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background: #e74c3c; }
input:checked + .slider:before { transform: translateX(26px); }

/* 기타 */
.status-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; background: #edf2f7; color: #4a5568; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
</style>