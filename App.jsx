import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import { useRegisterSW } from 'virtual:pwa-register/react'

function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: '14px',
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: '0 0 30px var(--accent-glow)', zIndex: 9999
    }}>
      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>✨ New update available!</span>
      <button onClick={() => updateServiceWorker(true)} style={{
        background: 'var(--accent-gradient)', border: 'none', borderRadius: '8px',
        color: '#fff', padding: '8px 16px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
        fontFamily: 'var(--font-body)'
      }}>Update Now</button>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style={{ animation: 'spin 2s linear infinite' }}>
          {[0,1,2,3,4,5].map(i => {
            const angle = (i * 60 - 90) * Math.PI / 180
            return <circle key={i} cx={32 + 22 * Math.cos(angle)} cy={32 + 22 * Math.sin(angle)} r="6" fill="url(#lg)" opacity={0.3 + i * 0.12}/>
          })}
          <defs><linearGradient id="lg"><stop offset="0%" stopColor="#00b7ff"/><stop offset="100%" stopColor="#0066ff"/></linearGradient></defs>
        </svg>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <UpdatePrompt />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
