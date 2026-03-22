import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, User, ShoppingBag } from 'lucide-react'
import { TextRevealGroup } from '../components/TextReveal'
import { brands, products, whyJoinReasons } from '../data/mockData'
import LoginModal from '../components/LoginModal'
import ClothCanvas from '../components/ClothCanvas'
import { useApp } from '../context/AppContext'

const EASE = [0.76, 0, 0.24, 1]

// Brand list for marquee
const BRAND_NAMES = Object.values(brands).map((b) => b.name)

export default function Landing() {
  const [modalOpen, setModalOpen]   = useState(false)
  const [modalMode, setModalMode]   = useState('login')

  const openModal = (mode = 'login') => {
    setModalMode(mode)
    setModalOpen(true)
  }

  return (
    <div className="bg-black min-h-screen" style={{ maxWidth: '100vw', overflowX: 'clip' }}>
      <LoginModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultMode={modalMode}
      />

      {/* ① Hero */}
      <HeroSection openModal={openModal} />

      {/* ② Brand marquee */}
      <BrandMarquee />

      {/* ③ Horizontal product scroll (desktop) / Grid (mobile) */}
      <HorizontalProducts openModal={openModal} />

      {/* ④ Why Daarvi */}
      <WhyDaarvi />

      {/* ⑤ Mode teaser */}
      <ModeTeaser />

      {/* ⑥ Footer CTA */}
      <FooterCTA openModal={openModal} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ① HERO
// ════════════════════════════════════════════════════════════════════
function HeroSection({ openModal }) {
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const { cartCount, user } = useApp()

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative h-[100svh] bg-black flex flex-col overflow-hidden">

      {/* ── Fixed-style header ── */}
      <motion.header
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 py-5 md:py-6 transition-all duration-500 ${
          headerScrolled ? 'border-b border-gold/15' : ''
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <span className="font-serif text-lg tracking-widest text-cream">DAARVI</span>

        {/* Right: Sign in + Account + Bag */}
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={() => openModal('login')}
            className="hidden sm:block text-[11px] tracking-widest font-sans text-gray hover:text-cream transition-colors duration-300 relative group"
          >
            SIGN IN
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-cream group-hover:w-full transition-all duration-400" />
          </button>

          {/* Account icon */}
          <button
            onClick={() => openModal(user ? 'login' : 'signup')}
            className="relative group"
            title="Account"
          >
            <User size={17} className="text-gray group-hover:text-gold transition-colors duration-300" />
            {user && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />}
          </button>

          {/* Bag icon */}
          <Link to="/checkout" className="relative group" title="Bag">
            <ShoppingBag size={17} className="text-gray group-hover:text-gold transition-colors duration-300" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[15px] h-[15px] bg-gold text-black text-[9px] font-sans font-bold flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </motion.header>

      {/* ── Hero body: desktop 3-column, mobile single-column ── */}
      <div
        className="flex-1 flex flex-col justify-center px-5 pt-20 pb-8 md:grid md:items-center md:px-16 md:pt-20"
        style={{ gridTemplateColumns: '39% 22% 39%' }}
      >
        {/* Left / primary: "THE WORLD'S BOUTIQUES," */}
        <div className="flex flex-col justify-center md:h-full md:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[10px] tracking-widest text-gold font-sans mb-6 md:mb-8 select-none"
          >
            SPRING · COLLECTION · 2026
          </motion.div>

          <TextRevealGroup
            lines={["THE WORLD'S", 'BOUTIQUES,']}
            baseDelay={0.5}
            lineClassName="font-serif text-[clamp(2.6rem,8vw,6rem)] leading-[0.88] text-cream"
          />

          {/* Mobile-only: "YOURS." shown inline (desktop puts it in right col) */}
          <div className="block md:hidden mt-2">
            <TextRevealGroup
              lines={['YOURS.']}
              baseDelay={0.7}
              lineClassName="font-serif text-[clamp(2.6rem,8vw,6rem)] leading-[0.88] text-stroke-cream"
            />
          </div>

          {/* Mobile tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="block md:hidden mt-4 text-[11px] tracking-wide text-gray font-sans leading-relaxed"
          >
            A curated connection of global and local boutiques — matched to your DNA.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
            className="mt-8 md:mt-12 flex items-center gap-6 md:gap-8"
          >
            <button
              onClick={() => openModal('signup')}
              className="group flex items-center gap-2.5 text-[11px] tracking-widest font-sans text-cream relative"
            >
              <span className="relative">
                JOIN NOW
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-500" />
              </span>
              <ArrowRight size={13} className="text-gold group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={() => openModal('login')}
              className="group text-[11px] tracking-widest font-sans text-gray hover:text-cream transition-colors duration-300 relative"
            >
              EXPLORE
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-cream group-hover:w-full transition-all duration-500" />
            </button>
          </motion.div>
        </div>

        {/* Center: 3D cloth canvas — desktop only */}
        <div className="hidden md:block h-full relative">
          <motion.div
            className="absolute inset-x-0 top-[10%] bottom-[10%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
          >
            <ClothCanvas className="w-full h-full" />
          </motion.div>
        </div>

        {/* Right: "YOURS." (hollow) + tagline — desktop only */}
        <div className="hidden md:flex flex-col items-end justify-center h-full py-16">
          <TextRevealGroup
            lines={['YOURS.']}
            baseDelay={0.7}
            lineClassName="font-serif text-[clamp(3rem,6.5vw,6rem)] leading-[0.88] text-stroke-cream"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-8 text-[11px] tracking-widest text-gray font-sans text-right max-w-[220px] leading-relaxed"
          >
            A curated connection of global and local boutiques — matched to your DNA.
          </motion.p>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <span
          className="text-[10px] tracking-widest text-gray/40 font-sans"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          SCROLL
        </span>
        <motion.div
          className="w-px h-10 bg-gray/30"
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>

      {/* Bottom gold accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 1.2, ease: EASE }}
      />
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ② BRAND MARQUEE
// ════════════════════════════════════════════════════════════════════
function BrandMarquee() {
  // Duplicate for seamless loop
  const items = [...BRAND_NAMES, ...BRAND_NAMES]

  return (
    <div className="relative border-t border-b border-white/[0.06] h-12 bg-black overflow-hidden group">
      <div
        className="flex items-center h-full w-max gap-0"
        style={{
          animation: 'marquee 28s linear infinite',
          animationPlayState: 'running',
        }}
      >
        {items.map((name, i) => (
          <span key={i} className="flex items-center gap-6 px-6">
            <span className="text-[11px] tracking-widest text-gray/40 font-sans whitespace-nowrap">
              {name}
            </span>
            <span className="w-1 h-1 rounded-full bg-gold/35 flex-shrink-0" />
          </span>
        ))}
      </div>
      {/* Pause on hover via sibling trick */}
      <style>{`
        .group:hover > div {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ③ HORIZONTAL PRODUCTS (responsive wrapper)
// ════════════════════════════════════════════════════════════════════
function HorizontalProducts({ openModal }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) return <MobileProductGrid openModal={openModal} />
  return <DesktopHorizontalProducts openModal={openModal} />
}

// ── Mobile: 2-column product grid ──
function MobileProductGrid({ openModal }) {
  const featured = products.slice(0, 6)
  return (
    <section className="px-4 py-10 bg-black border-t border-white/[0.06]">
      <p className="text-[10px] tracking-widest text-gray/40 font-sans mb-6">NEW ARRIVALS</p>
      <div className="grid grid-cols-2 gap-3">
        {featured.map((product) => {
          const price = Math.min(product.priceLocal || 0, product.priceGlobal || 0)
          return (
            <div
              key={product.id}
              className="relative overflow-hidden cursor-pointer group"
              style={{ aspectRatio: '3/4' }}
              onClick={() => openModal('login')}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-colors duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[9px] tracking-widest text-gold font-sans mb-0.5">{product.brand}</p>
                <p className="font-serif text-sm text-cream leading-snug">{product.name}</p>
                <p className="text-[9px] tracking-widest text-gray font-sans mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  from ${price}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => openModal('signup')}
        className="mt-6 w-full border border-white/10 py-3 text-[10px] tracking-widest text-gold font-sans flex items-center justify-center gap-2 hover:border-gold/40 transition-colors duration-300"
      >
        VIEW ALL <ArrowRight size={11} />
      </button>
    </section>
  )
}

// ── Desktop: sticky horizontal scroll ──
function DesktopHorizontalProducts({ openModal }) {
  const containerRef = useRef()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Translate the strip left as user scrolls
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-72%'])

  // Gold progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  // Label visibility
  const labelOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])

  const featured = products.slice(0, 6)

  return (
    <div ref={containerRef} className="relative" style={{ height: '240vh', position: 'relative' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-black flex flex-col">

        {/* Section label */}
        <motion.div
          style={{ opacity: labelOpacity }}
          className="absolute top-8 left-8 z-20 text-[10px] tracking-widest text-gray/40 font-sans select-none"
        >
          NEW ARRIVALS
        </motion.div>

        {/* Scrolling cards row */}
        <div className="flex-1 flex items-center">
          <motion.div
            style={{ x }}
            className="flex gap-4 px-8 md:px-16 items-center h-full"
          >
            {featured.map((product, i) => (
              <HorizontalCard
                key={product.id}
                product={product}
                index={i}
                openModal={openModal}
              />
            ))}

            {/* Final CTA card */}
            <div className="w-[22vw] h-[65vh] flex-shrink-0 border border-white/10 flex flex-col items-center justify-center gap-6 px-8 hover:border-gold/40 transition-colors duration-500 group">
              <p className="text-[10px] tracking-widest text-gray font-sans text-center leading-relaxed">
                CURATED FOR<br />YOUR STYLE
              </p>
              <button
                onClick={() => openModal('signup')}
                className="text-[10px] tracking-widest text-gold font-sans flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
              >
                VIEW ALL <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Gold progress bar — bottom */}
        <div className="h-px w-full bg-white/5 relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gold origin-left"
            style={{ scaleX }}
          />
        </div>
      </div>
    </div>
  )
}

function HorizontalCard({ product, index, openModal }) {
  const price = Math.min(product.priceLocal || 0, product.priceGlobal || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
      className="w-[34vw] h-[65vh] flex-shrink-0 relative overflow-hidden group cursor-pointer"
      onClick={() => openModal('login')}
    >
      {/* Image */}
      <motion.img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.8, ease: EASE }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Border on hover */}
      <div className="absolute inset-0 border border-transparent group-hover:border-gold/30 transition-colors duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Brand — slides up on hover */}
        <motion.p
          className="text-[10px] tracking-widest text-gold font-sans mb-1 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400"
        >
          {product.brand}
        </motion.p>
        <p className="font-serif text-xl text-cream">{product.name}</p>

        {/* Price — shows on hover */}
        <p className="text-[10px] tracking-widest text-gray font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          from ${price}
        </p>
      </div>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════════
// ④ WHY DAARVI
// ════════════════════════════════════════════════════════════════════
function WhyDaarvi() {
  const numerals = ['01', '02', '03']
  const descriptions = [
    'A five-minute DNA assessment builds your complete style profile — shape, palette, budget, and aesthetic.',
    'Access boutiques in your city or luxury labels worldwide. One platform, two modes, infinite options.',
    'Virtual try-on powered by your body data. See exactly how each piece will look before you buy.',
  ]

  return (
    <section className="py-14 md:py-20 px-4 md:px-16 bg-black border-t border-white/[0.06]">
      {/* Eyebrow */}
      <p className="text-[10px] tracking-widest text-gray/50 font-sans mb-10 md:mb-12 text-center">
        — A DIFFERENT KIND OF PLATFORM —
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-px md:bg-white/[0.04]">
        {whyJoinReasons.map((reason, i) => (
          <motion.div
            key={reason.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
            className="relative bg-black border border-white/[0.06] p-7 md:p-10 overflow-hidden hover:border-gold/25 transition-colors duration-500 group"
          >
            {/* Decorative numeral background */}
            <span className="absolute -top-2 -right-2 font-serif text-[90px] leading-none text-gold/[0.07] select-none pointer-events-none">
              {numerals[i]}
            </span>

            <p className="text-[10px] tracking-widest text-gold/60 font-sans mb-5 relative z-10">
              {numerals[i]}
            </p>
            <h3 className="font-serif text-xl md:text-2xl text-cream mb-4 relative z-10">{reason.title}</h3>
            <p className="text-sm text-gray font-body leading-relaxed relative z-10">
              {descriptions[i]}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑤ MODE TEASER — expanding split divider
// ════════════════════════════════════════════════════════════════════
function ModeTeaser() {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState('global')
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Divider position: 50% default, shifts when one side is chosen
  const dividerLeft = active === 'global' ? '38%' : '62%'

  const globalBg = Object.values(brands)[0].cover
  const localBg  = Object.values(brands)[3].cover

  if (isMobile) {
    return (
      <section ref={ref} className="border-t border-white/[0.06] bg-black">
        {/* Global panel */}
        <div
          className="relative cursor-pointer px-6 py-10 overflow-hidden"
          onClick={() => setActive('global')}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${globalBg})`, opacity: active === 'global' ? 0.10 : 0.04, transition: 'opacity 0.5s ease' }} />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10">
            <p className={`text-[10px] tracking-widest font-sans mb-2 transition-colors duration-500 ${active === 'global' ? 'text-gold' : 'text-gray/40'}`}>GLOBAL MODE</p>
            <h3 className={`font-serif text-3xl leading-tight mb-3 transition-colors duration-500 ${active === 'global' ? 'text-cream' : 'text-gray/40'}`}>The world's<br />finest labels.</h3>
            <p className={`text-sm font-body leading-relaxed transition-colors duration-500 ${active === 'global' ? 'text-gray' : 'text-gray/20'}`}>Luxury boutiques from Paris to Tokyo — discovered, curated, and delivered to your door.</p>
            <p className={`text-[10px] tracking-widest font-sans mt-4 transition-colors duration-500 ${active === 'global' ? 'text-gold/70' : 'text-gray/20'}`}>LOWER PRICE · LONGER DELIVERY</p>
          </div>
        </div>

        {/* Local panel */}
        <div
          className="relative cursor-pointer px-6 py-10 overflow-hidden"
          onClick={() => setActive('local')}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${localBg})`, opacity: active === 'local' ? 0.10 : 0.04, transition: 'opacity 0.5s ease' }} />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10">
            <p className={`text-[10px] tracking-widest font-sans mb-2 transition-colors duration-500 ${active === 'local' ? 'text-gold' : 'text-gray/40'}`}>LOCAL MODE</p>
            <h3 className={`font-serif text-3xl leading-tight mb-3 transition-colors duration-500 ${active === 'local' ? 'text-cream' : 'text-gray/40'}`}>Your city's<br />best boutiques.</h3>
            <p className={`text-sm font-body leading-relaxed transition-colors duration-500 ${active === 'local' ? 'text-gray' : 'text-gray/20'}`}>Discover independent stores near you — same-day delivery, in-person visits, local makers.</p>
            <p className={`text-[10px] tracking-widest font-sans mt-4 transition-colors duration-500 ${active === 'local' ? 'text-gold/70' : 'text-gray/20'}`}>NEARBY STORES · FAST DELIVERY</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative border-t border-white/[0.06] overflow-hidden bg-black" style={{ height: '70vh' }}>
      {/* Left panel — Global */}
      <motion.div
        className="absolute inset-y-0 left-0 cursor-pointer flex flex-col justify-end p-12 md:p-16"
        style={{ right: `calc(100% - ${dividerLeft})` }}
        animate={{ right: `calc(100% - ${dividerLeft})` }}
        transition={{ duration: 0.7, ease: EASE }}
        onClick={() => setActive('global')}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true }}
      >
        {/* Subtle editorial background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${globalBg})`,
            opacity: active === 'global' ? 0.10 : 0.04,
            transition: 'opacity 0.7s ease',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10">
          <p className={`text-[10px] tracking-widest font-sans mb-3 transition-colors duration-500 ${active === 'global' ? 'text-gold' : 'text-gray/40'}`}>
            GLOBAL MODE
          </p>
          <h3 className={`font-serif text-[clamp(1.8rem,3.5vw,3rem)] leading-tight mb-4 transition-colors duration-500 ${active === 'global' ? 'text-cream' : 'text-gray/40'}`}>
            The world's<br />finest labels.
          </h3>
          <p className={`text-sm font-body leading-relaxed max-w-xs transition-colors duration-500 ${active === 'global' ? 'text-gray' : 'text-gray/20'}`}>
            Luxury boutiques from Paris to Tokyo — discovered, curated, and delivered to your door.
          </p>
          <p className={`text-[10px] tracking-widest font-sans mt-6 transition-colors duration-500 ${active === 'global' ? 'text-gold/70' : 'text-gray/20'}`}>
            LOWER PRICE · LONGER DELIVERY
          </p>
        </div>
      </motion.div>

      {/* Right panel — Local */}
      <motion.div
        className="absolute inset-y-0 right-0 cursor-pointer flex flex-col justify-end p-12 md:p-16"
        style={{ left: dividerLeft }}
        animate={{ left: dividerLeft }}
        transition={{ duration: 0.7, ease: EASE }}
        onClick={() => setActive('local')}
        initial={{ clipPath: 'inset(0 0 0 100%)' }}
        whileInView={{ clipPath: 'inset(0 0 0 0%)' }}
        viewport={{ once: true }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${localBg})`,
            opacity: active === 'local' ? 0.10 : 0.04,
            transition: 'opacity 0.7s ease',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10">
          <p className={`text-[10px] tracking-widest font-sans mb-3 transition-colors duration-500 ${active === 'local' ? 'text-gold' : 'text-gray/40'}`}>
            LOCAL MODE
          </p>
          <h3 className={`font-serif text-[clamp(1.8rem,3.5vw,3rem)] leading-tight mb-4 transition-colors duration-500 ${active === 'local' ? 'text-cream' : 'text-gray/40'}`}>
            Your city's<br />best boutiques.
          </h3>
          <p className={`text-sm font-body leading-relaxed max-w-xs transition-colors duration-500 ${active === 'local' ? 'text-gray' : 'text-gray/20'}`}>
            Discover independent stores near you — same-day delivery, in-person visits, local makers.
          </p>
          <p className={`text-[10px] tracking-widest font-sans mt-6 transition-colors duration-500 ${active === 'local' ? 'text-gold/70' : 'text-gray/20'}`}>
            NEARBY STORES · FAST DELIVERY
          </p>
        </div>
      </motion.div>

      {/* Vertical divider line */}
      <motion.div
        className="absolute inset-y-0 w-px bg-gold/40 z-20"
        animate={{ left: dividerLeft }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ left: dividerLeft }}
      >
        {/* Travelling dot */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold"
          animate={{ top: ['15%', '85%', '15%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mode label */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div
            className="text-[9px] tracking-widest text-gold/60 font-sans whitespace-nowrap bg-black px-2 py-1"
            style={{ writingMode: 'vertical-rl' }}
          >
            TAP TO SWITCH
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// ⑥ FOOTER CTA
// ════════════════════════════════════════════════════════════════════
function FooterCTA({ openModal }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="min-h-[65vh] md:min-h-[75vh] flex flex-col justify-between border-t border-white/[0.06] bg-black">
      {/* Main CTA content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-14 md:py-24 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[10px] tracking-widest text-gray/40 font-sans mb-8 md:mb-10"
        >
          YOUR STYLE IDENTITY AWAITS
        </motion.p>

        <div className="overflow-hidden mb-2">
          <TextRevealGroup
            lines={['START WITH']}
            baseDelay={0.2}
            lineClassName="font-serif text-[clamp(2.4rem,7vw,6rem)] leading-[0.9] text-cream"
          />
        </div>
        <div className="overflow-hidden">
          <TextRevealGroup
            lines={['YOUR DNA.']}
            baseDelay={0.38}
            lineClassName="font-serif text-[clamp(2.4rem,7vw,6rem)] leading-[0.9] text-stroke-cream"
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          className="mt-6 md:mt-8 text-xs text-gray/60 font-body"
        >
          A five-minute test. A wardrobe built for you.
        </motion.p>

        <motion.button
          onClick={() => openModal('signup')}
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.9 }}
          className="mt-8 md:mt-10 group flex items-center gap-3 border border-cream/25 text-cream text-[11px] tracking-widest font-sans px-8 md:px-12 py-3.5 md:py-4 hover:bg-cream hover:text-black hover:border-cream transition-all duration-400"
        >
          START YOUR DNA TEST
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
        </motion.button>
      </div>

      {/* Footer bar */}
      <div className="border-t border-white/[0.06] px-5 md:px-16 py-5 md:py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[10px] tracking-widest text-gray/30 font-sans">DAARVI © 2026</p>
        <div className="flex items-center gap-5 md:gap-6">
          {['PRIVACY', 'TERMS', 'CONTACT'].map((link) => (
            <button
              key={link}
              className="text-[10px] tracking-widest text-gray/30 font-sans hover:text-gray/70 transition-colors duration-300"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
