import React from 'react'
import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import Create from './components/create.js'
import Login from './components/login.js'
import Logout from './components/logout.js'
import AccountsInfo from './components/accountSummary.js'
import BankingSummary from './components/bankingSummary.js'
import { AuthProvider } from './auth/auth.js'
import ProtectedRoute from './components/protectedRoute.js'
import './index.css'

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TESTING RETRIEVAL
    // setAuthState({ isAuthenticated: true, role: 'admin' });
    // setLoading(false);

    fetch('/record/auth-check', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        setAuthState({ isAuthenticated: true, role: data.role })
      })
      .catch(() => {
        setAuthState({ isAuthenticated: false, role: null })
      })
      .finally(() => setLoading(false))
  }, [])

  const renderProtectedRoute = (Component, requiredRole) => {
    if (loading) return <div>Loading...</div>

    if (
      authState.isAuthenticated &&
      (!requiredRole || authState.role === requiredRole)
    ) {
      return <Component />
    }
    return <Navigate to='/' />
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route
          path='/create'
          element={<ProtectedRoute element={<Create />} role='admin' />}
        />
        <Route
          path='/logout'
          element={<ProtectedRoute element={<Logout />} />}
        />
        <Route
          path='/account'
          element={<ProtectedRoute element={<AccountsInfo />} />}
        />
        <Route
          path='/summary'
          element={<ProtectedRoute element={<BankingSummary />} />}
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
