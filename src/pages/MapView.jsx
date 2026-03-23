import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, ArrowRight, MapPin, Navigation, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStores } from '../hooks/useStores'
import { useProducts } from '../hooks/useProducts'

const EASE = [0.76, 0, 0.24, 1]

// Yerevan city centre — Republic Square
const YEREVAN = { lat: 40.1777, lng: 44.5126 }
const WORLD_CENTER = [48, 10]

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}

function createCustomIcon(type, isSelected = false) {
  const color = type === 'local' ? '#af0000' : '#cca350'
  const size = isSelected ? 18 : 14
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid ${isSelected ? '#fff' : '#000'};
      box-shadow: 0 0 0 1px ${color}${isSelected ? ', 0 0 12px ' + color : ''};
      transition: all 0.2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// Fly map to new center+zoom smoothly
function MapController({ center, zoom }) {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    const key = `${center[0]},${center[1]},${zoom}`
    if (prev.current === key) return
    prev.current = key
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.3 })
  }, [center, zoom, map])
  return null
}

export default function MapView() {
  const { mode, toggleMode } = useApp()
  const [selectedStore, setSelectedStore] = useState(null)
  const [userCoords, setUserCoords] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | locating | done | denied

  // Fetch stores — local mode passes type=local filter
  const { data: allStores = [] } = useStores(mode === 'local' ? 'local' : null)
  const { data: allProducts = [] } = useProducts({})

  // Request geolocation when switching to LOCAL mode
  useEffect(() => {
    if (mode !== 'local') return
    if (userCoords) return
    if (!navigator.geolocation) { setGeoStatus('denied'); return }

    setGeoStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus('done')
      },
      () => {
        // Permission denied — fall back to Yerevan centre
        setUserCoords(YEREVAN)
        setGeoStatus('denied')
      },
      { timeout: 8000 }
    )
  }, [mode, userCoords])

  // Close drawer when switching modes
  useEffect(() => { setSelectedStore(null) }, [mode])

  // Compute map target
  const isLocal = mode === 'local'
  const localCenter = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [YEREVAN.lat, YEREVAN.lng]
  const mapCenter = isLocal ? localCenter : WORLD_CENTER
  const mapZoom = isLocal ? 13 : 3

  // Add live distance to each store when we have user coords
  const storesWithDist = allStores.map(s => {
    if (!userCoords || !s.lat || !s.lng) return s
    const km = haversine(userCoords.lat, userCoords.lng, s.lat, s.lng)
    return { ...s, liveDist: km }
  }).sort((a, b) => (a.liveDist ?? 999) - (b.liveDist ?? 999))

  // Detect user's city name (simple approach: if within ~30 km of Yerevan centre, it's Yerevan)
  const userCity = userCoords
    ? haversine(userCoords.lat, userCoords.lng, YEREVAN.lat, YEREVAN.lng) < 30
      ? 'Yerevan'
      : 'your city'
    : 'Yerevan'

  return (
    <div className="h-screen bg-black relative overflow-hidden">

      {/* ── Mode toggle ──────────────────────────────────── */}
      <motion.div
        className="absolute top-20 right-4 z-[1000] flex"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
      >
        <button
          onClick={toggleMode}
          className="flex items-center gap-0 text-[10px] tracking-widest font-sans border border-white/20 overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <span className={`px-4 py-2.5 transition-all duration-300 ${mode === 'global' ? 'bg-gold text-black font-medium' : 'text-gray'}`}>
            GLOBAL
          </span>
          <span className={`px-4 py-2.5 transition-all duration-300 ${mode === 'local' ? 'bg-red text-cream font-medium' : 'text-gray'}`}>
            LOCAL
          </span>
        </button>
      </motion.div>

      {/* ── Local mode header ─────────────────────────────── */}
      <AnimatePresence>
        {isLocal && (
          <motion.div
            className="absolute top-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 border border-white/20"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {geoStatus === 'locating' ? (
              <Loader2 size={12} className="text-gold animate-spin" />
            ) : (
              <Navigation size={12} className="text-gold" />
            )}
            <span className="text-[10px] tracking-widest font-sans text-cream">
              {geoStatus === 'locating' ? 'LOCATING YOU…' : `STORES NEAR YOU · ${userCity.toUpperCase()}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend ───────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-6 left-4 z-[1000] p-4 border border-white/20"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      >
        <p className="text-[10px] tracking-widest text-gray font-sans mb-3">LEGEND</p>
        <div className="flex flex-col gap-2">
          {!isLocal && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gold" />
              <span className="text-[10px] text-cream font-sans">GLOBAL STORE</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red" />
            <span className="text-[10px] text-cream font-sans">LOCAL BOUTIQUE</span>
          </div>
        </div>
        <p className="text-[10px] text-gray font-sans mt-3">{storesWithDist.length} stores visible</p>
      </motion.div>

      {/* ── Map ──────────────────────────────────────────── */}
      <MapContainer
        center={WORLD_CENTER}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Smoothly fly to the right city/world view */}
        <MapController center={mapCenter} zoom={mapZoom} />

        {storesWithDist.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createCustomIcon(store.type, selectedStore?.id === store.id)}
            eventHandlers={{ click: () => setSelectedStore(store) }}
          />
        ))}
      </MapContainer>

      {/* ── Store drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedStore && (
          <StoreDrawer
            store={selectedStore}
            allProducts={allProducts}
            onClose={() => setSelectedStore(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StoreDrawer({ store, allProducts, onClose }) {
  const storeProducts = allProducts.filter(p => (store.product_ids || []).includes(p.id))

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.45, ease: EASE }}
      className="absolute bottom-0 left-0 right-0 z-[1001] bg-black border-t border-white/10"
      style={{ maxHeight: '55vh', overflow: 'auto' }}
    >
      <div className="px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 ${store.type === 'local' ? 'bg-red' : 'bg-gold'}`} />
              <span className={`text-[10px] tracking-widest font-sans ${store.type === 'local' ? 'text-red' : 'text-gold'}`}>
                {store.type === 'local' ? 'LOCAL STORE' : store.type.toUpperCase()}
              </span>
            </div>
            <h3 className="font-serif text-2xl text-cream">{store.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={11} className="text-gray" />
                <span className="text-xs text-gray font-sans">{store.city}</span>
              </div>
              {store.liveDist != null && (
                <span className="text-xs text-gold font-sans">
                  {fmtDist(store.liveDist)}
                </span>
              )}
              {store.liveDist == null && store.distance && (
                <span className="text-xs text-gray font-sans">{store.distance}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray hover:text-cream transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Products available */}
        {storeProducts.length > 0 && (
          <div>
            <p className="text-[10px] tracking-widest text-gray font-sans mb-4">AVAILABLE HERE</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {storeProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
                >
                  <Link to={`/product/${product.id}`} className="group block" onClick={onClose}>
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-gray font-sans mt-1 truncate">{product.name}</p>
                    <p className="text-[10px] text-gold font-sans">${product.priceLocal}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {storeProducts.length === 0 && (
          <p className="text-xs text-gray font-sans mb-6">
            Visit the store to explore the full collection in person.
          </p>
        )}

        <Link
          to={`/home?brand=${store.brand?.slug || ''}`}
          onClick={onClose}
          className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-[10px] tracking-widest font-sans group transition-colors duration-300 ${
            store.type === 'local'
              ? 'bg-red text-cream hover:bg-cream hover:text-black'
              : 'bg-gold text-black hover:bg-cream'
          }`}
        >
          BROWSE {store.brand?.name?.toUpperCase() || 'COLLECTION'}
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}
