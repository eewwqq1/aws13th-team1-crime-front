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
            {{ r.province }} {{ r.city || '' }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>🔪 범죄 유형</label>
        <select v-model="filters.crime_type_id" @change="loadChartData">
          <option :value="null">전체 유형</option>
          <option v-for="c in crimeTypes" :key="c.id" :value="c.id">
            {{ c.major }} {{ c.minor ? '> ' + c.minor : '' }}
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
        <div v-else class="no-data">
          <p>조회된 통계 데이터가 없습니다.</p>
          <span>지역이나 유형을 변경해 보세요.</span>
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

// ⚠️ 중요: OpenAPI 생성 파일 경로 확인
// @/api/generated/services/... 혹은 index에서 직접 가져오기
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
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
};

// --- 로직 ---

const loadInitialData = async () => {
  try {
    // OpenAPI: /api/regions, /api/crime-types
    const [resRegions, resCrimes] = await Promise.all([
      DefaultService.getRegionsApiRegionsGet(),
      DefaultService.getCrimeTypesApiCrimeTypesGet()
    ]);
    regions.value = resRegions || [];
    crimeTypes.value = resCrimes || [];
  } catch (e) {
    console.error("초기 필터 데이터 로드 실패:", e);
  }
};

const loadChartData = async () => {
  loading.value = true;
  try {
    // OpenAPI: /api/ (GET) - OfficialStatusService
    // 인자 순서: region_id, crime_type_id, year
    const stats = await OfficialStatusService.getOfficialStatsApiStatusAllGet(
        filters.region_id ?? undefined,
        filters.crime_type_id ?? undefined,
        undefined // year 필터는 일단 전체
    );

    if (stats && stats.length > 0) {
      // 연도순 정렬
      const sortedStats = [...stats].sort((a, b) => a.year - b.year);

      chartData.labels = sortedStats.map(s => `${s.year}년`);
      chartData.datasets[0].data = sortedStats.map(s => s.count); // count 컬럼 반영
    } else {
      chartData.labels = [];
      chartData.datasets[0].data = [];
    }
  } catch (e) {
    console.error("차트 데이터 로드 실패:", e);
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
.stats-container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
.stats-header { margin-bottom: 30px; text-align: center; }

.filter-card {
  display: flex; gap: 20px; background: white; padding: 25px;
  border-radius: 12px; margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.filter-group { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.filter-group label { font-size: 14px; font-weight: 700; color: #4a5568; }

select {
  padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;
  background-color: #f8fafc; font-size: 15px; outline: none;
}

.chart-card {
  background: white; border-radius: 12px; padding: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 500px;
  display: flex; flex-direction: column;
}

.chart-wrapper { flex: 1; height: 450px; }

.no-data {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: #a0aec0; gap: 10px; margin-top: 100px;
}

.loading-overlay {
  text-align: center; margin-top: 150px; font-weight: bold; color: #42b983;
}
</style>