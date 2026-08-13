import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/assets/styles/index.css'
import App from '@/App.jsx'
import { AuthProvider } from '@/hooks/useAuth'

// Điểm khởi chạy (Entry point) của ứng dụng React, render component chính là App
// AuthProvider bọc bên ngoài App để cung cấp thông tin xác thực (user, session) cho toàn bộ ứng dụng
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
