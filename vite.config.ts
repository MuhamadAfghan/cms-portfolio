import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      __JWT_SECRET__: JSON.stringify(env.JWT_SECRET ?? ''),
      __JWT_EXPIRES_IN__: JSON.stringify(env.JWT_EXPIRES_IN ?? '1h'),
    },
  }
})
