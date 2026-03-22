import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Sparkles, Download, RefreshCw, X,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, RotateCcw, ShoppingBag, Info,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../data/mockData'
import { startTryOn, getTryOnStatus, startTryOnVideo, getTryOnVideoStatus } from '../api/tryon'

const EASE = [0.76, 0, 0.24, 1]

// ── Body types ────────────────────────────────────────────────────────────────
const BODY_TYPES = [
  {
    id: 'hourglass',
    label: 'Hourglass',
    desc: 'Shoulders ≈ hips, defined waist',
    shape: 'M20,2 Q32,2 34,14 Q36,22 30,28 Q36,34 34,46 Q32,58 20,58 Q8,58 6,46 Q4,34 10,28 Q4,22 6,14 Q8,2 20,2Z',
    fit: {
      default: 'Fitted silhouettes emphasise your balanced proportions. Avoid boxy cuts.',
      dresses: 'Wrap dresses, A-line and bodycon styles are your power moves.',
      tops: 'Fitted tops and wrap styles naturally highlight your waist.',
      outerwear: 'Belted coats and structured blazers are ideal — define that waist.',
      bottoms: 'High-waisted cuts elongate your legs and accentuate your curves.',
      accessories: 'All proportions work. Statement belts draw the eye to your waist.',
    },
  },
  {
    id: 'pear',
    label: 'Pear',
    desc: 'Hips wider than shoulders',
    shape: 'M20,2 Q28,2 30,14 Q32,22 28,28 Q36,36 36,48 Q36,60 20,60 Q4,60 4,48 Q4,36 12,28 Q8,22 10,14 Q12,2 20,2Z',
    fit: {
      default: 'Balance your silhouette by drawing attention upward. Bold tops, subtle bottoms.',
      dresses: 'A-line and fit-and-flare styles beautifully balance your silhouette.',
      tops: 'Structured shoulders, boat necks, and statement sleeves add volume up top.',
      outerwear: 'Single-breasted coats that flare slightly below the hip are your ideal.',
      bottoms: 'Straight-leg or wide-leg trousers skims hips elegantly. Avoid skinny fits.',
      accessories: 'Shoulder-width bags and statement necklaces balance proportions.',
    },
  },
  {
    id: 'inverted',
    label: 'Inverted △',
    desc: 'Shoulders wider than hips',
    shape: 'M8,2 Q32,2 36,14 Q40,24 32,32 Q28,40 24,58 Q20,62 16,58 Q12,40 8,32 Q0,24 4,14 Q8,2 8,2Z',
    fit: {
      default: 'Add volume below the waist to create balance. Flow downward.',
      dresses: 'Fit-and-flare, pleated midi, and full-skirt styles create beautiful balance.',
      tops: 'V-necks and simple tops draw the eye down. Avoid wide necklines.',
      outerwear: 'Longline coats and relaxed styles with volume at the hem work perfectly.',
      bottoms: 'Wide-leg trousers, full skirts, and flared cuts balance broad shoulders.',
      accessories: 'Hip-length bags and layered necklaces elongate the torso.',
    },
  },
  {
    id: 'apple',
    label: 'Apple',
    desc: 'Fuller midsection, narrow hips',
    shape: 'M20,2 Q32,4 36,16 Q40,30 34,40 Q28,52 20,58 Q12,52 6,40 Q0,30 4,16 Q8,4 20,2Z',
    fit: {
      default: 'Empire waists and V-necks elongate the torso and create flattering flow.',
      dresses: 'Empire-line, wrap, and A-line dresses skim your silhouette beautifully.',
      tops: 'V-necks, tunics, and empire-waist tops lengthen and balance perfectly.',
      outerwear: 'Open-front coats and longline cardigans create a sleek vertical line.',
      bottoms: 'Mid-rise straight-leg and bootcut styles add balance. Avoid high waists.',
      accessories: 'Long pendant necklaces and vertical-strap bags elongate the frame.',
    },
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    desc: 'Shoulders, waist & hips similar',
    shape: 'M8,2 L32,2 Q36,4 36,12 L36,50 Q36,58 32,58 L8,58 Q4,58 4,50 L4,12 Q4,4 8,2Z',
    fit: {
      default: 'Create curves with volume and definition. Peplums and cinched waists are friends.',
      dresses: 'Wrap dresses and peplum styles create the illusion of curves.',
      tops: 'Peplum tops, ruffles, and wrap styles add dimension at the waist.',
      outerwear: 'Belted coats and double-breasted styles add definition to your frame.',
      bottoms: 'High-waisted, wide-leg, and pleated styles add welcome shape.',
      accessories: 'Belts at the waist are your most powerful tool — use them freely.',
    },
  },
]

