<template>
  <div class="stats-container">
    <header class="stats-header">
      <h2>📊 연도별 범죄 통계 대시보드</h2>
    </header>

    <section class="filter-card">
      <div class="filter-group">
        <label>📍 지역 선택</label>
        <select v-model="filters.region_id" @change="loadChartData">
          <option :value="null">전체 지역</option>
          <option v-for="r in regions" :key="r.id" :value="r.id">
            {{ r.province }} {{ r.city }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>🔪 범죄 유형</label>
        <select v-model="filters.crime_type_id" @change="loadChartData">
          <option :value="null">전체 유형</option>
          <option v-for="c in crimeTypes" :key="c.id" :value="c.id">
            {{ c.major }} > {{ c.minor }}
          </option>
        </select>
      </div>
    </section>

    <section class="chart-card">
      <div v-if="loading" class="loading-overlay">데이터 로딩 중...</div>
      <div v-else class="chart-wrapper">
        <Line
            v-if="chartData.labels.length > 0"
            :data="chartData"
            :options="chartOptions"
        />
        <div v-else class="no-data">조회된 통계 데이터가 없습니다.</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, LineElement,
  CategoryScale, LinearScale, PointElement, Filler
} from 'chart.js';
import { DefaultService, OfficialStatsService } from '@/api/generated';

// Chart.js 컴포넌트 등록
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

// --- 상태 관리 ---
const regions = ref<any[]>([]);
const crimeTypes = ref<any[]>([]);
const loading = ref(false);

const filters = reactive({
  region_id: null as number | null,
  crime_type_id: null as number | null,
});

const chartData = reactive({
  labels: [] as string[],
  datasets: [
    {
      label: '범죄 발생 건수',
      borderColor: '#42b983',
      backgroundColor: 'rgba(66, 185, 131, 0.2)',
      data: [] as number[],
      fill: true,
      tension: 0.3 // 곡선 부드럽게
    },
    {
      label: '검거 건수',
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      data: [] as number[],
      fill: true,
      tension: 0.3
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: { beginAtZero: true }
  }
};

// --- 데이터 로드 로직 ---

const loadInitialData = async () => {
  try {
    const [resRegions, resCrimes] = await Promise.all([
      DefaultService.getRegionsApiRegionsGet(),
      DefaultService.getCrimeTypesApiCrimeTypesGet()
    ]);
    regions.value = resRegions;
    crimeTypes.value = resCrimes;
  } catch (e) {
    console.error("초기 목록 로드 실패", e);
  }
};

const loadChartData = async () => {
  loading.value = true;
  try {
    const stats = await OfficialStatsService.getOfficialStatsApiOfficialStatsGet(
        filters.region_id ?? undefined,
        filters.crime_type_id ?? undefined
    );

    // X축 (연도) 추출 및 데이터 매핑
    chartData.labels = stats.map(s => `${s.year}년`);
    chartData.datasets[0].label = '범죄 발생 수치';
    chartData.datasets[0].data = stats.map(s => s.count);
  } catch (e) {
    alert("통계 데이터를 불러오지 못했습니다.");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadInitialData();
  await loadChartData();
});
</script>

<style scoped>
.stats-container { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.filter-card {
  display: flex; gap: 20px; background: #f8f9fa; padding: 20px;
  border-radius: 8px; margin-bottom: 20px;
}
.filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.filter-group label { font-size: 0.85rem; font-weight: bold; color: #555; }
select { padding: 8px; border-radius: 4px; border: 1px solid #ddd; }

.chart-card { border: 1px solid #eee; padding: 20px; border-radius: 8px; min-height: 450px; position: relative; }
.chart-wrapper { height: 400px; }
.loading-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.no-data { text-align: center; margin-top: 150px; color: #999; }
</style>