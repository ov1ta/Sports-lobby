import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ onUpload }) {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme, font, setFont, availableFonts } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
          {[0,1,2,3,4,5].map(i => {
            const angle = (i * 60 - 90) * Math.PI / 180
            const x = 32 + 22 * Math.cos(angle)
            const y = 32 + 22 * Math.sin(angle)
            return <circle key={i} cx={x} cy={y} r="7" fill="url(#ng)"/>
          })}
          <defs><linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00b7ff"/><stop offset="100%" stopColor="#0066ff"/></linearGradient></defs>
        </svg>
        <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }} className="glow-text">Private Lobby</span>
      </Link>

      {/* Center search hint */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px', maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={() => document.getElementById('search-input')?.focus()} style={{
          width: '100%', padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '20px', color: 'var(--text-muted)', cursor: 'text', textAlign: 'left', fontSize: '13px',
          fontFamily: 'var(--font-body)'
        }}>
          🔍 Search notes... (⌘K)
        </button>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onUpload} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          + Post
        </button>

        {/* Settings */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSettings(s => !s)} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '8px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px'
          }}>⚙️</button>

          {showSettings && (
            <div style={{
              position: 'absolute', right: 0, top: '44px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '14px', padding: '16px',
              width: '220px', boxShadow: 'var(--shadow)', zIndex: 200
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>APPEARANCE</p>
              
              <button onClick={toggleTheme} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px', fontSize: '13px' }}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>

              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', margin: '12px 0 8px' }}>FONT</p>
              <select value={font} onChange={e => setFont(e.target.value)} className="input" style={{ fontSize: '13px', padding: '8px 12px' }}>
                {availableFonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px' }}>
                <button onClick={() => { navigate(`/profile/${profile?.id}`); setShowSettings(false) }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '13px', marginBottom: '6px' }}>
                  👤 My Profile
                </button>
                <button onClick={signOut} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px 0', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link to={`/profile/${profile?.id}`} style={{ textDecoration: 'none' }}>
          <div className="avatar" style={{ position: 'relative', cursor: 'pointer' }}>
            {profile?.username?.[0]?.toUpperCase() || '?'}
          </div>
        </Link>
      </div>
    </nav>
  )
}