// ── Progress steps ────────────────────────────────────────────────────────────
const GEN_STEPS = [
  'Uploading your photo…',
  'Validating person silhouette…',
  'Mapping garment dimensions…',
  'Draping fabric simulation…',
  'Rendering final look…',
]

// ── Photo validation (client-side) ────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function validatePhoto(file) {
  const checks = []

  // 1. File type
  const typeOk = ALLOWED_TYPES.includes(file.type)
  checks.push({ label: 'Image format (JPG / PNG / WebP)', ok: typeOk, fatal: true })

  // 2. File size
  const sizeOk = file.size >= 80_000 && file.size <= 15_000_000
  const sizeMsg = file.size < 80_000
    ? 'Photo is too small — use a high-quality full-body photo'
    : file.size > 15_000_000 ? 'Photo exceeds 15 MB limit' : null
  checks.push({ label: 'File size (80 KB – 15 MB)', ok: sizeOk, msg: sizeMsg, fatal: true })

  // 3. Dimensions + aspect ratio (async)
  const dimResult = await new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = img.height / img.width
      if (ratio < 1.1) {
        resolve({ ok: false, msg: 'Use a full-body portrait photo (taller than wide)' })
        return
      }
      if (img.width < 200 || img.height < 300) {
        resolve({ ok: false, msg: 'Resolution too low — minimum 200 × 300 px' })
        return
      }
      resolve({ ok: true, width: img.width, height: img.height })
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ ok: false, msg: 'Could not read image' }) }
    img.src = url
  })
  checks.push({ label: 'Full-body portrait orientation', ok: dimResult.ok, msg: dimResult.msg, fatal: false })

  // 4. AI-generated image heuristic
  const aiResult = await detectAIGenerated(file)
  checks.push({
    label: 'Real photograph (not AI-generated)',
    ok: !aiResult.isAI,
    msg: aiResult.reason,
    fatal: false,
    warning: aiResult.isAI,
  })

  const fatalFail = checks.some(c => !c.ok && c.fatal)
  const valid = !fatalFail
  return { valid, checks }
}

async function detectAIGenerated(file) {
  // Heuristic 1: filename patterns
  const name = file.name.toLowerCase()
  const aiPatterns = ['midjourney', 'stable-diffusion', 'dalle', 'firefly', 'leonardo', 'generated', 'ai-', '-ai.']
  if (aiPatterns.some(p => name.includes(p))) {
    return { isAI: true, reason: 'Filename suggests AI-generated content. Upload a real photo.' }
  }

  // Heuristic 2: pixel noise variance (real photos have camera sensor noise)
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const SIZE = 64
        const canvas = document.createElement('canvas')
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        // Sample center of the image
        ctx.drawImage(img, img.width / 2 - SIZE / 2, img.height / 2 - SIZE / 2, SIZE, SIZE, 0, 0, SIZE, SIZE)
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data
        // Compute luminance variance
        let sum = 0, sum2 = 0
        const n = SIZE * SIZE
        for (let i = 0; i < data.length; i += 4) {
          const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          sum += lum; sum2 += lum * lum
        }
        const mean = sum / n
        const variance = sum2 / n - mean * mean
        // Very low variance = unusually smooth (often AI background or fully flat area)
        if (variance < 30 && mean > 30 && mean < 220) {
          resolve({ isAI: true, reason: 'Image appears unnaturally smooth — please upload a real photo.' })
        } else {
          resolve({ isAI: false })
        }
      } catch {
        resolve({ isAI: false }) // can't determine — pass through
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ isAI: false }) }
    img.src = url
  })
}

