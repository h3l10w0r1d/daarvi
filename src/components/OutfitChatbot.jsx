import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, RefreshCw, Wand2 } from 'lucide-react'
import { callOutfitAssistant } from '../api/chat'

const EASE = [0.76, 0, 0.24, 1]

const GREETING = `Hi! I'm Aria. Tell me what you need — an occasion, a budget, a vibe — and I'll build the look for you instantly.`

const QUICK_PROMPTS = [
  'Corporate party, budget $200',
  'Casual weekend look',
  'Evening dinner, no limit',
  'Swap the bottom for something else',
]

/**
 * Aria — AI outfit assistant for the Look Picker page.
 *
 * Props:
 *   outfitContext {string}   — stringified snapshot of current outfit on screen
 *   scope         {string}   — 'local' | 'global'
 *   onAction      {function} — called with action objects to update the UI
 */
export default function OutfitChatbot({ outfitContext, scope, onAction }) {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([
    { role: 'assistant', content: GREETING },
  ])
  const [input, setInput]         = useState('')
  const [thinking, setThinking]   = useState(false)
  const [lastAction, setLastAction] = useState(null)  // for the "action applied" flash
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350)
  }, [open])

  const send = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return
    setInput('')

    // Add user message immediately
    const userMsg = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    try {
      // history = everything except the greeting (which is UI-only)
      const history = [...messages.filter((_, i) => i > 0), userMsg]

      const { message, actions } = await callOutfitAssistant({
        messages: history,
        outfitContext,
        scope,
      })

      // Apply actions to the UI first, then show Aria's message
      if (actions?.length > 0) {
        for (const action of actions) {
          onAction?.(action)
          setLastAction(action.type)
          setTimeout(() => setLastAction(null), 3000)
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: message }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm sorry — something went wrong. (${err?.response?.data?.detail ?? err.message ?? 'Unknown error'})`,
        error: true,
      }])
    } finally {
      setThinking(false)
    }
  }, [messages, thinking, outfitContext, scope, onAction])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const handleReset = () => {
    setThinking(false)
    setMessages([{ role: 'assistant', content: GREETING }])
    setInput('')
    setLastAction(null)
  }

  return (
    <>
      {/* ── Floating "ASK ARIA" button ─────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={() => setOpen(true)}
            className="fixed bottom-8 right-6 z-30 flex items-center gap-2.5 px-4 py-3 shadow-2xl"
            style={{ background: '#cca350', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <MessageCircle size={14} color="#000" />
            <span className="text-[11px] tracking-[0.2em] font-sans text-black font-medium">
              ASK ARIA
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Action flash notification ──────────────────────────────────────── */}
      <AnimatePresence>
        {lastAction && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 right-6 z-30 px-4 py-2 text-[10px] tracking-[0.18em] font-sans"
            style={{ background: 'rgba(204,163,80,0.9)', color: '#000' }}>
            {lastAction === 'DISPLAY_OUTFIT' ? '✦ Look updated' : '✦ Item swapped'}
          </motion.div>
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
              onClick={() => setOpen(false)}
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
                height: 'min(580px, calc(100vh - 8rem))',
                background: 'rgba(6,6,6,0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(204,163,80,0.2)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: '#cca350' }}>
                    <span className="text-[12px] font-serif text-black font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-[12px] tracking-[0.18em] font-sans text-cream">ARIA</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${thinking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                      <p className="text-[9px] tracking-widest font-sans text-gray/50">
                        {thinking ? 'THINKING…' : 'AI STYLIST · ACTIVE'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleReset} title="New conversation"
                    className="w-8 h-8 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
                    <RefreshCw size={12} />
                  </button>
                  <button onClick={() => setOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-gray/40 hover:text-cream transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Action flash inside panel ── */}
              <AnimatePresence>
                {lastAction && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex items-center gap-2 px-5 py-2.5 flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(204,163,80,0.1)', borderBottom: '1px solid rgba(204,163,80,0.15)' }}>
                    <Wand2 size={11} className="text-gold flex-shrink-0" />
                    <p className="text-[10px] tracking-[0.15em] font-sans text-gold">
                      {lastAction === 'DISPLAY_OUTFIT'
                        ? 'New look loaded on screen ↑'
                        : 'Item swapped on screen ↑'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}

                {/* Thinking animation */}
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5">
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: '#cca350' }}>
                      <span className="text-[9px] font-serif text-black font-bold">A</span>
                    </div>
                    <div className="px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 12px 12px 2px' }}>
                      <div className="flex gap-1.5 items-center">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-bounce"
                            style={{ animationDelay: `${i * 160}ms` }} />
                        ))}
                        <span className="text-[10px] text-gray/40 font-sans ml-1">thinking</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Quick prompts (shown only before first user message) ── */}
              {messages.length === 1 && (
                <div className="px-5 pb-3 flex flex-col gap-1.5 flex-shrink-0">
                  <p className="text-[9px] tracking-[0.25em] text-gray/30 font-sans mb-1">TRY ASKING</p>
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => send(p)} disabled={thinking}
                      className="text-left text-[11px] font-sans text-gray/50 hover:text-cream px-3 py-2 border border-white/[0.06] hover:border-white/20 transition-all duration-200">
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input bar ── */}
              <div className="flex-shrink-0 border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Occasion, style, budget…"
                    disabled={thinking}
                    rows={1}
                    className="flex-1 bg-transparent border border-white/[0.08] px-3 py-2.5 text-[13px] text-cream font-body focus:outline-none focus:border-gold/40 transition-colors placeholder-white/20 resize-none disabled:opacity-50"
                    style={{ minHeight: '40px', maxHeight: '100px' }}
                    onInput={e => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                    }}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || thinking}
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: input.trim() && !thinking ? '#cca350' : 'rgba(255,255,255,0.05)',
                    }}>
                    {thinking
                      ? <RefreshCw size={13} className="animate-spin text-gold" />
                      : <Send size={13} color={input.trim() ? '#000' : '#555'} />}
                  </button>
                </div>
                <p className="text-[9px] tracking-widest text-gray/20 font-sans mt-2 text-center">
                  ENTER to send · Aria speaks your language
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
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}
    >
      {!isUser && (
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: '#cca350' }}>
          <span className="text-[9px] font-serif text-black font-bold">A</span>
        </div>
      )}
      <div className="max-w-[85%]">
        <div className="px-4 py-2.5 text-[13px] font-body leading-relaxed"
          style={{
            background: isUser ? 'rgba(204,163,80,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isUser ? 'rgba(204,163,80,0.2)' : msg.error ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.06)'}`,
            color: isUser ? '#f4ecdc' : msg.error ? '#f87171' : '#c8c8c0',
            borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          }}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  )
}
