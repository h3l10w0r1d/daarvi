import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, RefreshCw } from 'lucide-react'
import { streamOutfitChat } from '../api/chat'

const EASE = [0.76, 0, 0.24, 1]

const GREETING = `Hi! I'm Aria, your personal stylist. Tell me about the occasion, your style, or what you're looking for — I'll help you build the perfect look.`

/**
 * Floating AI stylist chatbot for the Look Picker page.
 *
 * Props:
 *   outfitContext  {string}  — stringified outfit snapshot (items, prices, selected state)
 */
export default function OutfitChatbot({ outfitContext }) {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([
    { role: 'assistant', content: GREETING },
  ])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const abortRef                  = useRef(null)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350)
  }, [open])

  const handleSend = () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const pendingMsg = { role: 'assistant', content: '', pending: true }

    setMessages(prev => [...prev, userMsg, pendingMsg])
    setStreaming(true)

    // Only send actual conversation (not the greeting) to the API
    const history = [...messages.filter(m => !m.pending), userMsg]

    abortRef.current = streamOutfitChat({
      messages: history,
      outfitContext,
      onToken: (token) => {
        setMessages(prev => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last?.pending) {
            copy[copy.length - 1] = { ...last, content: last.content + token }
          }
          return copy
        })
      },
      onDone: () => {
        setMessages(prev => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last?.pending) copy[copy.length - 1] = { ...last, pending: false }
          return copy
        })
        setStreaming(false)
      },
      onError: (err) => {
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: `I'm sorry, I couldn't respond right now. (${err})`,
            pending: false,
            error: true,
          }
          return copy
        })
        setStreaming(false)
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    setOpen(false)
  }

  const handleReset = () => {
    abortRef.current?.abort()
    setStreaming(false)
    setMessages([{ role: 'assistant', content: GREETING }])
    setInput('')
  }

  return (
    <>
      {/* ── Floating button ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={() => setOpen(true)}
            className="fixed bottom-8 right-6 z-30 flex items-center gap-2.5 px-4 py-3 shadow-2xl group"
            style={{ background: '#cca350', border: '1px solid rgba(255,255,255,0.1)' }}
            title="Chat with Aria, your AI stylist"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <MessageCircle size={15} color="#000" />
            </div>
            <span className="text-[11px] tracking-[0.2em] font-sans text-black font-medium">
              ASK ARIA
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={handleClose}
            />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed z-40 flex flex-col"
              style={{
                bottom: '1.5rem',
                right: '1.5rem',
                width: 'min(420px, calc(100vw - 3rem))',
                height: 'min(560px, calc(100vh - 10rem))',
                background: 'rgba(6,6,6,0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(204,163,80,0.2)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Aria avatar */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: '#cca350' }}>
                    <span className="text-[12px] font-serif text-black font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-[12px] tracking-[0.18em] font-sans text-cream">ARIA</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[9px] tracking-widest font-sans text-gray/50">AI STYLIST</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleReset} title="New conversation"
                    className="w-7 h-7 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
                    <RefreshCw size={12} />
                  </button>
                  <button onClick={handleClose}
                    className="w-7 h-7 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* ── Input bar ── */}
              <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about occasion, style, budget…"
                    disabled={streaming}
                    rows={1}
                    className="flex-1 bg-transparent border border-white/[0.08] px-3 py-2.5 text-[13px] text-cream font-body focus:outline-none focus:border-gold/40 transition-colors placeholder-white/20 resize-none"
                    style={{ minHeight: '40px', maxHeight: '100px' }}
                    onInput={e => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || streaming}
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: input.trim() && !streaming ? '#cca350' : 'rgba(255,255,255,0.05)',
                    }}>
                    {streaming
                      ? <RefreshCw size={13} className="animate-spin text-gold" />
                      : <Send size={13} color={input.trim() ? '#000' : '#666'} />}
                  </button>
                </div>
                <p className="text-[9px] tracking-widest text-gray/25 font-sans mt-2 text-center">
                  ENTER to send · SHIFT+ENTER for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}
    >
      {/* Aria avatar — only on assistant messages */}
      {!isUser && (
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: '#cca350' }}>
          <span className="text-[9px] font-serif text-black font-bold">A</span>
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'order-first' : ''}`}>
        <div
          className="px-4 py-2.5 text-[13px] font-body leading-relaxed"
          style={{
            background: isUser ? 'rgba(204,163,80,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isUser ? 'rgba(204,163,80,0.2)' : 'rgba(255,255,255,0.06)'}`,
            color: isUser ? '#f4ecdc' : '#c8c8c0',
            borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          }}
        >
          {msg.content}
          {/* Typing cursor while streaming */}
          {msg.pending && msg.content.length > 0 && (
            <span className="inline-block w-0.5 h-3.5 bg-gold/60 ml-0.5 animate-pulse align-middle" />
          )}
          {/* Typing dots when streaming but no content yet */}
          {msg.pending && msg.content.length === 0 && (
            <span className="inline-flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1 h-1 rounded-full bg-gold/50 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