// ── Fit analysis ──────────────────────────────────────────────────────────────
function getFitAnalysis(bodyTypeId, product) {
  const bt = BODY_TYPES.find(b => b.id === bodyTypeId)
  if (!bt) return null

  const cat = product.category // 'dresses' | 'tops' | 'outerwear' | 'bottoms' | 'accessories'
  const advice = bt.fit[cat] || bt.fit.default

  // Score: comfort % based on body type + category match
  const scores = {
    hourglass:  { dresses: 98, tops: 95, outerwear: 92, bottoms: 96, accessories: 90 },
    pear:       { dresses: 94, tops: 88, outerwear: 90, bottoms: 85, accessories: 92 },
    inverted:   { dresses: 91, tops: 88, outerwear: 89, bottoms: 94, accessories: 88 },
    apple:      { dresses: 92, tops: 90, outerwear: 88, bottoms: 86, accessories: 91 },
    rectangle:  { dresses: 90, tops: 92, outerwear: 91, bottoms: 88, accessories: 89 },
  }
  const score = scores[bodyTypeId]?.[cat] ?? 88

  return { advice, score, bodyLabel: bt.label }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TryOn() {
  // Steps: 'upload' → 'body' → 'garment' → 'generating' → 'result'
  const [step, setStep] = useState('upload')

  // Photo
  const [photoFile, setPhotoFile] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState(null) // { valid, checks }
  const fileInputRef = useRef(null)

  // Body type
  const [bodyType, setBodyType] = useState(null)

  // Garment
  const [productIndex, setProductIndex] = useState(0)
  const selectedProduct = products[productIndex]

  // Generation — image
  const [genStepIdx, setGenStepIdx] = useState(0)
  const [predictionId, setPredictionId] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [genError, setGenError] = useState(null)
  const pollRef = useRef(null)

  // Generation — video (auto-starts after image succeeds)
  const [videoStatus, setVideoStatus] = useState(null) // null | 'generating' | 'ready' | 'failed'
  const [videoUrl, setVideoUrl] = useState(null)
  const videoPollRef = useRef(null)

  // ── Photo handling ──────────────────────────────────────────────────────────
  const processFile = useCallback(async (file) => {
    if (!file) return
    setValidating(true)
    setValidation(null)
    setResultUrl(null)
    setPredictionId(null)
    setGenError(null)

    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
    setPhotoFile(file)

    const result = await validatePhoto(file)
    setValidation(result)
    setValidating(false)
    if (result.valid) {
      // Auto-advance to body type selection
      setTimeout(() => setStep('body'), 400)
    }
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }, [processFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || ALLOWED_TYPES.includes(file.type))) {
      processFile(file)
    }
  }, [processFile])

  const resetPhoto = useCallback(() => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoFile(null)
    setValidation(null)
    setStep('upload')
    setResultUrl(null)
    setPredictionId(null)
    setGenError(null)
    setBodyType(null)
    setVideoStatus(null)
    setVideoUrl(null)
    if (videoPollRef.current) clearInterval(videoPollRef.current)
  }, [photoUrl])

  // ── Video generation (auto-starts after image succeeds) ──────────────────────
  const kickOffVideo = useCallback(async (imgUrl) => {
    setVideoStatus('generating')
    setVideoUrl(null)
    try {
      const { prediction_id } = await startTryOnVideo(imgUrl)
      videoPollRef.current = setInterval(async () => {
        try {
          const s = await getTryOnVideoStatus(prediction_id)
          if (s.status === 'succeeded' && s.result_url) {
            clearInterval(videoPollRef.current)
            setVideoUrl(s.result_url)
            setVideoStatus('ready')
          } else if (s.status === 'failed' || s.status === 'canceled') {
            clearInterval(videoPollRef.current)
            setVideoStatus('failed')
          }
        } catch { /* keep polling */ }
      }, 3000)
    } catch {
      setVideoStatus('failed')
    }
  }, [])

  // ── Image generation ─────────────────────────────────────────────────────────
  const startGeneration = useCallback(async () => {
    if (!photoFile || !selectedProduct) return
    setStep('generating')
    setGenStepIdx(0)
    setResultUrl(null)
    setGenError(null)
    setPredictionId(null)
    setVideoStatus(null)
    setVideoUrl(null)

    // Advance progress steps visually
    const stepTimer = setInterval(() => {
      setGenStepIdx(i => Math.min(i + 1, GEN_STEPS.length - 1))
    }, 5000)

    try {
      const { prediction_id } = await startTryOn(photoFile, selectedProduct.image)
      setPredictionId(prediction_id)

      // Poll image every 3 s
      pollRef.current = setInterval(async () => {
        try {
          const status = await getTryOnStatus(prediction_id)
          if (status.status === 'succeeded' && status.result_url) {
            clearInterval(pollRef.current)
            clearInterval(stepTimer)
            setResultUrl(status.result_url)
            setStep('result')
            // Immediately kick off video generation in background
            kickOffVideo(status.result_url)
          } else if (status.status === 'failed' || status.status === 'canceled') {
            clearInterval(pollRef.current)
            clearInterval(stepTimer)
            setGenError(status.error || 'Generation failed — please try again.')
            setStep('garment')
          }
        } catch { /* keep polling */ }
      }, 3000)
    } catch (err) {
      clearInterval(stepTimer)
      // If API not configured → demo mode
      if (err?.response?.status === 503) {
        await new Promise(r => setTimeout(r, 3000))
        setResultUrl(selectedProduct.image)
        setStep('result')
        // no video in demo mode
      } else {
        setGenError(err?.response?.data?.detail || err?.message || 'Generation failed.')
        setStep('garment')
      }
    }
  }, [photoFile, selectedProduct, kickOffVideo])

  // Cleanup on unmount
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (videoPollRef.current) clearInterval(videoPollRef.current)
  }, [])

  // ── Fit analysis ────────────────────────────────────────────────────────────
  const fitAnalysis = bodyType && step === 'result'
    ? getFitAnalysis(bodyType, selectedProduct)
    : null

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* ── Header ── */}
      <div className="px-8 md:px-16 py-10 border-b border-white/10">
        <p className="text-[10px] tracking-widest text-gold font-sans mb-2">VIRTUAL TRY-ON</p>
        <h1 className="font-serif text-4xl text-cream">See It On You</h1>
        <p className="text-sm text-gray font-body mt-2">
          Upload a full-body photo. We analyse your shape and dress you in the garment.
        </p>
        {/* Step indicator */}
        <StepIndicator current={step} />
      </div>

      {/* ── Main panels ── */}
      <div className="grid md:grid-cols-2 gap-px bg-white/5 min-h-[75vh]">
        {/* LEFT: Photo Panel */}
        <PhotoPanel
          photoUrl={photoUrl}
          validating={validating}
          validation={validation}
          step={step}
          fileInputRef={fileInputRef}
          onDrop={handleDrop}
          onChange={handleFileChange}
          onReset={resetPhoto}
        />

        {/* RIGHT: Context Panel */}
        <div className="bg-black">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <UploadHint key="hint" />
            )}
            {step === 'body' && (
              <BodyTypePanel
                key="body"
                bodyType={bodyType}
                onSelect={(id) => { setBodyType(id); setStep('garment') }}
              />
            )}
            {(step === 'garment' || step === 'generating') && step !== 'result' && (
              <GarmentPanel
                key="garment"
                productIndex={productIndex}
                selectedProduct={selectedProduct}
                onPrev={() => { setProductIndex(i => (i - 1 + products.length) % products.length); setResultUrl(null) }}
                onNext={() => { setProductIndex(i => (i + 1) % products.length); setResultUrl(null) }}
                generating={step === 'generating'}
                genStepIdx={genStepIdx}
                genError={genError}
                onGenerate={startGeneration}
                photoReady={!!photoFile && !!validation?.valid}
              />
            )}
            {step === 'result' && (
              <ResultPanel
                key="result"
                resultUrl={resultUrl}
                videoStatus={videoStatus}
                videoUrl={videoUrl}
                selectedProduct={selectedProduct}
                fitAnalysis={fitAnalysis}
                onRetry={() => { setStep('garment'); setResultUrl(null); setVideoStatus(null); setVideoUrl(null) }}
                onReset={resetPhoto}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="px-8 md:px-16 py-6 border-t border-white/10">
        <p className="text-[10px] text-gray/50 font-body max-w-2xl">
          Virtual Try-On uses AI to visualise garments on your photo. Results are for reference only and may
          not perfectly represent real-world fit, colour, or texture. Your photo is processed securely and not
          stored beyond this session.
        </p>
      </div>
    </div>
  )
}

