import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/sms_spam_detector/',
  plugins: [
    tailwindcss(),
    react()
  ]
})