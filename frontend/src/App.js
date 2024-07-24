import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Create from './components/create.js'
import Login from './components/login.js'
import Logout from './components/logout.js'
import AccountsInfo from './components/accountSummary.js'
import BankingSummary from './components/bankingSummary.js'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/create' element={<Create />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/account' element={<AccountsInfo />} />
        <Route path='/summary' element={<BankingSummary />} />
      </Routes>
    </div>
  )
}

export default App

// We ned to figure out how to work with perms (admin, customers, employees)
