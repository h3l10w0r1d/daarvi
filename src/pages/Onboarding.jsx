import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

const steps = [
  {
    id: 'shape',
    label: 'STEP 01',
    title: 'Your Body Shape',
    subtitle: 'Select the silhouette that best matches your build',
    type: 'shape',
    options: [
      { id: 'hourglass', label: 'Hourglass',          desc: 'Balanced bust & hips, defined waist', emoji: '⧗' },
      { id: 'pear',      label: 'Pear',                desc: 'Narrower shoulders, fuller hips',     emoji: '▽' },
      { id: 'rectangle', label: 'Rectangle',           desc: 'Balanced, minimal curves',            emoji: '▭' },
      { id: 'inverted',  label: 'Inverted Triangle',   desc: 'Broader shoulders, narrow hips',      emoji: '△' },
      { id: 'apple',     label: 'Apple',               desc: 'Fuller midsection, slender legs',     emoji: '◉' },
    ],
  },
  {
    id: 'style',
    label: 'STEP 02',
    title: 'Your Aesthetic',
    subtitle: 'Choose the styles that speak to you — pick up to 3',
    type: 'multi',
    options: [
      { id: 'minimalist',   label: 'Minimalist',   desc: 'Clean lines, neutral tones, no excess',           color: '#1a1a1a' },
      { id: 'classic',      label: 'Classic',      desc: 'Tailored, timeless, structured',                  color: '#2c2416' },
      { id: 'streetwear',   label: 'Streetwear',   desc: 'Bold, casual, cultural references',               color: '#1a1a2e' },
      { id: 'romantic',     label: 'Romantic',     desc: 'Soft fabrics, feminine details, flow',            color: '#2e1a1a' },
      { id: 'avant-garde',  label: 'Avant-Garde',  desc: 'Experimental, editorial, boundary-pushing',       color: '#1a2e1a' },
      { id: 'boho',         label: 'Bohemian',     desc: 'Earthy, layered, free-spirited',                  color: '#2e2816' },
    ],
  },
  {
    id: 'palette',
    label: 'STEP 03',
    title: 'Your Color Palette',
    subtitle: 'Which tones do you gravitate toward?',
    type: 'color',
    options: [
      { id: 'monochrome', label: 'Monochrome',  colors: ['#000', '#333', '#666', '#999', '#fff'] },
      { id: 'earth',      label: 'Earthy',      colors: ['#8B6914', '#C19A49', '#D4B483', '#E8D5B0', '#F5EDD8'] },
      { id: 'jewel',      label: 'Jewel Tones', colors: ['#1B4F72', '#76448A', '#1E8449', '#B7950B', '#922B21'] },
      { id: 'pastel',     label: 'Pastels',     colors: ['#FADBD8', '#FDEBD0', '#D5F5E3', '#D6EAF8', '#E8DAEF'] },
      { id: 'bold',       label: 'Bold & Vivid',colors: ['#E74C3C', '#F39C12', '#27AE60', '#2980B9', '#8E44AD'] },
    ],
  },
  {
    id: 'budget',
    label: 'STEP 04',
    title: 'Your Budget Range',
    subtitle: 'Per item, what feels comfortable?',
    type: 'single',
    options: [
      { id: 'entry',   label: 'Under $100',    desc: 'Accessible & everyday'         },
      { id: 'mid',     label: '$100 – $300',   desc: 'Quality investment pieces'      },
      { id: 'premium', label: '$300 – $700',   desc: 'Premium & designer'             },
      { id: 'luxury',  label: '$700+',         desc: 'Luxury & couture'               },
    ],
  },
  {
    id: 'mode',
    label: 'STEP 05',
    title: 'Shopping Preference',
    subtitle: 'How do you prefer to discover and receive clothes?',
    type: 'single',
    options: [
      { id: 'global', label: 'Global', desc: 'International brands, widest selection, best prices — delivered in 2–4 weeks' },
      { id: 'local',  label: 'Local',  desc: 'Nearby boutiques, fast delivery or in-store pickup — support local makers'   },
      { id: 'both',   label: 'Both',   desc: 'I want the full Daarvi experience — show me everything'                       },
    ],
  },
  {
    id: 'currency',
    label: 'STEP 06',
    title: 'Your Currency',
    subtitle: 'All prices will be displayed in your preferred currency',
    type: 'currency',
    options: [
      { id: 'USD', label: 'US Dollar',          desc: '$ — United States'         },
      { id: 'EUR', label: 'Euro',               desc: '€ — European Union'        },
      { id: 'GBP', label: 'British Pound',      desc: '£ — United Kingdom'        },
      { id: 'JPY', label: 'Japanese Yen',       desc: '¥ — Japan'                 },
      { id: 'AED', label: 'UAE Dirham',         desc: 'د.إ — United Arab Emirates'},
      { id: 'CHF', label: 'Swiss Franc',        desc: 'Fr — Switzerland'          },
      { id: 'CAD', label: 'Canadian Dollar',    desc: 'CA$ — Canada'              },
      { id: 'AUD', label: 'Australian Dollar',  desc: 'A$ — Australia'            },
    ],
  },
  {
    id: 'legal',
    label: 'STEP 07',
    title: 'Almost There',
    subtitle: 'A few final preferences before we build your wardrobe',
    type: 'legal',
    options: [],
  },
]

