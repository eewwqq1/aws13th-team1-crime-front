<template>
  <div class="stats-container container-fluid py-4">
    <header class="stats-header mb-4">
      <h2 class="fw-bold text-center">📊 연도별 범죄 통계 대시보드</h2>
    </header>

    <section class="filter-card card shadow-sm mb-4">
      <div class="card-body d-flex gap-3">
        <div class="filter-group flex-grow-1">
          <label class="form-label fw-bold small text-muted">📍 지역 선택</label>
          <select v-model="filters.region_id" @change="loadChartData" class="form-select">
            <option :value="null">전체 지역</option>
            <option v-for="r in regions" :key="r.id" :value="r.id">
              {{ r.province }} {{ r.city || '' }}
            </option>
          </select>
        </div>

        <div class="filter-group flex-grow-1">
          <label class="form-label fw-bold small text-muted">🔪 범죄 유형</label>
          <select v-model="filters.crime_type_id" @change="loadChartData" class="form-select">
            <option :value="null">전체 유형</option>
            <option v-for="c in crimeTypes" :key="c.id" :value="c.id">
              {{ c.major }} {{ c.minor ? '> ' + c.minor : '' }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <section class="chart-card card shadow-sm">
      <div class="card-body" style="min-height: 500px; position: relative;">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner-border text-success" role="status"></div>
          <p class="mt-2">데이터 로딩 중...</p>
        </div>

        <div v-else class="chart-wrapper" style="height: 450px;">
          <Line
              v-if="chartData.labels.length > 0"
              :data="chartData"
              :options="chartOptions"
          />
          <div v-else class="no-data-wrapper text-center py-5">
            <p class="text-muted fs-4">조회된 통계 데이터가 없습니다.</p>
            <span class="text-secondary">지역이나 유형을 변경해 보세요.</span>
          </div>
        </div>
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

import { OfficialStatusService } from '@/api/generated/services/OfficialStatusService';
import { DefaultService } from '@/api/generated/services/DefaultService';

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
      label: '범죄 발생 건수 (공식+제보승인)',
      borderColor: '#42b983',
      backgroundColor: 'rgba(66, 185, 131, 0.2)',
      data: [] as number[],
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: { mode: 'index' as const, intersect: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
};

// --- 로직 ---

const loadInitialData = async () => {
  try {
    const [resRegions, resCrimes] = await Promise.all([
      DefaultService.getRegionsApiRegionsGet(),
      DefaultService.getCrimeTypesApiCrimeTypesGet()
    ]);
    regions.value = resRegions || [];
    crimeTypes.value = resCrimes || [];
  } catch (e) {
    console.error("초기 데이터 로드 실패:", e);
  }
};

const loadChartData = async () => {
  loading.value = true;
  try {
    const stats = await OfficialStatusService.getOfficialStatsApiStatusAllGet(
        filters.region_id ?? undefined,
        filters.crime_type_id ?? undefined,
        undefined
    );

    console.log("🔍 백엔드 원본 데이터:", stats);

    if (stats && stats.length > 0) {
      // 1. 연도별로 데이터 그룹화 (중복 연도 합산)
      const yearlyMap = new Map<number, number>();

      stats.forEach((s: any) => {
        const year = Number(s.year);
        const count = Number(s.count);
        const currentCount = yearlyMap.get(year) || 0;
        yearlyMap.set(year, currentCount + count);
      });

      // 2. 연도순 정렬 (2024 -> 2026)
      const sortedYears = Array.from(yearlyMap.keys()).sort((a, b) => a - b);

      console.log("✅ 정렬된 연도 리스트:", sortedYears);

      // 3. 차트 데이터에 바인딩
      chartData.labels = sortedYears.map(y => `${y}년`);
      chartData.datasets[0].data = sortedYears.map(y => yearlyMap.get(y) || 0);
    } else {
      chartData.labels = [];
      chartData.datasets[0].data = [];
    }
  } catch (e) {
    console.error("차트 로드 실패:", e);
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
.stats-container { max-width: 1200px; margin: 0 auto; }
.filter-card { border: none; border-radius: 12px; }
.chart-card { border: none; border-radius: 12px; }

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.no-data-wrapper {
  margin-top: 100px;
}
</style>