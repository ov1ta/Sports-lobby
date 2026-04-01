import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({ likesReceived: 0, likesGiven: 0, noteViews: 0, pdfViews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchNotes()
    fetchStats()
  }, [id])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(data)
  }

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*, likes(user_id)')
      .eq('user_id', id).order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function fetchStats() {
    // Likes received
    const { data: myNotes } = await supabase.from('notes').select('id, view_count, type').eq('user_id', id)
    if (!myNotes) return
    const noteIds = myNotes.map(n => n.id)
    const { count: likesReceived } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('note_id', noteIds)
    const { count: likesGiven } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', id)

    const noteViews = myNotes.filter(n => n.type === 'note').reduce((a, n) => a + (n.view_count || 0), 0)
    const pdfViews = myNotes.filter(n => n.type === 'pdf').reduce((a, n) => a + (n.view_count || 0), 0)

    setStats({ likesReceived: likesReceived || 0, likesGiven: likesGiven || 0, noteViews, pdfViews })
  }

  const isOwn = user?.id === id

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onUpload={() => {}} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div className="shimmer" style={{ height: '200px', borderRadius: '20px' }} />
        ) : (
          <>
            {/* Profile header */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: '#fff',
                boxShadow: '0 0 30px var(--accent-glow)'
              }}>
                {profile?.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800' }}>@{profile?.username}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{profile?.email}</p>
                {isOwn && <span style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px', display: 'inline-block' }}>✦ Your profile</span>}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
              {[
                { label: 'Likes Received', value: stats.likesReceived, icon: '❤️' },
                { label: 'Likes Given', value: stats.likesGiven, icon: '🤍' },
                { label: 'Note Views', value: stats.noteViews, icon: '📝' },
                { label: 'PDF Views', value: stats.pdfViews, icon: '📄' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
                  <p style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Notes */}
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '16px' }}>
              POSTS ({notes.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notes.map(note => (
                <div key={note.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '20px' }}>{note.type === 'note' ? '📝' : note.type === 'pdf' ? '📄' : '🔗'}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '700', fontSize: '15px' }}>{note.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{note.tag}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>❤️ {note.likes?.length || 0}</span>
                    <span>👁 {note.view_count || 0}</span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No posts yet.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
