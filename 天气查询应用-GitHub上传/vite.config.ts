import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 生产构建部署在 GitHub Pages 的项目子路径 /weather-query-app/ 下
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/weather-query-app/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
}))