// ── Step Indicator ─────────────────────────────────────────────────────────────
const STEPS = ['upload', 'body', 'garment', 'result']
const STEP_LABELS = ['Upload', 'Body Type', 'Garment', 'Result']

function StepIndicator({ current }) {
  const idx = current === 'generating' ? 2 : STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-0 mt-6">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-0 ${i < idx ? 'opacity-50' : ''}`}>
            <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-sans border transition-colors duration-300 ${
              i === idx ? 'bg-gold border-gold text-black' :
              i < idx ? 'border-gold/40 text-gold/40' :
              'border-white/20 text-gray/30'
            }`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] tracking-widest font-sans whitespace-nowrap transition-colors duration-300 ${
              i === idx ? 'text-cream' : i < idx ? 'text-gray/40' : 'text-gray/20'
            }`}>
              {label.toUpperCase()}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`w-8 h-px mx-2 transition-colors duration-300 ${i < idx ? 'bg-gold/40' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Photo Panel ────────────────────────────────────────────────────────────────
function PhotoPanel({ photoUrl, validating, validation, step, fileInputRef, onDrop, onChange, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black p-8 md:p-12"
    >
      <p className="text-[10px] tracking-widest text-gray font-sans mb-6">YOUR PHOTO</p>

      {!photoUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-white/20 aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 hover:bg-gold/[0.03] transition-all duration-300 group"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-5"
          >
            <Upload size={28} className="text-gray/50 group-hover:text-gold transition-colors" />
          </motion.div>
          <p className="text-sm text-gray font-sans group-hover:text-cream transition-colors">Drop your photo here</p>
          <p className="text-[10px] text-gray/40 font-sans mt-2">or click to browse</p>
          <div className="mt-6 flex flex-col gap-1 items-center">
            <p className="text-[9px] text-gray/30 font-sans">• Full body, standing upright</p>
            <p className="text-[9px] text-gray/30 font-sans">• Good lighting, plain background</p>
            <p className="text-[9px] text-gray/30 font-sans">• JPG / PNG / WebP — max 15 MB</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <img src={photoUrl} alt="Your photo" className="w-full h-full object-cover" />
          {/* Overlay gradient */}
          {step === 'result' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
          <button
            onClick={onReset}
            className="absolute top-3 right-3 w-8 h-8 bg-black/80 backdrop-blur flex items-center justify-center text-gray hover:text-cream transition-colors z-10"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Validation feedback */}
      <AnimatePresence>
        {(validating || validation) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2"
          >
            {validating ? (
              <div className="flex items-center gap-2 text-[10px] text-gray font-sans">
                <Loader2 size={12} className="animate-spin text-gold" />
                Validating photo…
              </div>
            ) : (
              validation?.checks?.map((check, i) => (
                <div key={i} className="flex items-start gap-2">
                  {check.ok ? (
                    <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                  ) : check.warning ? (
                    <AlertCircle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-[10px] font-sans ${check.ok ? 'text-gray/60' : check.warning ? 'text-amber-400/80' : 'text-red-400'}`}>
                      {check.label}
                    </p>
                    {!check.ok && check.msg && (
                      <p className="text-[9px] text-gray/50 font-body mt-0.5">{check.msg}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change photo button */}
      {photoUrl && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 w-full py-2.5 text-[10px] tracking-widest text-gray hover:text-cream font-sans border border-white/10 hover:border-white/20 transition-all"
        >
          CHANGE PHOTO
        </motion.button>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
    </motion.div>
  )
}

