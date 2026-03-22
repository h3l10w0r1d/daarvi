import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Settings, MapPin, CreditCard, Link2, Monitor,
  Eye, EyeOff, Check, X, Plus, Trash2, Edit2, ChevronRight,
  Smartphone, Globe, LogOut,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { authApi } from '../api/auth'
import { usersApi } from '../api/users'
import { useToast } from '../components/Toast'

const EASE = [0.76, 0, 0.24, 1]

const SECTIONS = [
  { id: 'security',    icon: Shield,      label: 'Security' },
  { id: 'preferences', icon: Settings,    label: 'Preferences' },
  { id: 'addresses',  icon: MapPin,       label: 'Addresses' },
  { id: 'payment',    icon: CreditCard,   label: 'Payment Methods' },
  { id: 'social',     icon: Link2,        label: 'Connected Accounts' },
  { id: 'sessions',   icon: Monitor,      label: 'Active Sessions' },
]


// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-2xl text-cream">{title}</h2>
      {subtitle && <p className="text-xs text-gray/60 font-body mt-1 leading-relaxed">{subtitle}</p>}
      <div className="mt-4 h-px bg-white/8" />
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, suffix, disabled }) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div className="group">
      <label className="block text-[9px] tracking-[0.3em] text-gray/60 font-sans mb-1.5 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPass && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/15 disabled:opacity-40 pr-10"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray/40 hover:text-gray transition-colors">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        {suffix && !isPass && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray/40 font-sans">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled, type = 'button', className = '' }) {
  const base = 'text-[10px] tracking-[0.25em] font-sans px-6 py-3 flex items-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gold text-black hover:bg-cream',
    ghost:   'border border-white/15 text-gray hover:text-cream hover:border-white/40',
    danger:  'border border-red/30 text-red hover:bg-red hover:text-cream',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-white/8 my-6" />
}

// ─── 1. Security ──────────────────────────────────────────────────────────────

// Password rules (same as LoginModal)
const PW_RULES = [
  { id: 'len',    label: 'At least 8 characters',  test: v => v.length >= 8 },
  { id: 'letter', label: 'Contains a letter',       test: v => /[a-zA-Z]/.test(v) },
  { id: 'digit',  label: 'Contains a number',       test: v => /\d/.test(v) },
]

