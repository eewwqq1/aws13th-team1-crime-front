import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'; // 1. 타입 임포트
import ReportsView from '@/views/ReportsView.vue';
import StatsView from '@/views/StatsView.vue';

// 2. routes 변수에 타입을 명시적으로 지정
const routes: RouteRecordRaw[] = [
    {
        path: '/reports',
        name: 'Reports',
        component: ReportsView // 혹은 () => import('@/views/ReportsView.vue')
    },
    {
        path: '/stats',
        name: 'Stats',
        component: StatsView
    },
    {
        path: '/',
        redirect: '/reports' // 리다이렉트는 component 없이 path와 redirect만 있어야 함
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;