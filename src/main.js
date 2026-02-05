import './assets/main.css'
import { OpenAPI } from '@/api/generated/index.ts';

OpenAPI.BASE = 'http://127.0.0.1:8000'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
