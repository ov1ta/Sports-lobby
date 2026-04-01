import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', username: '', inviteCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await signIn(form.email, form.password)
      else await signUp(form.email, form.password, form.username, form.inviteCode)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,183,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              {[0,1,2,3,4,5].map(i => {
                const angle = (i * 60 - 90) * Math.PI / 180
                const x = 32 + 22 * Math.cos(angle)
                const y = 32 + 22 * Math.sin(angle)
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="8" fill="url(#grad)" opacity="0.9"/>
                    <circle cx={x} cy={y - 3} r="3.5" fill="url(#grad)" opacity="0.7"/>
                  </g>
                )
              })}
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00b7ff"/>
                  <stop offset="100%" stopColor="#0066ff"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <span className="glow-text">Private Lobby</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Your crew's knowledge space
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
                background: mode === m ? 'var(--accent-gradient)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)'
              }}>
                {m === 'login' ? 'Sign In' : 'Join'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <>
                <input className="input" name="username" placeholder="Username" value={form.username} onChange={handle} required />
                <input className="input" name="inviteCode" placeholder="Invite Code" value={form.inviteCode} onChange={handle} required style={{ letterSpacing: '2px', textTransform: 'uppercase' }} />
              </>
            )}
            <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required />
            <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
            
            {error && <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
            
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '13px' }}>
              {loading ? 'Loading...' : mode === 'login' ? 'Enter the Lobby' : 'Join the Lobby'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
