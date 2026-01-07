import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true, // 允许外部访问
    },
    // define: {
    //   // 注入环境变量到客户端代码
    //   'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    // }, 让 Vite 回归默认行为，不要搞复杂的注入。你试图在 vite.config.ts 里通过 define 来把环境变量注入进去，
    // 这在现代 Vite 开发中是不需要的，而且写得越复杂越容易出错。
    build: {
      // Cloudflare Pages 优化
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts', 'd3'],
            'ai-vendor': ['@google/genai'],
          },
        },
      },
    },
  }
})
