import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Profile from './pages/Profile'
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import TokenExpiryNotification from './components/TokenExpiryNotification'
import SessionExpiredModal from './components/SessionExpiredModal'
import { useState } from 'react'
import { useUser } from './hooks/useUser'
import ProductionGuard from './components/ProductionGuard'
import AdminPanel from './pages/AdminPanel'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false)
  const { signOut } = useUser()

  const handleSessionExpired = () => {
    signOut() // Usar el método del context
    setIsSessionExpiredModalOpen(true) // Abre el modal
  }

  const handleSignInAgain = () => {
    setIsSessionExpiredModalOpen(false)
    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = '/sign-in'
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <TokenExpiryNotification onSessionExpired={handleSessionExpired} />
        <SessionExpiredModal
          isOpen={isSessionExpiredModalOpen}
          onClose={() => setIsSessionExpiredModalOpen(false)}
          onSignIn={handleSignInAgain}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/admin"
                element={
                  <ProductionGuard>
                    <AdminPanel />
                  </ProductionGuard>
                }
              />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

