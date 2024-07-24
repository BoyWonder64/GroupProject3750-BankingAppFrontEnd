import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Logout () {
  const navigate = useNavigate()

  useEffect(() => {
    async function run () {
      await fetch('http://localhost:4000/record/logout', {
        method: 'POST',
        credentials: 'include'
      })
      navigate('/login')
    }
    run()
  }, [navigate])

  return;
}
