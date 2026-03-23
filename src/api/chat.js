import { client } from './client'

/**
 * Stream a chat response from the Aria outfit assistant.
 *
 * @param {Array<{role: string, content: string}>} messages  conversation history
 * @param {string} outfitContext  stringified outfit snapshot
 * @param {function} onToken     called with each streamed text token
 * @param {function} onDone      called when streaming completes
 * @param {function} onError     called with error message if something goes wrong
 * @returns {AbortController}    call .abort() to cancel mid-stream
 */
export function streamOutfitChat({ messages, outfitContext = '', onToken, onDone, onError }) {
  const controller = new AbortController()

  // Build the Authorization header the same way axios client does
  const token = localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token') ?? ''
  const baseURL = client.defaults.baseURL ?? ''

  fetch(`${baseURL}/chat/outfit-assistant`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, outfit_context: outfitContext }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        onError?.(err.detail ?? 'Assistant unavailable.')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          for (const line of text.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') { onDone?.(); return }
            try {
              const parsed = JSON.parse(payload)
              if (parsed.error) { onError?.(parsed.error); return }
              if (parsed.content) onToken?.(parsed.content)
            } catch { /* partial chunk — ignore */ }
          }
        }
        onDone?.()
      }

      pump().catch((err) => {
        if (err.name !== 'AbortError') onError?.(err.message)
      })
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError?.(err.message ?? 'Network error.')
    })

  return controller
}
