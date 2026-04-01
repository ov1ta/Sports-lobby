import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { cacheNotes, getCachedNotes } from '../lib/db'
import { sendNotification, requestNotificationPermission } from '../lib/notifications'
import { decrypt } from '../lib/crypto'
import NoteCard from '../components/NoteCard'
import NoteModal from '../components/NoteModal'
import UploadModal from '../components/UploadModal'
import Navbar from '../components/Navbar'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'private-lobby-default-key'
const TAGS = ['All', 'Math', 'Science', 'History', 'Literature', 'Tech', 'Art', 'General', 'Other']

export default function Home() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    requestNotificationPermission()
    fetchNotes()
    loadRecent()

    // Offline/online detection
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Realtime subscription
    const channel = supabase.channel('notes-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, payload => {
        if (payload.new.user_id !== user?.id) {
          sendNotification('📬 New drop in Private Lobby', `Someone just posted a new note!`, 'new-note')
        }
        fetchNotes()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, payload => {
        fetchNotes()
      })
      .subscribe()

    // Keyboard shortcut ⌘K for search
    const handleKey = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  useEffect(() => {
    let result = notes
    if (activeTag !== 'All') result = result.filter(n => n.tag === activeTag)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.ai_summary?.toLowerCase().includes(q) ||
        n.tag?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [notes, search, activeTag])

  async function fetchNotes() {
    if (!navigator.onLine) {
      const cached = await getCachedNotes()
      const decrypted = await Promise.all(cached.map(async n => ({
        ...n,
        content: n.content ? await decrypt(n.content, ENCRYPTION_KEY) : null
      })))
      setNotes(decrypted.reverse())
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('notes')
      .select('*, profiles(username, avatar_url), likes(user_id)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      const processed = await Promise.all(data.map(async n => ({
        ...n,
        content: n.content ? await decrypt(n.content, ENCRYPTION_KEY) : null,
        user_likes: n.likes?.map(l => l.user_id) || [],
        like_count: n.likes?.length || 0
      })))
      setNotes(processed)
      cacheNotes(processed)
    }
    setLoading(false)
  }

  async function loadRecent() {
    const { getRecentlyViewed } = await import('../lib/db')
    const r = await getRecentlyViewed()
    setRecentlyViewed(r)
  }

  const pinned = filtered.filter(n => n.pinned)
  const regular = filtered.filter(n => !n.pinned)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onUpload={() => setShowUpload(true)} />

      {/* Offline banner */}
      {!online && (
        <div style={{ background: 'rgba(255,180,0,0.15)', borderBottom: '1px solid rgba(255,180,0,0.3)', padding: '8px 24px', textAlign: 'center', fontSize: '13px', color: '#ffb400' }}>
          📡 You're offline — showing cached content
        </div>
      )}

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Search + Filter bar */}
        <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            id="search-input"
            className="input"
            placeholder="🔍 Search notes, summaries, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '500px', padding: '12px 18px' }}
          />

          {/* Tag filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TAGS.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)} style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                borderColor: activeTag === tag ? 'var(--accent)' : 'var(--border)',
                background: activeTag === tag ? 'var(--accent-glow)' : 'transparent',
                color: activeTag === tag ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontWeight: '600', fontSize: '12px',
                cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px'
              }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && !search && activeTag === 'All' && (
          <div style={{ padding: '20px 24px 0' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>RECENTLY VIEWED</p>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {recentlyViewed.slice(0, 6).map(n => (
                <div key={n.id} onClick={() => setSelectedNote(n)} style={{
                  flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', transition: 'all 0.2s',
                  maxWidth: '180px'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.type} · {n.tag}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned section */}
        {pinned.length > 0 && (
          <div style={{ padding: '20px 24px 0' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>📌 PINNED</p>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="masonry-grid" style={{ padding: '20px 24px' }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="masonry-item">
                <div className="shimmer" style={{ height: `${140 + Math.random() * 120}px`, borderRadius: '16px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Masonry grid */}
        {!loading && (
          <div className="masonry-grid">
            {[...pinned, ...regular].map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={setSelectedNote}
                onLikeChange={fetchNotes}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
            <p style={{ fontSize: '16px' }}>Nothing here yet. Be the first to drop something!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedNote && <NoteModal note={selectedNote} onClose={() => { setSelectedNote(null); loadRecent() }} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchNotes} />}
    </div>
  )
}
