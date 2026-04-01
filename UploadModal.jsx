import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { summarizeContent } from '../lib/ai'
import { encrypt } from '../lib/crypto'

const TAGS = ['Math', 'Science', 'History', 'Literature', 'Tech', 'Art', 'General', 'Other']
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'private-lobby-default-key'

export default function UploadModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [type, setType] = useState('note')
  const [form, setForm] = useState({ title: '', content: '', url: '', tag: 'General' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)

    try {
      let pdf_url = null

      // Upload PDF if present
      if (file && type === 'pdf') {
        setStatus('Uploading PDF...')
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage.from('pdfs').upload(path, file)
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(path)
          pdf_url = publicUrl
        }
      }

      // Encrypt content
      const contentToStore = form.content ? await encrypt(form.content, ENCRYPTION_KEY) : null

      // AI summarize
      setStatus('Generating AI summary...')
      const summaryInput = form.content || form.url || form.title
      const ai_summary = await summarizeContent(summaryInput, type)

      // Insert note
      setStatus('Saving...')
      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        type,
        title: form.title,
        content: contentToStore,
        url: form.url || null,
        pdf_url,
        tag: form.tag,
        ai_summary,
        pinned: false,
        view_count: 0,
        like_count: 0
      })

      if (error) throw error
      onSuccess()
      onClose()
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Drop Something 📬</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '22px' }}>×</button>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[{v:'note',l:'📝 Note'},{v:'pdf',l:'📄 PDF'},{v:'link',l:'🔗 Link'}].map(({v,l}) => (
            <button key={v} onClick={() => setType(v)} style={{
              flex: 1, padding: '10px', border: '1px solid', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s',
              background: type === v ? 'var(--accent-gradient)' : 'transparent',
              borderColor: type === v ? 'transparent' : 'var(--border)',
              color: type === v ? '#fff' : 'var(--text-secondary)'
            }}>{l}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input className="input" name="title" placeholder="Title *" value={form.title} onChange={handle} required />

          {type === 'note' && (
            <textarea className="input" name="content" placeholder="Write your note here... (will be encrypted)" value={form.content} onChange={handle} rows={6} style={{ resize: 'vertical' }} />
          )}

          {type === 'pdf' && (
            <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => document.getElementById('pdf-input').click()}>
              <input id="pdf-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              {file ? <p style={{ color: 'var(--accent)' }}>📄 {file.name}</p> : <p style={{ color: 'var(--text-muted)' }}>Click to upload PDF</p>}
            </div>
          )}

          {type === 'link' && (
            <>
              <input className="input" name="url" type="url" placeholder="https://..." value={form.url} onChange={handle} required />
              <textarea className="input" name="content" placeholder="Description (optional, helps AI summarize)" value={form.content} onChange={handle} rows={3} />
            </>
          )}

          {/* Tag */}
          <select className="input" name="tag" value={form.tag} onChange={handle}>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {status && <p style={{ fontSize: '13px', color: 'var(--accent)', textAlign: 'center' }}>⚡ {status}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            {loading ? '✦ Working...' : '✦ Post to Lobby'}
          </button>
        </form>
      </div>
    </div>
  )
}
