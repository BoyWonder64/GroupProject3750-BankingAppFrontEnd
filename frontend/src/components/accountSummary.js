import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccountsInfo () {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    //before the page runs, do this
    async function fetchData () {
      try {
        const response = await fetch(
          'http://localhost:4000/record/accountSummary',
          {
            method: 'GET',
            credentials: 'include'
          }
        )

        if (!response.ok) {
          if (response.status === 200) {
            navigate('/login')
          } else {
            const message = `An error occurred: ${response.statusText}`
            window.alert(message)
          }
          return
        }
        if (response.status === 201) {
          window.alert('Please login first!')
          navigate('/login')
        }

        const accountResponse = await response.json()
        setUser(accountResponse)
      } catch (error) {
        window.alert('Failed to fetch account information')
        console.error(error)
      }
    }

    fetchData()
  }, [navigate]) //before you run the page

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Account Summary</h1>
      <p>AccountID: {user.accountID}</p>
      <p>Username: {user.username}</p>
    </div>
  )
}