export default function Onboarding() {
  const [stepIndex, setStepIndex]       = useState(0)
  const [answers, setAnswers]           = useState({})
  const [legalAnswers, setLegalAnswers] = useState({ terms: false, newsletter: true })
  const [direction, setDirection]       = useState(1)
  const navigate = useNavigate()
  const { setDnaProfile, setMode, updateCurrency, setNewsletterPref } = useApp()

  const step     = steps[stepIndex]
  const progress = (stepIndex / steps.length) * 100

  const select = (optionId) => {
    if (step.type === 'multi') {
      const current = answers[step.id] || []
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [step.id]: current.filter(id => id !== optionId) })
      } else if (current.length < 3) {
        setAnswers({ ...answers, [step.id]: [...current, optionId] })
      }
    } else {
      setAnswers({ ...answers, [step.id]: optionId })
    }
  }

  const isSelected = (optionId) => {
    if (step.type === 'multi') return (answers[step.id] || []).includes(optionId)
    return answers[step.id] === optionId
  }

  const canProceed = () => {
    if (step.type === 'legal') return legalAnswers.terms
    if (step.type === 'multi') return (answers[step.id] || []).length > 0
    return !!answers[step.id]
  }

  const next = () => {
    if (stepIndex < steps.length - 1) {
      setDirection(1)
      setStepIndex(stepIndex + 1)
    } else {
      // Complete onboarding
      setDnaProfile(answers)
      if (answers.mode === 'local') setMode('local')
      else setMode('global')
      updateCurrency(answers.currency || 'USD')
      setNewsletterPref(legalAnswers.newsletter)
      navigate('/home')
    }
  }

  const back = () => {
    setDirection(-1)
    setStepIndex(stepIndex - 1)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-px bg-white/10">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
        <div className="flex items-center justify-between px-8 py-4 bg-black/90 backdrop-blur-md">
          <span className="font-serif text-lg tracking-widest text-cream">DAARVI</span>
          <span className="text-[10px] tracking-widest text-gray font-sans">
            {stepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 pt-24 pb-32 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={{ clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', opacity: 1 }}
            animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 1 }}
            exit={{ clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="text-[10px] tracking-widest text-gold font-sans mb-4">{step.label}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-cream mb-3">{step.title}</h2>
            <p className="text-sm text-gray font-body mb-12">{step.subtitle}</p>

            {step.type === 'shape'    && <ShapeOptions    step={step} isSelected={isSelected} select={select} />}
            {step.type === 'multi'    && <MultiOptions    step={step} isSelected={isSelected} select={select} />}
            {step.type === 'color'    && <ColorOptions    step={step} isSelected={isSelected} select={select} />}
            {step.type === 'single'   && <SingleOptions   step={step} isSelected={isSelected} select={select} />}
            {step.type === 'currency' && <CurrencyOptions step={step} isSelected={isSelected} select={select} />}
            {step.type === 'legal'    && <LegalOptions    answers={legalAnswers} onChange={setLegalAnswers} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 px-8 py-5 flex items-center justify-between">
        <button
          onClick={back}
          disabled={stepIndex === 0}
          className="flex items-center gap-2 text-xs tracking-widest text-gray hover:text-cream disabled:opacity-30 font-sans transition-colors"
        >
          <ArrowLeft size={14} />
          BACK
        </button>

        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-px transition-all duration-300 ${
                i === stepIndex ? 'w-8 bg-gold' : i < stepIndex ? 'w-4 bg-gold/50' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={!canProceed()}
          className="flex items-center gap-2 text-xs tracking-widest font-sans disabled:opacity-30 transition-all duration-300 bg-gold text-black px-6 py-2.5 hover:bg-cream disabled:bg-white/10 disabled:text-gray"
        >
          {stepIndex === steps.length - 1 ? 'START MY JOURNEY' : 'NEXT'}
          {stepIndex === steps.length - 1 ? <Check size={14} /> : <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  )
}

// ── Option renderers ──────────────────────────────────────────────────────────

function ShapeOptions({ step, isSelected, select }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {step.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
          onClick={() => select(opt.id)}
          className={`p-6 border text-left transition-all duration-300 ${
            isSelected(opt.id) ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className="text-3xl mb-4 text-gold">{opt.emoji}</div>
          <p className="text-sm text-cream font-sans mb-1">{opt.label}</p>
          <p className="text-[10px] text-gray font-body leading-snug">{opt.desc}</p>
        </motion.button>
      ))}
    </div>
  )
}

function MultiOptions({ step, isSelected, select }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {step.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
          onClick={() => select(opt.id)}
          className={`p-6 border text-left relative transition-all duration-300 ${
            isSelected(opt.id) ? 'border-gold' : 'border-white/10 hover:border-white/30'
          }`}
          style={{ background: isSelected(opt.id) ? opt.color : 'transparent' }}
        >
          {isSelected(opt.id) && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-gold flex items-center justify-center">
              <Check size={10} className="text-black" />
            </div>
          )}
          <p className="text-base text-cream font-serif mb-2">{opt.label}</p>
          <p className="text-[11px] text-gray font-body leading-snug">{opt.desc}</p>
        </motion.button>
      ))}
    </div>
  )
}

function ColorOptions({ step, isSelected, select }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {step.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
          onClick={() => select(opt.id)}
          className={`p-4 border text-left transition-all duration-300 ${
            isSelected(opt.id) ? 'border-gold' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex gap-1 mb-4">
            {opt.colors.map((c, j) => (
              <div key={j} className="flex-1 h-8" style={{ background: c }} />
            ))}
          </div>
          <p className="text-xs text-cream font-sans">{opt.label}</p>
          {isSelected(opt.id) && (
            <div className="mt-2 flex items-center gap-1">
              <Check size={10} className="text-gold" />
              <span className="text-[10px] text-gold font-sans">SELECTED</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  )
}

function SingleOptions({ step, isSelected, select }) {
  return (
    <div className="flex flex-col gap-3">
      {step.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
          onClick={() => select(opt.id)}
          className={`flex items-center gap-6 p-6 border text-left transition-all duration-300 group ${
            isSelected(opt.id) ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected(opt.id) ? 'border-gold bg-gold' : 'border-white/30 group-hover:border-white/60'
          }`}>
            {isSelected(opt.id) && <Check size={10} className="text-black" />}
          </div>
          <div>
            <p className="text-base text-cream font-serif">{opt.label}</p>
            <p className="text-xs text-gray font-body mt-1">{opt.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

function CurrencyOptions({ step, isSelected, select }) {
  const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ', CHF: 'Fr', CAD: 'CA$', AUD: 'A$' }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {step.options.map((opt, i) => (
        <motion.button
          key={opt.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
          onClick={() => select(opt.id)}
          className={`p-5 border text-left transition-all duration-300 group ${
            isSelected(opt.id) ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={`font-serif text-2xl transition-colors duration-300 ${
              isSelected(opt.id) ? 'text-gold' : 'text-cream/40 group-hover:text-cream/70'
            }`}>
              {SYMBOLS[opt.id]}
            </span>
            {isSelected(opt.id) && (
              <div className="w-4 h-4 bg-gold flex items-center justify-center">
                <Check size={9} className="text-black" />
              </div>
            )}
          </div>
          <p className="text-sm text-cream font-sans">{opt.id}</p>
          <p className="text-[10px] text-gray font-body mt-1 leading-snug">{opt.desc}</p>
        </motion.button>
      ))}
    </div>
  )
}

function LegalOptions({ answers, onChange }) {
  return (
    <div className="max-w-lg space-y-5">
      {/* Terms & Conditions — required */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className={`flex items-start gap-5 p-6 border transition-all duration-300 cursor-pointer group ${
          answers.terms ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'
        }`}
        onClick={() => onChange({ ...answers, terms: !answers.terms })}
      >
        <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          answers.terms ? 'border-gold bg-gold' : 'border-white/30 group-hover:border-white/60'
        }`}>
          {answers.terms && <Check size={10} className="text-black" />}
        </div>
        <div>
          <p className="text-sm text-cream font-sans mb-1">
            I agree to the Terms & Conditions and Privacy Policy
            <span className="text-red ml-1">*</span>
          </p>
          <p className="text-[11px] text-gray font-body leading-relaxed">
            By continuing, you accept our{' '}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation() }}
              className="text-gold hover:text-cream transition-colors underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              Terms of Service <ExternalLink size={9} />
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation() }}
              className="text-gold hover:text-cream transition-colors underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              Privacy Policy <ExternalLink size={9} />
            </button>
            .
          </p>
        </div>
      </motion.div>

      {/* Newsletter — optional, default checked */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
        className={`flex items-start gap-5 p-6 border transition-all duration-300 cursor-pointer group ${
          answers.newsletter ? 'border-gold/40 bg-gold/[0.03]' : 'border-white/10 hover:border-white/30'
        }`}
        onClick={() => onChange({ ...answers, newsletter: !answers.newsletter })}
      >
        <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          answers.newsletter ? 'border-gold bg-gold' : 'border-white/30 group-hover:border-white/60'
        }`}>
          {answers.newsletter && <Check size={10} className="text-black" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-cream font-sans">
              Keep me updated on new collections and exclusive offers
            </p>
            <span className="text-[9px] tracking-widest text-gold/60 font-sans bg-gold/10 px-1.5 py-0.5 border border-gold/20">
              RECOMMENDED
            </span>
          </div>
          <p className="text-[11px] text-gray font-body leading-relaxed">
            Curated style edits, early access to drops, and personalised recommendations — only what matters to you. Unsubscribe at any time.
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-[10px] text-gray/40 font-sans"
      >
        * Required to create your account
      </motion.p>
    </div>
  )
}
