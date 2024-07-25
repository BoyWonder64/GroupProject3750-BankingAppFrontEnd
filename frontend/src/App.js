import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Create from './components/create.js'
import Login from './components/login.js'
import Logout from './components/logout.js'
import AccountsInfo from './components/accountSummary.js'
import BankingSummary from './components/bankingSummary.js'
import { AuthProvider } from './auth/auth.js'
import ProtectedRoute from './components/protectedRoute.js'
import './index.css'

const App = () => {
  return (
    <AuthProvider>
      <div className='container mx-auto p-4'>
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
      </div>
    </AuthProvider>
  )
}

export default App

// We ned to figure out how to work with perms (admin, customers, employees) -- Using React Context to check
