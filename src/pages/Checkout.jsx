import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Truck, CreditCard, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ordersApi } from '../api/orders'

const EASE = [0.76, 0, 0.24, 1]

export default function Checkout() {
  const { cart, cartTotal, mode, clearCart, user } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState('summary') // 'summary' | 'payment' | 'confirmed'
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', address: '', city: '', country: '', zip: '',
    card: '', expiry: '', cvv: '',
  })

  const total = cartTotal(mode)

  if (cart.length === 0 && step !== 'confirmed') {
    return (
      <div className="min-h-screen bg-black pt-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray font-sans text-sm mb-4">Your bag is empty</p>
          <Link to="/home" className="text-xs tracking-widest text-gold font-sans">← BROWSE COLLECTION</Link>
        </div>
      </div>
    )
  }

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* Header */}
      <div className="px-8 md:px-12 pt-6 mb-8 flex items-center justify-between">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-[10px] tracking-widest text-gray hover:text-cream font-sans transition-colors group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          CONTINUE SHOPPING
        </Link>
        <div className="flex items-center gap-1 text-[10px] tracking-widest text-gray/50 font-sans">
          <Lock size={10} />
          <span>SECURE CHECKOUT</span>
        </div>
      </div>

      <div className="px-8 md:px-12 pb-24">
        <div style={{ overflow: 'hidden' }} className="mb-10">
          <motion.h1
            className="font-serif text-4xl text-cream"
            initial={{ y: 40, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ y: 0, clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {step === 'confirmed' ? 'Order Confirmed' : 'Checkout'}
          </motion.h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 'confirmed' ? (
            <ConfirmedView navigate={navigate} />
          ) : (
            <motion.div
              key={step}
              initial={{ clipPath: 'inset(0 0 0 100%)', opacity: 1 }}
              animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 1 }}
              exit={{ clipPath: 'inset(0 100% 0 0)', opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="grid md:grid-cols-[1fr_360px] gap-10"
            >
              {/* Left: Form */}
              <div>
                {/* Step tabs */}
                <div className="flex gap-0 mb-10 border-b border-white/10">
                  {['summary', 'payment'].map((s, i) => (
                    <button
                      key={s}
                      onClick={() => step === 'payment' && s === 'summary' && setStep('summary')}
                      className={`px-6 py-3 text-[10px] tracking-[0.25em] font-sans border-b-2 transition-all duration-300 -mb-px ${
                        step === s
                          ? 'border-gold text-cream'
                          : 'border-transparent text-gray/50'
                      }`}
                    >
                      {`0${i + 1} ${s === 'summary' ? 'DELIVERY' : 'PAYMENT'}`}
                    </button>
                  ))}
                </div>

                {step === 'summary' && (
                  <DeliveryForm form={form} update={update} onNext={() => setStep('payment')} />
                )}
                {step === 'payment' && (
                  <PaymentForm form={form} update={update} submitting={submitting} onConfirm={async () => {
                    if (user) {
                      setSubmitting(true)
                      try {
                        await ordersApi.create({
                          mode,
                          items: cart.map(item => ({
                            product_id: item.product.id,
                            size: item.size,
                            color: item.color,
                            qty: item.qty,
                            price: mode === 'local' ? item.product.price_local : item.product.price_global,
                          })),
                          shipping_name: `${form.firstName} ${form.lastName}`.trim(),
                          shipping_address: form.address,
                          shipping_city: form.city,
                          shipping_country: form.country,
                        })
                      } catch (e) {
                        console.warn('Order API failed (not logged in or backend down):', e)
                      } finally {
                        setSubmitting(false)
                      }
                    }
                    clearCart()
                    setStep('confirmed')
                  }} />
                )}
              </div>

              {/* Right: Order summary */}
              <OrderSummary cart={cart} total={total} mode={mode} removeFromCart={removeFromCart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DeliveryForm({ form, update, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <Field label="FIRST NAME" value={form.firstName} onChange={v => update('firstName', v)} required />
        <Field label="LAST NAME" value={form.lastName} onChange={v => update('lastName', v)} required />
      </div>
      <Field label="EMAIL" type="email" value={form.email} onChange={v => update('email', v)} required />
      <Field label="ADDRESS" value={form.address} onChange={v => update('address', v)} required />
      <div className="grid grid-cols-2 gap-4">
        <Field label="CITY" value={form.city} onChange={v => update('city', v)} required />
        <Field label="POSTAL CODE" value={form.zip} onChange={v => update('zip', v)} required />
      </div>
      <Field label="COUNTRY" value={form.country} onChange={v => update('country', v)} required />

      <button
        type="submit"
        className="mt-6 w-full py-4 bg-gold text-black text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors duration-300 group"
      >
        CONTINUE TO PAYMENT
        <Truck size={13} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  )
}

function PaymentForm({ form, update, onConfirm, submitting }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm()
  }

  const formatCard = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`
    return digits
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="border border-white/10 p-5 space-y-4">
        <p className="text-[10px] tracking-[0.3em] text-gray/60 font-sans mb-2">CARD DETAILS</p>
        <Field
          label="CARD NUMBER"
          value={form.card}
          onChange={v => update('card', formatCard(v))}
          placeholder="0000 0000 0000 0000"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="EXPIRY"
            value={form.expiry}
            onChange={v => update('expiry', formatExpiry(v))}
            placeholder="MM / YY"
            required
          />
          <Field
            label="CVV"
            value={form.cvv}
            onChange={v => update('cvv', v.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <Lock size={10} className="text-gray/40" />
        <p className="text-[9px] tracking-widest text-gray/40 font-sans">
          256-bit SSL encrypted. Your details are never stored.
        </p>
      </div>

      <button
        type="submit"
        className="mt-4 w-full py-4 bg-gold text-black text-xs tracking-[0.25em] font-sans flex items-center justify-center gap-2 hover:bg-cream transition-colors duration-300 group"
      >
        <CreditCard size={13} />
        PLACE ORDER
      </button>
    </form>
  )
}

function OrderSummary({ cart, total, mode, removeFromCart }) {
  return (
    <div className="border border-white/10 p-6 h-fit">
      <p className="text-[10px] tracking-[0.3em] text-gray/60 font-sans mb-6">ORDER SUMMARY</p>

      <div className="space-y-4 mb-6">
        {cart.map((item, i) => {
          const price = mode === 'local' ? item.product.price_local : item.product.price_global
          return (
            <div key={i} className="flex gap-3">
              <div className="w-14 h-18 flex-shrink-0 overflow-hidden aspect-[3/4] bg-neutral-900">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] tracking-[0.3em] text-gray/60 font-sans">{item.product.brand}</p>
                <p className="text-xs text-cream font-sans mt-0.5 truncate">{item.product.name}</p>
                <p className="text-[10px] text-gray/60 font-sans mt-1">
                  {item.color} · {item.size} · ×{item.qty}
                </p>
              </div>
              <p className="text-sm text-cream font-sans flex-shrink-0">${price * item.qty}</p>
            </div>
          )
        })}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-[10px] text-gray font-sans">
          <span>SUBTOTAL</span>
          <span>${total}</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray font-sans">
          <span>SHIPPING</span>
          <span className="text-gold">CALCULATED AT NEXT STEP</span>
        </div>
      </div>

      <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
        <span className="text-[10px] tracking-[0.2em] text-cream font-sans">TOTAL</span>
        <span className="text-xl font-serif text-cream">${total}</span>
      </div>

      <div className={`mt-4 px-3 py-2 text-[9px] tracking-widest font-sans ${
        mode === 'local' ? 'bg-red/10 text-red' : 'bg-gold/10 text-gold'
      }`}>
        {mode.toUpperCase()} MODE PRICING APPLIED
      </div>
    </div>
  )
}

function ConfirmedView({ navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="py-20 text-center max-w-md mx-auto"
    >
      <motion.div
        className="w-16 h-16 bg-gold flex items-center justify-center mx-auto mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
      >
        <Check size={28} className="text-black" />
      </motion.div>

      <p className="text-[10px] tracking-[0.4em] text-gold font-sans mb-4">ORDER PLACED</p>
      <h2 className="font-serif text-4xl text-cream mb-4">Thank you.</h2>
      <p className="text-sm text-gray font-body leading-relaxed mb-10">
        Your order has been received. You'll get a confirmation email shortly with tracking details.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/home')}
          className="px-8 py-3 bg-gold text-black text-xs tracking-[0.25em] font-sans hover:bg-cream transition-colors"
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </motion.div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="group">
      <label className="block text-[9px] tracking-[0.3em] text-gray/60 font-sans mb-1.5 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border border-white/10 px-4 py-3 text-sm text-cream font-body focus:outline-none focus:border-gold transition-colors placeholder-white/15"
      />
    </div>
  )
}
