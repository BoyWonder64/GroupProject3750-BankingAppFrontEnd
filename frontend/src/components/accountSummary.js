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
            headers: {"Content-Type" : "application/json"},
            credentials: 'include',
          }
        )


        if (!response.ok) {
          if (response.status === 200) {
            navigate('/')
          } else {
            const message = `An error occurred: ${response.statusText}`
            window.alert(message)
          }
          return
        }
        if (response.status === 201) {
          window.alert('Please login first!')
          navigate('/')
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
    <div className='w-full max-w-md'>
      <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100'>Account Summary</h2>
      <p className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline' >AccountID: {user.accountID}</p>
      <p className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline' >Username: {user.username}</p>
      <p className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline' >Investments: {user.investments}</p>
      <p className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline' >Checking: {user.checkings}</p>
      <p className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline' >Savings: {user.savings}</p>
    </div>
  )
}
