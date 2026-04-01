import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { addRecentlyViewed } from '../lib/db'
import { estimateReadingTime } from '../lib/ai'

const TYPE_COLORS = {
  note: '#00b7ff',
  pdf: '#7c3aed',
  link: '#00cc88'
}

const TYPE_ICONS = {
  note: '📝',
  pdf: '📄',
  link: '🔗'
}

export default function NoteCard({ note, onOpen, onLikeChange }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(note.user_likes?.includes(user?.id))
  const [likeCount, setLikeCount] = useState(note.like_count || 0)
  const [liking, setLiking] = useState(false)

  async function toggleLike(e) {
    e.stopPropagation()
    if (liking || !user) return
    setLiking(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)

    if (newLiked) {
      await supabase.from('likes').insert({ note_id: note.id, user_id: user.id })
    } else {
      await supabase.from('likes').delete().eq('note_id', note.id).eq('user_id', user.id)
    }
    onLikeChange?.()
    setLiking(false)
  }

  function handleOpen() {
    addRecentlyViewed(note)
    supabase.from('notes').update({ view_count: (note.view_count || 0) + 1 }).eq('id', note.id)
    onOpen(note)
  }

  const accentColor = TYPE_COLORS[note.type] || '#00b7ff'
  const readTime = note.content ? estimateReadingTime(note.content) : null

  return (
    <div className="masonry-item">
      <div className="card" onClick={handleOpen} style={{ borderTop: `3px solid ${accentColor}` }}>
        {note.pinned && <span className="pinned-badge">📌 PINNED</span>}
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>{TYPE_ICONS[note.type]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', lineHeight: 1.3, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {note.title}
            </h3>
            {note.tag && <span className="tag" style={{ marginTop: '6px', display: 'inline-block' }}>{note.tag}</span>}
          </div>
        </div>

        {/* AI Summary or content preview */}
        {note.ai_summary && (
          <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(0,183,255,0.15)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.5px' }}>✦ AI SUMMARY</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{note.ai_summary}</p>
          </div>
        )}

        {!note.ai_summary && note.content && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', marginBottom: '12px' }}>
            {note.content}
          </p>
        )}

        {note.url && (
          <a href={note.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '12px' }}>
            🔗 {note.url}
          </a>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="avatar" style={{ width: '26px', height: '26px', fontSize: '11px' }}>
              {note.profiles?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{note.profiles?.username}</span>
            {readTime && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {readTime}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👁 {note.view_count || 0}</span>
            <button onClick={toggleLike} style={{
              display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none',
              cursor: 'pointer', color: liked ? '#ff4488' : 'var(--text-muted)', fontSize: '13px',
              fontFamily: 'var(--font-body)', fontWeight: '600', transition: 'all 0.2s',
              transform: liking ? 'scale(1.3)' : 'scale(1)'
            }}>
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
