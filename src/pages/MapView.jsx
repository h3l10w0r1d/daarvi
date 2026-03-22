import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, ArrowRight, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStores } from '../hooks/useStores'
import { useProducts } from '../hooks/useProducts'

const EASE = [0.76, 0, 0.24, 1]

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createCustomIcon(type) {
  const color = type === 'local' ? '#af0000' : '#cca350'
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;
      background:${color};
      border:2px solid #000;
      box-shadow: 0 0 0 1px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export default function MapView() {
  const { mode, toggleMode } = useApp()
  const [selectedStore, setSelectedStore] = useState(null)

  const { data: allStores = [] } = useStores()
  const { data: allProducts = [] } = useProducts({})

  const visibleStores = mode === 'local'
    ? allStores.filter(s => s.type === 'local')
    : allStores

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Mode toggle overlay */}
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

      {/* Legend */}
      <motion.div
        className="absolute bottom-6 left-4 z-[1000] p-4 border border-white/20"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
      >
        <p className="text-[10px] tracking-widest text-gray font-sans mb-3">LEGEND</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gold" />
            <span className="text-[10px] text-cream font-sans">GLOBAL STORE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red" />
            <span className="text-[10px] text-cream font-sans">LOCAL BOUTIQUE</span>
          </div>
        </div>
        <p className="text-[10px] text-gray font-sans mt-3">{visibleStores.length} stores visible</p>
      </motion.div>

      {/* Map */}
      <MapContainer
        center={[48, 10]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <AnimatePresence>
          {visibleStores.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={createCustomIcon(store.type)}
              eventHandlers={{ click: () => setSelectedStore(store) }}
            />
          ))}
        </AnimatePresence>
      </MapContainer>

      {/* Store drawer */}
      <AnimatePresence>
        {selectedStore && (
          <StoreDrawer store={selectedStore} onClose={() => setSelectedStore(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function StoreDrawer({ store, onClose }) {
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
                {store.type.toUpperCase()} STORE
              </span>
            </div>
            <h3 className="font-serif text-2xl text-cream">{store.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-gray" />
              <span className="text-xs text-gray font-sans">{store.city} · {store.distance}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray hover:text-cream transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Products */}
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
                  <Link to={`/product/${product.id}`} className="group block">
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

        <Link
          to={`/home`}
          className={`inline-flex items-center gap-2 mt-6 px-6 py-3 text-[10px] tracking-widest font-sans group transition-colors duration-300 ${
            store.type === 'local'
              ? 'bg-red text-cream hover:bg-cream hover:text-black'
              : 'bg-gold text-black hover:bg-cream'
          }`}
        >
          BROWSE {store.brand}
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}
