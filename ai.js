// Claude API integration for summarization
export async function summarizeContent(content, type = 'note') {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  
  const prompts = {
    note: `Summarize this note in 2-3 punchy sentences. Be concise and highlight the key insight:\n\n${content}`,
    pdf: `This is text extracted from a PDF. Summarize it in 3-4 sentences covering the main points:\n\n${content}`,
    link: `Summarize what this URL/link is about based on its description: ${content}`
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompts[type] || prompts.note }]
      })
    })
    const data = await response.json()
    return data.content?.[0]?.text || null
  } catch (err) {
    console.error('AI summarization failed:', err)
    return null
  }
}

export function estimateReadingTime(text) {
  const words = text?.trim().split(/\s+/).length || 0
  const minutes = Math.ceil(words / 200)
  return minutes < 1 ? '< 1 min read' : `${minutes} min read`
}
