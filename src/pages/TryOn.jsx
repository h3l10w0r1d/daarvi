import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Sparkles, Download, Share2, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../data/mockData'

const EASE = [0.76, 0, 0.24, 1]

export default function TryOn() {
  const [photo, setPhoto] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [productIndex, setProductIndex] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhoto(url)
      setResult(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPhoto(url)
      setResult(null)
    }
  }

  const generate = async () => {
    setGenerating(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 2800))
    setResult(selectedProduct.image)
    setGenerating(false)
  }

  const prevProduct = () => {
    const i = (productIndex - 1 + products.length) % products.length
    setProductIndex(i)
    setSelectedProduct(products[i])
    setResult(null)
  }

  const nextProduct = () => {
    const i = (productIndex + 1) % products.length
    setProductIndex(i)
    setSelectedProduct(products[i])
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-black pt-10">
      {/* Header */}
      <div className="px-8 md:px-16 py-10 border-b border-white/10">
        <p className="text-[10px] tracking-widest text-gold font-sans mb-2">AI FEATURE</p>
        <h1 className="font-serif text-4xl text-cream">Virtual Try-On</h1>
        <p className="text-sm text-gray font-body mt-2">Upload your photo and see how any garment looks on you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-white/5 min-h-[70vh]">
        {/* Left: Upload */}
        <div className="bg-black p-8 md:p-12">
          <p className="text-[10px] tracking-widest text-gray font-sans mb-6">YOUR PHOTO</p>

          {!photo ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative border border-dashed border-white/20 aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 group"
            >
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload size={32} className="text-gray group-hover:text-gold transition-colors mb-4" />
              </motion.div>
              <p className="text-sm text-gray font-sans group-hover:text-cream transition-colors">Drop your photo here</p>
              <p className="text-[10px] text-gray/60 font-sans mt-2">or click to browse</p>
              <p className="absolute bottom-4 text-[10px] text-gray/40 font-sans">JPG, PNG — Max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative aspect-[3/4] overflow-hidden"
            >
              <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
              <button
                onClick={() => { setPhoto(null); setResult(null) }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/80 flex items-center justify-center text-gray hover:text-cream transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          {photo && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-2.5 text-[10px] tracking-widest text-gray hover:text-cream font-sans border border-white/10 hover:border-white/30 transition-all"
            >
              CHANGE PHOTO
            </motion.button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Right: Garment + Result */}
        <div className="bg-black p-8 md:p-12 flex flex-col">
          <p className="text-[10px] tracking-widest text-gray font-sans mb-6">SELECT GARMENT</p>

          {/* Product selector */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={prevProduct} className="text-gray hover:text-cream transition-colors">
              <ChevronLeft size={20} />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProduct.id}
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                exit={{ clipPath: 'inset(0 0 0 100%)' }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex items-center gap-4 flex-1"
              >
                <div className="w-16 h-20 overflow-hidden flex-shrink-0 bg-neutral-900">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest text-gold font-sans">{selectedProduct.brand}</p>
                  <p className="text-sm text-cream font-sans mt-0.5">{selectedProduct.name}</p>
                  <p className="text-xs text-gray font-sans mt-0.5">${selectedProduct.priceGlobal}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={nextProduct} className="text-gray hover:text-cream transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Result or placeholder */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ clipPath: 'inset(0% 0 0 0)' }}
                  exit={{ clipPath: 'inset(0 100% 0 0)' }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="relative aspect-[3/4] overflow-hidden"
                >
                  <img src={result} alt="Try-on result" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    <button className="flex-1 py-2 text-[10px] tracking-widest font-sans bg-gold text-black hover:bg-cream transition-colors flex items-center justify-center gap-1">
                      <Download size={11} /> SAVE
                    </button>
                    <button className="flex-1 py-2 text-[10px] tracking-widest font-sans border border-white/20 text-gray hover:text-cream hover:border-white/40 transition-all flex items-center justify-center gap-1">
                      <Share2 size={11} /> SHARE
                    </button>
                  </div>
                  {/* "AI overlay" badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-black text-[10px] tracking-widest font-sans flex items-center gap-1">
                    <Sparkles size={10} />
                    AI GENERATED
                  </div>
                </motion.div>
              ) : generating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-[3/4] border border-white/10 flex flex-col items-center justify-center gap-6"
                >
                  <div className="relative">
                    <motion.div
                      className="w-16 h-16 border-2 border-gold/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute inset-2 border-2 border-gold"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <Sparkles size={16} className="absolute inset-0 m-auto text-gold" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs tracking-widest text-gold font-sans mb-1">GENERATING</p>
                    <GeneratingText />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-[3/4] border border-dashed border-white/10 flex flex-col items-center justify-center"
                >
                  <Sparkles size={28} className="text-gray mb-3" />
                  <p className="text-sm text-gray font-sans">Your try-on will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Generate button */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={generate}
              disabled={!photo || generating}
              className="w-full py-4 text-xs tracking-widest font-sans flex items-center justify-center gap-2 bg-gold text-black hover:bg-cream transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              {generating ? (
                <><RefreshCw size={14} className="animate-spin" /> GENERATING...</>
              ) : (
                <><Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> GENERATE LOOK</>
              )}
            </button>
            {!photo && (
              <p className="text-[10px] text-center text-gray font-sans">Upload a photo first to generate</p>
            )}
            {result && (
              <Link
                to={`/product/${selectedProduct.id}`}
                className="w-full py-3 text-[10px] tracking-widest font-sans text-center border border-white/10 text-gray hover:text-cream hover:border-white/30 transition-all"
              >
                VIEW PRODUCT DETAILS
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-8 md:px-16 py-6 border-t border-white/10">
        <p className="text-[10px] text-gray/60 font-body">
          AI Try-On is a prototype feature. Generated images are for visualization purposes and may not represent exact fit or color accuracy.
        </p>
      </div>
    </div>
  )
}

const loadingMessages = [
  'Analyzing your silhouette...',
  'Mapping garment dimensions...',
  'Applying fabric simulation...',
  'Rendering your look...',
]

function GeneratingText() {
  const [idx, setIdx] = useState(0)

  useState(() => {
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % loadingMessages.length)
    }, 700)
    return () => clearInterval(interval)
  })

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="text-[10px] text-gray font-body"
      >
        {loadingMessages[idx]}
      </motion.p>
    </AnimatePresence>
  )
}