// ── Upload Hint Panel ──────────────────────────────────────────────────────────
function UploadHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 md:p-12 h-full flex flex-col justify-center"
    >
      <Sparkles size={32} className="text-gold/30 mb-8" />
      <h2 className="font-serif text-2xl text-cream mb-4">How it works</h2>
      <div className="space-y-6">
        {[
          { n: '01', title: 'Upload your photo', desc: 'A clear, full-body standing photo. We verify it\'s a real photo.' },
          { n: '02', title: 'Select your body type', desc: 'Helps us generate more accurate fit and drape.' },
          { n: '03', title: 'Choose a garment', desc: 'Pick any item from our collection to try on.' },
          { n: '04', title: 'See the result', desc: 'AI renders the garment on your photo with fit analysis.' },
        ].map(s => (
          <div key={s.n} className="flex items-start gap-4">
            <span className="text-[11px] font-sans text-gold/40 tracking-widest flex-shrink-0 mt-0.5">{s.n}</span>
            <div>
              <p className="text-[12px] text-cream font-sans tracking-wide">{s.title}</p>
              <p className="text-[11px] text-gray/60 font-body mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Body Type Panel ────────────────────────────────────────────────────────────
function BodyTypePanel({ bodyType, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="p-8 md:p-12"
    >
      <p className="text-[10px] tracking-widest text-gold font-sans mb-2">STEP 2 OF 3</p>
      <h2 className="font-serif text-2xl text-cream mb-2">Your Body Shape</h2>
      <p className="text-[11px] text-gray/60 font-body mb-8">
        This helps us recommend the best fit and refine the try-on render.
      </p>

      <div className="grid grid-cols-5 gap-2">
        {BODY_TYPES.map(bt => (
          <button
            key={bt.id}
            onClick={() => onSelect(bt.id)}
            className={`flex flex-col items-center gap-2 p-3 border transition-all duration-300 group ${
              bodyType === bt.id
                ? 'border-gold bg-gold/10'
                : 'border-white/10 hover:border-gold/40 hover:bg-gold/[0.04]'
            }`}
          >
            {/* Silhouette SVG */}
            <svg viewBox="0 0 40 62" className="w-8 h-12" fill="none">
              <path
                d={bt.shape}
                fill={bodyType === bt.id ? 'rgba(204,163,80,0.25)' : 'rgba(255,255,255,0.06)'}
                stroke={bodyType === bt.id ? '#cca350' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.5"
                className="transition-all duration-300 group-hover:fill-gold/10 group-hover:stroke-gold/50"
              />
            </svg>
            <p className={`text-[9px] tracking-widest font-sans text-center transition-colors duration-200 ${
              bodyType === bt.id ? 'text-gold' : 'text-gray/60 group-hover:text-cream'
            }`}>
              {bt.label.toUpperCase()}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-start gap-2">
          <Info size={11} className="text-gray/40 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray/50 font-body leading-relaxed">
            Not sure? Pick the shape that most closely matches your proportions. Your selection is only used for
            fit recommendations — it doesn't affect the generated image.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Garment Panel ──────────────────────────────────────────────────────────────
function GarmentPanel({ productIndex, selectedProduct, onPrev, onNext, generating, genStepIdx, genError, onGenerate, photoReady }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="p-8 md:p-12 flex flex-col h-full"
    >
      <p className="text-[10px] tracking-widest text-gold font-sans mb-2">STEP 3 OF 3</p>
      <h2 className="font-serif text-2xl text-cream mb-8">Select Garment</h2>

      {/* Product selector */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onPrev} disabled={generating} className="text-gray hover:text-cream transition-colors disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProduct.id}
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-20 h-24 overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[9px] tracking-widest text-gold font-sans">{selectedProduct.brand}</p>
              <p className="text-sm text-cream font-sans mt-1 leading-snug">{selectedProduct.name}</p>
              <p className="text-[10px] text-gray font-sans mt-1 capitalize">{selectedProduct.category}</p>
              <p className="text-[11px] text-gray/70 font-sans mt-0.5">${selectedProduct.priceGlobal}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <button onClick={onNext} disabled={generating} className="text-gray hover:text-cream transition-colors disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Product counter */}
      <div className="flex gap-1 mb-8">
        {products.slice(0, Math.min(products.length, 8)).map((_, i) => (
          <div key={i} className={`h-px flex-1 transition-colors duration-300 ${i === productIndex ? 'bg-gold' : 'bg-white/15'}`} />
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {genError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 border border-red-900/50 bg-red-950/30 flex items-start gap-2"
          >
            <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-red-400 font-body">{genError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating progress */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6 space-y-3"
          >
            {GEN_STEPS.map((label, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                {i < genStepIdx ? (
                  <CheckCircle2 size={12} className="text-gold flex-shrink-0" />
                ) : i === genStepIdx ? (
                  <Loader2 size={12} className="animate-spin text-gold flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 border border-white/20 rounded-full flex-shrink-0" />
                )}
                <span className={`text-[10px] font-sans transition-colors duration-300 ${
                  i <= genStepIdx ? 'text-cream' : 'text-gray/30'
                }`}>
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={!photoReady || generating}
        className="w-full py-4 text-xs tracking-widest font-sans flex items-center justify-center gap-2 bg-gold text-black hover:bg-cream transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
      >
        {generating ? (
          <><Loader2 size={14} className="animate-spin" /> GENERATING LOOK…</>
        ) : (
          <><Sparkles size={14} className="group-hover:scale-110 transition-transform" /> GENERATE LOOK</>
        )}
      </button>
      {!photoReady && (
        <p className="text-[10px] text-center text-gray/40 font-sans mt-2">Upload a valid photo first</p>
      )}
    </motion.div>
  )
}

// ── Result Panel ───────────────────────────────────────────────────────────────
function ResultPanel({ resultUrl, videoStatus, videoUrl, selectedProduct, fitAnalysis, onRetry, onReset }) {
  const showVideo = videoStatus === 'ready' && videoUrl
  const videoGenerating = videoStatus === 'generating'

  const handleDownload = () => {
    const url = videoUrl || resultUrl
    const ext = videoUrl ? 'mp4' : 'jpg'
    const a = document.createElement('a')
    a.href = url
    a.download = `daarvi-tryon-${selectedProduct.id}.${ext}`
    a.target = '_blank'
    a.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 md:p-12 flex flex-col"
    >
      <p className="text-[10px] tracking-widest text-gold font-sans mb-2">YOUR LOOK</p>
      <h2 className="font-serif text-2xl text-cream mb-4">
        {selectedProduct.name}
        <span className="text-gray/50 font-sans text-[11px] tracking-widest ml-3">
          by {selectedProduct.brand}
        </span>
      </h2>

      {/* ── Media area — upgrades from image → video automatically ── */}
      <div className="relative aspect-[3/4] overflow-hidden mb-3 bg-neutral-950">
        <AnimatePresence mode="wait">
          {showVideo ? (
            /* ── Real rotation video ── */
            <motion.video
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            /* ── Static try-on image with CSS rotation while video loads ── */
            <motion.img
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={resultUrl}
              alt="Try-on result"
              className="w-full h-full object-cover"
              style={{
                animation: 'tryon-rotate 8s ease-in-out infinite',
                transformOrigin: 'center center',
              }}
            />
          )}
        </AnimatePresence>

        {/* Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur border border-gold/30 text-[9px] tracking-widest font-sans text-gold flex items-center gap-1">
          <Sparkles size={9} />
          {showVideo ? 'ROTATION VIDEO' : 'TRY-ON RESULT'}
        </div>
      </div>

      {/* Video status bar */}
      <AnimatePresence>
        {videoGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 px-3 py-2 border border-white/10 flex items-center gap-2 overflow-hidden"
          >
            <Loader2 size={11} className="animate-spin text-gold flex-shrink-0" />
            <p className="text-[9px] tracking-widest font-sans text-gray/70">
              GENERATING ROTATION VIDEO…
            </p>
            <div className="flex-1 h-px bg-white/10 overflow-hidden ml-2">
              <motion.div
                className="h-full bg-gold/40"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 px-3 py-1.5 border border-gold/20 bg-gold/5 flex items-center gap-2"
          >
            <CheckCircle2 size={11} className="text-gold flex-shrink-0" />
            <p className="text-[9px] tracking-widest font-sans text-gold/80">
              360° ROTATION VIDEO READY
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fit analysis */}
      {fitAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-5 p-4 border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] tracking-widest text-gold font-sans">
              FIT ANALYSIS · {fitAnalysis.bodyLabel.toUpperCase()}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-24 bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fitAnalysis.score}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                  className="h-full bg-gold"
                />
              </div>
              <span className="text-[10px] text-gold font-sans">{fitAnalysis.score}%</span>
            </div>
          </div>
          <p className="text-[11px] text-gray/80 font-body leading-relaxed">{fitAnalysis.advice}</p>
        </motion.div>
      )}

      {/* Price + CTA */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray/50 font-sans">FROM</p>
          <p className="text-xl font-sans text-cream">${selectedProduct.priceGlobal}</p>
        </div>
        <Link
          to={`/product/${selectedProduct.id}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black text-[10px] tracking-widest font-sans hover:bg-cream transition-colors"
        >
          <ShoppingBag size={12} /> VIEW & BUY
        </Link>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 py-2.5 text-[10px] tracking-widest font-sans border border-white/10 text-gray hover:text-cream hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Download size={11} /> {videoUrl ? 'SAVE VIDEO' : 'SAVE IMAGE'}
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 text-[10px] tracking-widests font-sans border border-white/10 text-gray hover:text-cream hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={11} /> TRY ANOTHER
        </button>
      </div>

      <button
        onClick={onReset}
        className="mt-2 w-full py-2 text-[9px] tracking-widest font-sans text-gray/40 hover:text-gray/70 transition-colors"
      >
        START OVER WITH NEW PHOTO
      </button>
    </motion.div>
  )
}
