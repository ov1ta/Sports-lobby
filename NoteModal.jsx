import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function NoteModal({ note, onClose }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchComments()
    const ch = supabase.channel(`comments-${note.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `note_id=eq.${note.id}` }, fetchComments)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [note.id])

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*, profiles(username)').eq('note_id', note.id).order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function sendComment(e) {
    e.preventDefault()
    if (!newComment.trim() || sending) return
    setSending(true)
    await supabase.from('comments').insert({ note_id: note.id, user_id: user.id, content: newComment.trim() })
    setNewComment('')
    setSending(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{note.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>by @{note.profiles?.username}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
        </div>

        {note.tag && <span className="tag" style={{ marginBottom: '16px', display: 'inline-block' }}>{note.tag}</span>}

        {note.ai_summary && (
          <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(0,183,255,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', marginBottom: '6px', letterSpacing: '1px' }}>✦ AI SUMMARY</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{note.ai_summary}</p>
          </div>
        )}

        {note.content && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginBottom: '20px', lineHeight: 1.7, fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
            {note.content}
          </div>
        )}

        {note.url && (
          <a href={note.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            🔗 Open Link
          </a>
        )}

        {note.pdf_url && (
          <a href={note.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            📄 View PDF
          </a>
        )}

        {/* Comments */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Comments ({comments.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '12px', flexShrink: 0 }}>
                  {c.profiles?.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>@{c.profiles?.username}</span>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.5 }}>{c.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No comments yet. Be first!</p>}
          </div>

          <form onSubmit={sendComment} style={{ display: 'flex', gap: '10px' }}>
            <input className="input" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary" disabled={sending}>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
