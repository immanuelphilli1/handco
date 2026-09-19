import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { defaultSignedInUser, type AuthUser } from './data/auth'
import { getAccountPath } from './data/accountRoutes'
import { ShopProvider } from './context/ShopContext'
import { AboutPage } from './pages/AboutPage'
import { AccountPage } from './pages/AccountPage'
import { HomePage } from './pages/HomePage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { ReturnRefundPolicyPage } from './pages/ReturnRefundPolicyPage'
import { IntellectualPropertyPage } from './pages/IntellectualPropertyPage'
import { SecurePaymentsPage } from './pages/SecurePaymentsPage'
import { ShippingDeliveryPolicyPage } from './pages/ShippingDeliveryPolicyPage'
import { WarrantyPolicyPage } from './pages/WarrantyPolicyPage'

function AppRoutes() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  const handleSignedIn = useCallback((email: string) => {
    setAuthUser({ ...defaultSignedInUser, email })
  }, [])

  const handleSignOut = useCallback(() => {
    setAuthUser(null)
  }, [])

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/products/:productId"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/categories"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/categories/:categoryId"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/cart"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/checkout"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/order-complete"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/wishlist"
        element={
          <HomePage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <PrivacyPolicyPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/warranty"
        element={
          <WarrantyPolicyPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/shipping-delivery"
        element={
          <ShippingDeliveryPolicyPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/return-refund"
        element={
          <ReturnRefundPolicyPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/secure-payments"
        element={
          <SecurePaymentsPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/intellectual-property"
        element={
          <IntellectualPropertyPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route
        path="/account/:section"
        element={
          <AccountPage
            authUser={authUser}
            onSignedIn={handleSignedIn}
            onSignOut={handleSignOut}
          />
        }
      />
      <Route path="/account" element={<Navigate to={getAccountPath('orders')} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <AppRoutes />
      </ShopProvider>
    </BrowserRouter>
  )
}

export default App
