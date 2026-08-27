import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { defaultSignedInUser, type AuthUser } from './data/auth'
import { getAccountPath } from './data/accountRoutes'
import { ShopProvider } from './context/ShopContext'
import { AccountPage } from './pages/AccountPage'
import { HomePage } from './pages/HomePage'

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
