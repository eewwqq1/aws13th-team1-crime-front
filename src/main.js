import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from '@/routers' // 라우터 경로 (index.ts 생략 가능)
import { OpenAPI } from '@/api/generated'

// 1. OpenAPI 설정 (앱 생성 전이나 후에 한 번만)
OpenAPI.BASE = 'http://localhost:8000'
OpenAPI.WITH_CREDENTIALS = true // 세션 쿠키 전달을 위해 필수!

// 2. 앱 생성
const app = createApp(App)

// 3. 플러그인 연결 (라우터 등)
app.use(router)

// 4. 마운트 (이 작업은 가장 마지막에 딱 한 번만!)
app.mount('#app')
