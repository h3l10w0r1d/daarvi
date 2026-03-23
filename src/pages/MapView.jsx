import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, MapPin, Navigation, Loader2, ExternalLink, ArrowRight } from 'lucide-react'
import { useStores } from '../hooks/useStores'
import { useProducts } from '../hooks/useProducts'

const EASE = [0.76, 0, 0.24, 1]
const YEREVAN = { lat: 40.1777, lng: 44.5126 }

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

function createIcon(isSelected = false) {
  const size = isSelected ? 20 : 14
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px;
      background:#af0000;
      border:2px solid ${isSelected ? '#fff' : '#000'};
      box-shadow: 0 0 0 1px #af0000${isSelected ? ', 0 0 14px #af0000' : ''};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapInit({ center, zoom }) {
  const map = useMap()
  const prev = useRef(null)
  useEffect(() => {
    const k = `${center[0]},${center[1]},${zoom}`
    if (prev.current === k) return
    prev.current = k
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.3 })
  }, [center, zoom, map])
  return null
}

export default function MapView() {
  const [selected, setSelected]   = useState(null)
  const [userCoords, setUserCoords] = useState(null)
  const [geoStatus, setGeoStatus]   = useState('idle')

  const { data: stores = [] }   = useStores('local')   // always show local Yerevan stores
  const { data: allProducts = [] } = useProducts({})

  // Request geolocation once
  useEffect(() => {
    if (userCoords || !navigator.geolocation) return
    setGeoStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoStatus('done') },
      ()  => { setUserCoords(YEREVAN); setGeoStatus('denied') },
      { timeout: 8000 }
    )
  }, [userCoords])

  const center = userCoords ? [userCoords.lat, userCoords.lng] : [YEREVAN.lat, YEREVAN.lng]

  const storesWithDist = stores
    .map(s => userCoords
      ? { ...s, liveDist: haversine(userCoords.lat, userCoords.lng, s.lat, s.lng) }
      : s
    )
    .sort((a, b) => (a.liveDist ?? 999) - (b.liveDist ?? 999))

  return (
    <div className="h-screen bg-black relative overflow-hidden">

      {/* Location pill */}
      <motion.div
        className="absolute top-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 border border-white/20"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
      >
        {geoStatus === 'locating'
          ? <Loader2 size={12} className="text-gold animate-spin" />
          : <Navigation size={12} className="text-gold" />
        }
        <span className="text-[11px] tracking-widest font-sans text-cream">
          {geoStatus === 'locating' ? 'LOCATING YOU…' : 'YEREVAN — NEARBY STORES'}
        </span>
      </motion.div>

      {/* Store count */}
      <motion.div
        className="absolute bottom-6 left-4 z-[1000] px-4 py-3 border border-white/20"
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
      >
        <p className="text-[11px] text-gray font-sans">{storesWithDist.length} stores in Yerevan</p>
      </motion.div>

      {/* Map */}
      <MapContainer center={[YEREVAN.lat, YEREVAN.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapInit center={center} zoom={13} />
        {storesWithDist.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={createIcon(selected?.id === store.id)}
            eventHandlers={{ click: () => setSelected(store) }}
          />
        ))}
      </MapContainer>

      {/* Store drawer */}
      <AnimatePresence>
        {selected && (
          <StoreDrawer
            store={selected}
            allProducts={allProducts}
            userCoords={userCoords}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StoreDrawer({ store, allProducts, userCoords, onClose }) {
  const storeProducts = allProducts.filter(p => (store.product_ids || []).includes(p.id))
  const dist = userCoords ? haversine(userCoords.lat, userCoords.lng, store.lat, store.lng) : null
  const brandCover = store.brand?.cover_url
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.42, ease: EASE }}
      className="absolute bottom-0 left-0 right-0 z-[1001] bg-[#080808] border-t border-white/10"
      style={{ maxHeight: '65vh', overflow: 'auto' }}
    >
      {/* Brand cover banner */}
      {brandCover && (
        <div
          className="w-full h-28 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${brandCover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
        </div>
      )}

      <div className="px-8 pt-6 pb-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            {/* Brand name */}
            <p className="text-[11px] tracking-[0.25em] text-gold font-sans mb-1 uppercase">
              {store.brand?.name || ''}
            </p>
            {/* Store name */}
            <h2 className="font-serif text-3xl text-cream leading-tight">{store.name}</h2>
            {/* Location + distance */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-gray/60" />
                <span className="text-[12px] text-gray font-sans">{store.city}</span>
              </div>
              {dist != null && (
                <span className="text-[12px] text-gold font-sans font-medium">
                  {fmtDist(dist)} away
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray/50 hover:text-cream transition-colors p-1 mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mb-8">
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-[11px] tracking-widest font-sans text-cream hover:border-gold hover:text-gold transition-colors duration-200"
          >
            GET DIRECTIONS
            <ExternalLink size={11} />
          </a>
          <Link
            to={`/home?brand=${store.brand?.slug || ''}`}
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black text-[11px] tracking-widest font-sans hover:bg-cream transition-colors duration-200 group"
          >
            BROWSE COLLECTION
            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products grid */}
        {storeProducts.length > 0 && (
          <>
            <p className="text-[10px] tracking-widest text-gray/60 font-sans mb-4 uppercase">
              Available in this store
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {storeProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group block"
                    onClick={onClose}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
                      <img
                        src={product.images?.[0]?.url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-gray font-sans mt-1.5 truncate">{product.name}</p>
                    <p className="text-[11px] text-gold font-sans">${product.price_local}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {storeProducts.length === 0 && (
          <p className="text-[12px] text-gray/50 font-sans">
            Visit the store to explore the full {store.brand?.name || ''} collection in person.
          </p>
        )}
      </div>
    </motion.div>
  )
}
