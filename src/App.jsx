import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import SuperHeader from './components/SuperHeader'
import ProtectedRoute from './components/ProtectedRoute'
import OfflineBanner from './components/OfflineBanner'
import InstallBanner from './components/InstallBanner'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import MapView from './pages/MapView'
import ProductDetail from './pages/ProductDetail'
import BrandPage from './pages/BrandPage'
import Featured from './pages/Featured'
import TryOn from './pages/TryOn'
import Checkout from './pages/Checkout'
import Account from './pages/Account'

const SIDEBAR_PAGES = ['/home', '/map', '/try-on', '/featured', '/product', '/brand', '/checkout', '/account']
const NO_HEADERS   = ['/', '/login', '/onboarding']

function AppRoutes() {
  const location = useLocation()
  const hasSidebar   = SIDEBAR_PAGES.some(p => location.pathname.startsWith(p))
  const hasHeaders   = !NO_HEADERS.includes(location.pathname)

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div
        className={`flex-1 min-h-screen transition-all duration-700 ${
          hasSidebar ? 'md:ml-[220px]' : ''
        } ${
          hasHeaders ? 'pt-[57px] md:pt-[103px]' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ── Public routes ── */}
            <Route path="/"           element={<Landing />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* ── Protected routes — require JWT ── */}
            <Route path="/home"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/map"        element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/product/:id"      element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/brand/:brandId"   element={<ProtectedRoute><BrandPage /></ProtectedRoute>} />
            <Route path="/featured"  element={<ProtectedRoute><Featured /></ProtectedRoute>} />
            <Route path="/try-on"    element={<ProtectedRoute><TryOn /></ProtectedRoute>} />
            <Route path="/checkout"  element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/account"   element={<ProtectedRoute><Account /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Global fixed headers — above everything */}
      <Navbar />
      <SuperHeader />

      {/* Global UX overlays */}
      <OfflineBanner />
      <InstallBanner />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
