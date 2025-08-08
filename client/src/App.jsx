import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import Store from "./pages/Store"
import ProductDetail from "./pages/ProductDetail"
import Header from "./components/Header"
import PrivateRoute from "./components/PrivateRoute"
import ProductionGuard from "./components/ProductionGuard"
import ForgotPassword from "./components/ForgotPassword"
import ResetPassword from "./components/ResetPassword"
import SessionExpiredModal from "./components/SessionExpiredModal"
import TokenTimers from "./components/TokenTimers"

// Admin components (only in development)
const isDevelopment = import.meta.env.DEV
let AdminPanel = null

if (isDevelopment) {
  const { default: AdminPanelComponent } = await import("./pages/AdminPanel")
  AdminPanel = AdminPanelComponent
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        
        {/* Authentication routes - Protected in production */}
        <Route 
          path="/sign-in" 
          element={
            <ProductionGuard>
              <SignIn />
            </ProductionGuard>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <ProductionGuard>
              <SignUp />
            </ProductionGuard>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ProductionGuard>
              <ForgotPassword />
            </ProductionGuard>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <ProductionGuard>
              <ResetPassword />
            </ProductionGuard>
          } 
        />
        
        {/* Private routes - Protected in production */}
        <Route element={<PrivateRoute />}>
          <Route 
            path="/profile" 
            element={
              <ProductionGuard>
                <Profile />
              </ProductionGuard>
            } 
          />
          {isDevelopment && AdminPanel && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
  
}
