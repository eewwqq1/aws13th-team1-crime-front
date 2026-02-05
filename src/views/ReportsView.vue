<template>
  <div class="container pb-5">
    <div class="d-flex justify-content-between align-items-center mb-4 pt-4">
      <h2 class="fw-bold">🚨 범죄 제보 시스템</h2>
      <div class="d-flex align-items-center gap-3">
        <span v-if="currentUser" class="badge bg-light text-dark border">
          👤 {{ currentUser.email }} ({{ currentUser.role }})
        </span>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" v-model="isAdmin" id="adminSwitch" @change="loadReports">
          <label class="form-check-label fw-bold" :class="isAdmin ? 'text-danger' : ''" for="adminSwitch">
            {{ isAdmin ? '관리자 모드' : '유저 모드' }}
          </label>
        </div>
      </div>
    </div>

    <div v-if="!isAdmin || isEditing" class="card shadow-sm mb-5">
      <div class="card-header bg-white">
        <h5 class="mb-0">{{ isEditing ? '📝 제보 수정하기' : '📣 새 제보 등록' }}</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12">
            <input v-model="form.title" class="form-control" placeholder="제목">
          </div>
          <div class="col-12">
            <textarea v-model="form.content" class="form-control" rows="3" placeholder="내용"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label small">지역 ID</label>
            <input v-model.number="form.region_id" type="number" class="form-control">
          </div>
          <div class="col-md-6">
            <label class="form-label small">유형 ID</label>
            <input v-model.number="form.crime_type_id" type="number" class="form-control">
          </div>
          <div class="col-12 text-end">
            <button v-if="isEditing" @click="cancelEdit" class="btn btn-light me-2">취소</button>
            <button @click="handleSubmit" :class="isEditing ? 'btn btn-info text-white' : 'btn btn-success'">
              {{ isEditing ? '수정완료' : '제보하기' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="mb-0">📊 {{ isAdmin ? '전체 제보 관리' : '최신 제보 현황' }}</h5>
        <div class="d-flex gap-2">
          <select v-model="filterStatus" class="form-select form-select-sm w-auto" :disabled="!isAdmin">
            <option :value="undefined">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>
          <button @click="loadReports" class="btn btn-dark btn-sm">조회</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>지역/유형</th>
            <th>상태</th>
            <th class="text-center">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td>{{ report.id }}</td>
            <td class="fw-bold">{{ report.title }}</td>
            <td>{{ report.region?.province || report.region_id }} / {{ report.crime_type?.minor || report.crime_type_id }}</td>
            <td><span :class="getStatusBadge(report.status)">{{ report.status || 'pending' }}</span></td>
            <td class="text-center">
              <div v-if="isAdmin" class="btn-group btn-group-sm">
                <button v-if="report.status === 'pending'" @click="handleApprove(report.id)" class="btn btn-outline-success">승인</button>
                <button v-if="report.status === 'pending'" @click="handleReject(report.id)" class="btn btn-outline-danger">거절</button>
                <span v-else class="text-muted">처리됨</span>
              </div>
              <div v-else class="btn-group btn-group-sm">
                <button @click="startEdit(report)" class="btn btn-outline-primary">수정</button>
                <button @click="handleDelete(report.id)" class="btn btn-outline-danger">삭제</button>
              </div>
            </td>
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
  user_id: 0 // fetchUser에서 채워짐
});

const fetchUser = async () => {
  try {
    currentUser.value = await AuthService.getMeApiAuthMeGet();
    form.user_id = currentUser.value.id;
    // 유저 역할이 admin이면 자동으로 관리자 모드 활성
    if (currentUser.value.role === 'admin') isAdmin.value = true;
  } catch (e) {
    console.error("Not logged in");
  }
};

const loadReports = async () => {
  try {
    if (isAdmin.value) {
      // AdminService: get_reports_api_reports_get
      reports.value = await AdminService.getReportsApiReportsGet(filterStatus.value, 0, 100);
    } else {
      // ReportsService: get_reports_api_get
      reports.value = await ReportsService.getReportsApiGet(undefined, undefined, 0, 10, undefined, 'latest');
    }
  } catch (e) {
    console.error("Load failed", e);
  }
};

const handleSubmit = async () => {
  if (!form.title || !form.content) return alert("내용을 입력하세요");

  try {
    if (isEditing.value && editingId.value) {
      // ReportsService: update_report_api__report_id__put
      await ReportsService.updateReportApiReportIdPut(editingId.value, form as any);
      alert("수정 완료");
    } else {
      // ReportsService: create_report_api_post
      await ReportsService.createReportApiPost(form as any);
      alert("제보 완료");
    }
    resetForm();
    loadReports();
  } catch (e) {
    alert("권한이 없거나 오류가 발생했습니다.");
  }
};

const startEdit = (report: any) => {
  isEditing.value = true;
  editingId.value = report.id;
  form.title = report.title;
  form.content = report.content;
  form.region_id = report.region_id;
  form.crime_type_id = report.crime_type_id;
};

const cancelEdit = () => { resetForm(); };

const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  form.title = ''; form.content = '';
};

const handleDelete = async (id: number) => {
  if (!confirm("삭제할까요?")) return;
  try {
    // ReportsService: delete_report_api__report_id__delete
    await ReportsService.deleteReportApiReportIdDelete(id);
    loadReports();
  } catch (e) { alert("삭제 실패"); }
};

const handleApprove = async (id: number) => {
  await AdminService.approveReportApiReportsReportIdApprovePost(id);
  loadReports();
};

const handleReject = async (id: number) => {
  await AdminService.rejectReportApiReportsReportIdRejectPost(id);
  loadReports();
};

const getStatusBadge = (status: string) => {
  if (status === 'approved') return 'badge bg-success';
  if (status === 'rejected') return 'badge bg-danger';
  return 'badge bg-warning text-dark';
};

onMounted(async () => {
  await fetchUser();
  await loadReports();
});
</script>