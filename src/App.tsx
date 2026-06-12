import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './lib/auth'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

interface AuthContextType {
  session: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  return useContext(AuthContext)!
}

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = auth.getSession()
    if (s) setSession(s)
    setLoading(false)

    const unsub = auth.onAuthStateChanged((s) => {
      setSession(s)
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
