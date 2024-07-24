import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Create from './components/create.js'
import Login from './components/login.js'
import Logout from './components/logout.js'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/create' element={<Create />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<Logout />} />
      </Routes>
    </div>
  )
}

export default App