function SecuritySection() {
  const toast = useToast()
  const { user, setUser } = useApp()

  // Password change
  const [pw, setPw]           = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  // Email change
  const [emailForm, setEmailForm] = useState({ next: '', confirm: '', password: '' })
  const [emailLoading, setEmailLoading] = useState(false)

  const [twofa, setTwofa]     = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const [tfaCode, setTfaCode] = useState('')

  const pwValid = PW_RULES.every(r => r.test(pw.next))

  const submitPw = async e => {
    e.preventDefault()
    if (pw.next !== pw.confirm)  { toast('Passwords do not match', 'error'); return }
    if (!pwValid)                { toast('New password does not meet requirements', 'error'); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(pw.current, pw.next)
      toast('Password updated successfully')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update password', 'error')
    } finally {
      setPwLoading(false)
    }
  }

  const submitEmail = async e => {
    e.preventDefault()
    if (emailForm.next !== emailForm.confirm) { toast('Emails do not match', 'error'); return }
    if (!emailForm.next)                      { toast('Please enter a new email', 'error'); return }
    if (!emailForm.password)                  { toast('Please enter your password to confirm', 'error'); return }
    setEmailLoading(true)
    try {
      const updatedUser = await authApi.changeEmail(emailForm.next, emailForm.password)
      // Update stored user with new email
      setUser(updatedUser)
      localStorage.setItem('daarvi_user', JSON.stringify(updatedUser))
      toast('Email address updated')
      setEmailForm({ next: '', confirm: '', password: '' })
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update email', 'error')
    } finally {
      setEmailLoading(false)
    }
  }

  const toggle2FA = () => {
    if (!twofa) { setQrVisible(true) }
    else { setTwofa(false); setQrVisible(false); toast('Two-Factor Authentication disabled') }
  }

  const confirm2FA = () => {
    if (tfaCode.length < 6) { toast('Please enter the 6-digit code', 'error'); return }
    setTwofa(true); setQrVisible(false); setTfaCode('')
    toast('Two-Factor Authentication enabled')
  }

  return (
    <div>
      <SectionHeader title="Security" subtitle="Manage your password, email, and two-factor authentication." />

      {/* Password */}
      <p className="text-[9px] tracking-[0.35em] text-gold/80 font-sans mb-4">CHANGE PASSWORD</p>
      <form onSubmit={submitPw} className="space-y-3 max-w-md">
        <Field label="CURRENT PASSWORD" type="password" value={pw.current} onChange={v => setPw(p => ({ ...p, current: v }))} />
        <Field label="NEW PASSWORD" type="password" value={pw.next} onChange={v => setPw(p => ({ ...p, next: v }))} />

        {/* Live password rule checklist */}
        {pw.next.length > 0 && (
          <div className="flex flex-col gap-1.5 pl-1">
            {PW_RULES.map(rule => {
              const ok = rule.test(pw.next)
              return (
                <div key={rule.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${ok ? 'text-gold' : 'text-gray/30'}`}>
                    {ok ? <Check size={10} strokeWidth={3} /> : <span className="w-1 h-1 rounded-full bg-current block" />}
                  </div>
                  <span className={`text-[10px] font-sans transition-colors duration-200 ${ok ? 'text-gold/80' : 'text-gray/40'}`}>{rule.label}</span>
                </div>
              )
            })}
          </div>
        )}

        <Field label="CONFIRM NEW PASSWORD" type="password" value={pw.confirm} onChange={v => setPw(p => ({ ...p, confirm: v }))} />
        <div className="pt-1">
          <Btn type="submit" disabled={pwLoading || !pw.current || !pw.next || !pw.confirm}>
            <Check size={12} /> {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </Btn>
        </div>
      </form>

      <Divider />

      {/* Email */}
      <p className="text-[9px] tracking-[0.35em] text-gold/80 font-sans mb-1">EMAIL ADDRESS</p>
      <p className="text-xs text-gray/50 font-sans mb-4">
        Current: <span className="text-cream/70">{user?.email || '—'}</span>
      </p>
      <form onSubmit={submitEmail} className="space-y-3 max-w-md">
        <Field label="NEW EMAIL" type="email" value={emailForm.next} onChange={v => setEmailForm(e => ({ ...e, next: v }))} />
        <Field label="CONFIRM NEW EMAIL" type="email" value={emailForm.confirm} onChange={v => setEmailForm(e => ({ ...e, confirm: v }))} />
        <Field label="CONFIRM WITH YOUR PASSWORD" type="password" value={emailForm.password} onChange={v => setEmailForm(e => ({ ...e, password: v }))} />
        <Btn type="submit" disabled={emailLoading || !emailForm.next || !emailForm.confirm || !emailForm.password}>
          <Check size={12} /> {emailLoading ? 'UPDATING...' : 'UPDATE EMAIL'}
        </Btn>
      </form>

      <Divider />

      {/* 2FA */}
      <div className="flex items-start justify-between max-w-md">
        <div>
          <p className="text-[9px] tracking-[0.35em] text-gold/80 font-sans mb-1">TWO-FACTOR AUTHENTICATION</p>
          <p className="text-xs text-gray/50 font-body leading-relaxed">
            {twofa ? 'Enabled — your account has an extra layer of security.' : 'Add an extra layer of protection to your account.'}
          </p>
        </div>
        <button onClick={toggle2FA}
          className={`ml-6 mt-1 flex-shrink-0 w-11 h-6 relative transition-colors duration-300 ${twofa ? 'bg-gold' : 'bg-white/10'}`}>
          <motion.div className="absolute top-1 w-4 h-4 bg-black"
            animate={{ left: twofa ? '24px' : '4px' }}
            transition={{ duration: 0.25, ease: EASE }} />
        </button>
      </div>

      <AnimatePresence>
        {qrVisible && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
            animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
            exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-6 max-w-md border border-white/10 p-6"
          >
            <p className="text-[9px] tracking-[0.3em] text-gray/60 font-sans mb-4">SCAN QR CODE WITH YOUR AUTHENTICATOR APP</p>
            {/* Mock QR */}
            <div className="w-36 h-36 bg-white p-2 mb-4">
              <div className="w-full h-full grid grid-cols-7 gap-px">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <p className="text-[9px] tracking-widest text-gray/50 font-sans mb-4">OR ENTER CODE MANUALLY: <span className="text-cream/70">DRVX-4829-KKQP-9012</span></p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Field label="ENTER 6-DIGIT CODE" value={tfaCode}
                  onChange={v => setTfaCode(v.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" />
              </div>
              <Btn onClick={confirm2FA}><Check size={12} /> VERIFY</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ─── 2. Preferences ───────────────────────────────────────────────────────────

const CURRENCIES = ['USD — US Dollar', 'EUR — Euro', 'GBP — British Pound', 'JPY — Japanese Yen', 'AED — UAE Dirham', 'CHF — Swiss Franc']
const LANGUAGES  = ['English', 'French', 'German', 'Spanish', 'Italian', 'Japanese', 'Arabic']
const THEMES     = ['Dark (Default)', 'Light', 'System']

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="group">
      <label className="block text-[9px] tracking-[0.3em] text-gray/60 font-sans mb-1.5 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray/40 rotate-90 pointer-events-none" />
      </div>
    </div>
  )
}

function PreferencesSection() {
  const toast = useToast()
  const [currency, setCurrency] = useState('USD — US Dollar')
  const [language, setLanguage] = useState('English')
  const [theme, setTheme] = useState('Dark (Default)')

  const save = () => toast('Preferences saved')

  return (
    <div>
      <SectionHeader title="Preferences" subtitle="Customize how Daarvi appears and behaves for you." />
      <div className="max-w-md space-y-4">
        <SelectField label="CURRENCY" value={currency} onChange={setCurrency} options={CURRENCIES} />
        <SelectField label="LANGUAGE" value={language} onChange={setLanguage} options={LANGUAGES} />
        <SelectField label="THEME" value={theme} onChange={setTheme} options={THEMES} />

        {/* Live preview strip */}
        <div className="border border-white/8 p-4 mt-2">
          <p className="text-[9px] tracking-[0.3em] text-gray/40 font-sans mb-2">PREVIEW</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-cream/70 font-sans">Obsidian Overcoat</span>
            <span className="text-sm text-gold font-sans">
              {currency.startsWith('EUR') ? '€' : currency.startsWith('GBP') ? '£' : currency.startsWith('JPY') ? '¥' : '$'}
              {currency.startsWith('JPY') ? '61,200' : '420'}
            </span>
          </div>
        </div>

        <Btn onClick={save}><Check size={12} /> SAVE PREFERENCES</Btn>
      </div>
    </div>
  )
}

// ─── 3. Addresses ─────────────────────────────────────────────────────────────

const BLANK_ADDR = { id: null, name: '', line1: '', line2: '', city: '', country: '', zip: '', isDefault: false }

function AddressesSection() {
  const toast = useToast()
  const [addresses, setAddresses] = useState([
    { id: 1, name: 'Home', line1: '12 Rue de Rivoli', line2: '', city: 'Paris', country: 'France', zip: '75001', isDefault: true },
    { id: 2, name: 'Office', line1: '221B Baker Street', line2: 'Floor 3', city: 'London', country: 'UK', zip: 'NW1 6XE', isDefault: false },
  ])
  const [editing, setEditing] = useState(null) // null | address object
  const [form, setForm] = useState(BLANK_ADDR)

  const openNew = () => { setForm({ ...BLANK_ADDR, id: Date.now() }); setEditing('new') }
  const openEdit = addr => { setForm(addr); setEditing(addr.id) }
  const cancel = () => { setEditing(null); setForm(BLANK_ADDR) }

  const save = () => {
    if (!form.name || !form.line1 || !form.city) { toast('Please fill required fields', 'error'); return }
    setAddresses(prev => {
      let list = editing === 'new'
        ? [...prev, form]
        : prev.map(a => a.id === editing ? form : a)
      if (form.isDefault) list = list.map(a => ({ ...a, isDefault: a.id === form.id }))
      return list
    })
    cancel()
    toast(editing === 'new' ? 'Address added' : 'Address updated')
  }

  const del = id => { setAddresses(p => p.filter(a => a.id !== id)); toast('Address removed') }
  const setDef = id => {
    setAddresses(p => p.map(a => ({ ...a, isDefault: a.id === id })))
    toast('Default address updated')
  }
  const upd = (field, val) => setForm(f => ({ ...f, [field]: val }))

  return (
    <div>
      <SectionHeader title="Addresses" subtitle="Manage your delivery addresses. Set one as default for faster checkout." />

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div key="form"
            initial={{ clipPath: 'inset(0 0 0 100%)' }} animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={{ clipPath: 'inset(0 100% 0 0)' }} transition={{ duration: 0.4, ease: EASE }}
            className="max-w-md"
          >
            <p className="text-[9px] tracking-[0.35em] text-gold/80 font-sans mb-5">
              {editing === 'new' ? 'ADD ADDRESS' : 'EDIT ADDRESS'}
            </p>
            <div className="space-y-3">
              <Field label="LABEL (e.g. Home, Office)" value={form.name} onChange={v => upd('name', v)} />
              <Field label="ADDRESS LINE 1" value={form.line1} onChange={v => upd('line1', v)} />
              <Field label="ADDRESS LINE 2 (optional)" value={form.line2} onChange={v => upd('line2', v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="CITY" value={form.city} onChange={v => upd('city', v)} />
                <Field label="POSTAL CODE" value={form.zip} onChange={v => upd('zip', v)} />
              </div>
              <Field label="COUNTRY" value={form.country} onChange={v => upd('country', v)} />
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => upd('isDefault', !form.isDefault)}
                  className={`w-4 h-4 border flex items-center justify-center transition-colors ${form.isDefault ? 'border-gold bg-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                  {form.isDefault && <Check size={10} className="text-black" />}
                </div>
                <span className="text-[10px] tracking-widest text-gray/70 font-sans">Set as default address</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <Btn onClick={save}><Check size={12} /> SAVE ADDRESS</Btn>
              <Btn variant="ghost" onClick={cancel}><X size={12} /> CANCEL</Btn>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3 max-w-lg mb-6">
              {addresses.map((addr, i) => (
                <motion.div key={addr.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                  className={`border p-4 ${addr.isDefault ? 'border-gold/30 bg-gold/5' : 'border-white/8'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] tracking-[0.25em] text-cream font-sans">{addr.name}</p>
                        {addr.isDefault && (
                          <span className="text-[8px] tracking-widest bg-gold text-black px-1.5 py-0.5 font-sans">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-xs text-gray/60 font-body">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-xs text-gray/60 font-body">{addr.city}, {addr.country} {addr.zip}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      {!addr.isDefault && (
                        <button onClick={() => setDef(addr.id)}
                          className="text-[9px] tracking-widest text-gray/40 hover:text-gold font-sans px-2 py-1 transition-colors">
                          SET DEFAULT
                        </button>
                      )}
                      <button onClick={() => openEdit(addr)} className="p-1.5 text-gray/40 hover:text-cream transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => del(addr.id)} className="p-1.5 text-gray/40 hover:text-red transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Btn onClick={openNew}><Plus size={12} /> ADD ADDRESS</Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 4. Payment Methods ───────────────────────────────────────────────────────

function formatCardNum(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function maskCard(num) {
  const digits = num.replace(/\s/g, '')
  return `•••• •••• •••• ${digits.slice(-4) || '????'}`
}
function cardBrand(num) {
  const d = num.replace(/\D/g, '')
  if (d.startsWith('4')) return 'VISA'
  if (d.startsWith('5')) return 'MASTERCARD'
  if (d.startsWith('3')) return 'AMEX'
  return 'CARD'
}

function PaymentSection() {
  const toast = useToast()
  const [cards, setCards] = useState([
    { id: 1, num: '4111111111111111', name: 'Alex Moreau', expiry: '09 / 27', isDefault: true },
  ])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ num: '', name: '', expiry: '', cvv: '' })

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }))
  const fmtExp = v => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0,2)} / ${d.slice(2)}` : d
  }

  const save = () => {
    if (!form.num || !form.name || !form.expiry) { toast('Please fill all card details', 'error'); return }
    setCards(p => [...p, { id: Date.now(), ...form, isDefault: p.length === 0 }])
    setForm({ num: '', name: '', expiry: '', cvv: '' })
    setAdding(false)
    toast('Card added successfully')
  }

  const del = id => { setCards(p => p.filter(c => c.id !== id)); toast('Card removed') }
  const setDef = id => { setCards(p => p.map(c => ({ ...c, isDefault: c.id === id }))); toast('Default card updated') }

  return (
    <div>
      <SectionHeader title="Payment Methods" subtitle="Manage your saved cards. No real payment data is stored." />

      <div className="space-y-3 max-w-lg mb-6">
        {cards.map((card, i) => (
          <motion.div key={card.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            className={`border p-4 ${card.isDefault ? 'border-gold/30 bg-gold/5' : 'border-white/8'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Card visual */}
                <div className="w-12 h-8 border border-white/20 flex items-center justify-center">
                  <span className="text-[8px] tracking-widest text-gray/60 font-sans">{cardBrand(card.num)}</span>
                </div>
                <div>
                  <p className="text-xs text-cream font-sans">{maskCard(card.num)}</p>
                  <p className="text-[10px] text-gray/50 font-sans">{card.name} · Exp {card.expiry}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {card.isDefault
                  ? <span className="text-[8px] tracking-widest bg-gold text-black px-1.5 py-0.5 font-sans mr-2">DEFAULT</span>
                  : <button onClick={() => setDef(card.id)} className="text-[9px] tracking-widest text-gray/40 hover:text-gold font-sans px-2 py-1 transition-colors">SET DEFAULT</button>
                }
                <button onClick={() => del(card.id)} className="p-1.5 text-gray/40 hover:text-red transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {adding ? (
          <motion.div key="cardform"
            initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.4, ease: EASE }}
            className="max-w-md border border-white/10 p-5 space-y-3"
          >
            <p className="text-[9px] tracking-[0.35em] text-gold/80 font-sans mb-2">NEW CARD</p>
            <Field label="CARD NUMBER" value={form.num} onChange={v => upd('num', formatCardNum(v))} placeholder="0000 0000 0000 0000" />
            <Field label="CARDHOLDER NAME" value={form.name} onChange={v => upd('name', v)} placeholder="As on card" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="EXPIRY" value={form.expiry} onChange={v => upd('expiry', fmtExp(v))} placeholder="MM / YY" />
              <Field label="CVV" type="password" value={form.cvv} onChange={v => upd('cvv', v.replace(/\D/g,'').slice(0,4))} placeholder="•••" />
            </div>
            <div className="flex gap-3 pt-1">
              <Btn onClick={save}><Check size={12} /> ADD CARD</Btn>
              <Btn variant="ghost" onClick={() => setAdding(false)}><X size={12} /> CANCEL</Btn>
            </div>
          </motion.div>
        ) : (
          <Btn onClick={() => setAdding(true)}><Plus size={12} /> ADD PAYMENT METHOD</Btn>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 5. Social Accounts ───────────────────────────────────────────────────────

function SocialSection() {
  const toast = useToast()
  const [linked, setLinked] = useState({ google: false, apple: false })

  const toggle = provider => {
    setLinked(p => {
      const next = !p[provider]
      show(next ? `${provider === 'google' ? 'Google' : 'Apple'} account connected` : `${provider === 'google' ? 'Google' : 'Apple'} account disconnected`)
      return { ...p, [provider]: next }
    })
  }

  const providers = [
    {
      id: 'google',
      name: 'Google',
      logo: (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
    },
    {
      id: 'apple',
      name: 'Apple',
      logo: (
        <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.7-147.7-111.1c-48.8-79.1-91.4-206.5-91.4-328.3 0-168.7 111.5-258 218.2-258 55.2 0 101 37.3 135.7 37.3 32.9 0 84.8-39.5 148.3-39.5 23.5 0 108.1 2 168.3 87.3zm-188.8-123c0-65.5 52.3-112.6 116.8-112.6 5.8 46.5-16.4 89-48.7 112.7-29.3 21.8-76.3 39.3-116.8 22.7.3-7.5.7-15.1.7-22.8z"/>
        </svg>
      ),
    },
  ]

  return (
    <div>
      <SectionHeader title="Connected Accounts" subtitle="Link social accounts for quicker sign-in. This is a visual simulation." />
      <div className="max-w-md space-y-4">
        {providers.map(p => (
          <div key={p.id} className={`border p-5 flex items-center justify-between transition-colors duration-300 ${linked[p.id] ? 'border-gold/30 bg-gold/5' : 'border-white/8'}`}>
            <div className="flex items-center gap-4">
              <span className={p.id === 'apple' ? 'text-cream' : ''}>{p.logo}</span>
              <div>
                <p className="text-[11px] tracking-[0.2em] text-cream font-sans">{p.name}</p>
                <p className="text-[9px] text-gray/50 font-body mt-0.5">
                  {linked[p.id] ? `Connected as user@daarvi.com` : 'Not connected'}
                </p>
              </div>
            </div>
            <button onClick={() => toggle(p.id)}
              className={`text-[9px] tracking-[0.2em] font-sans px-4 py-2 border transition-all duration-300 ${
                linked[p.id]
                  ? 'border-red/30 text-red hover:bg-red hover:text-cream'
                  : 'border-white/15 text-gray hover:text-cream hover:border-white/40'
              }`}>
              {linked[p.id] ? 'DISCONNECT' : 'CONNECT'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 6. Sessions ──────────────────────────────────────────────────────────────

const MOCK_SESSIONS = [
  { id: 1, device: 'MacBook Pro 16"', browser: 'Chrome 124', location: 'Paris, France', ip: '185.33.221.12', time: 'Now', current: true },
  { id: 2, device: 'iPhone 15 Pro', browser: 'Safari Mobile', location: 'Paris, France', ip: '185.33.221.14', time: '2 hours ago', current: false },
  { id: 3, device: 'Windows PC', browser: 'Firefox 125', location: 'London, UK', ip: '82.44.101.7', time: '3 days ago', current: false },
  { id: 4, device: 'iPad Air', browser: 'Safari', location: 'Berlin, Germany', ip: '46.114.35.9', time: '1 week ago', current: false },
]

function SessionsSection() {
  const toast = useToast()
  const [sessions, setSessions] = useState(MOCK_SESSIONS)

  const revoke = id => {
    setSessions(p => p.filter(s => s.id === 1)) // keep only current
    show('All other sessions logged out')
  }

  const revokeOne = id => {
    setSessions(p => p.filter(s => s.id !== id))
    show('Session terminated')
  }

  return (
    <div>
      <SectionHeader title="Active Sessions" subtitle="Devices currently signed in to your Daarvi account." />

      <div className="max-w-lg space-y-3 mb-8">
        {sessions.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
            layout
            className={`border p-4 ${s.current ? 'border-gold/30 bg-gold/5' : 'border-white/8'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {s.device.includes('iPhone') || s.device.includes('iPad')
                    ? <Smartphone size={14} className={s.current ? 'text-gold' : 'text-gray/40'} />
                    : <Monitor size={14} className={s.current ? 'text-gold' : 'text-gray/40'} />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] tracking-[0.15em] text-cream font-sans">{s.device}</p>
                    {s.current && <span className="text-[8px] tracking-widest bg-gold text-black px-1.5 py-0.5 font-sans">THIS DEVICE</span>}
                  </div>
                  <p className="text-[9px] text-gray/50 font-body mt-0.5">{s.browser}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Globe size={9} className="text-gray/30" />
                      <span className="text-[9px] text-gray/40 font-sans">{s.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wifi size={9} className="text-gray/30" />
                      <span className="text-[9px] text-gray/40 font-sans">{s.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-[9px] text-gray/40 font-sans mb-2">{s.time}</p>
                {!s.current && (
                  <button onClick={() => revokeOne(s.id)}
                    className="text-[9px] tracking-widest text-gray/40 hover:text-red font-sans transition-colors flex items-center gap-1">
                    <LogOut size={10} /> END
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {sessions.length === 1 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-gray/40 font-body py-2">
            No other active sessions.
          </motion.p>
        )}
      </div>

      {sessions.length > 1 && (
        <Btn variant="danger" onClick={revoke}>
          <LogOut size={12} /> LOG OUT ALL OTHER SESSIONS
        </Btn>
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const SECTION_COMPONENTS = {
  security:    SecuritySection,
  preferences: PreferencesSection,
  addresses:   AddressesSection,
  payment:     PaymentSection,
  social:      SocialSection,
  sessions:    SessionsSection,
}

export default function Account() {
  const [active, setActive] = useState('security')
  const { user } = useApp()
  const ActiveSection = SECTION_COMPONENTS[active]

  return (
    <div className="min-h-screen bg-black pt-10">
      <div className="px-8 md:px-12 pt-8 pb-2">
        <p className="text-[9px] tracking-[0.4em] text-gold/70 font-sans mb-2">MY ACCOUNT</p>
        <h1 className="font-serif text-3xl text-cream">{user?.name || 'Settings'}</h1>
        {user?.email && (
          <p className="text-[10px] tracking-widest text-gray/40 font-sans mt-1">{user.email}</p>
        )}
      </div>

      <div className="flex px-8 md:px-12 pb-24 mt-8 gap-10">
        {/* Left nav */}
        <nav className="w-44 flex-shrink-0">
          <div className="sticky top-8 flex flex-col gap-0.5">
            {SECTIONS.map(s => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 relative text-left transition-colors duration-200 ${
                    isActive ? 'text-cream' : 'text-gray/50 hover:text-gray'
                  }`}
                >
                  <motion.span className="absolute left-0 top-1 bottom-1 w-[2px] bg-gold"
                    animate={{ scaleY: isActive ? 1 : 0 }} transition={{ duration: 0.25, ease: EASE }} />
                  <Icon size={13} className={`flex-shrink-0 ${isActive ? 'text-gold' : 'text-gray/40 group-hover:text-gray/60'}`} />
                  <span className="text-[10px] tracking-[0.18em] font-sans">{s.label.toUpperCase()}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Vertical divider */}
        <div className="w-px bg-white/8 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ clipPath: 'inset(0 0 0 100%)', opacity: 1 }}
              animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 1 }}
              exit={{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <ActiveSection />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
