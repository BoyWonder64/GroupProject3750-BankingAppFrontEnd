import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BankingSummary () {
  const [form, setForm] = useState({
    transactionType: 'deposit',
    amount: 0,
    account: 'savings'
  })
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  const handleForm = e => {
    const { name, value } = e.target
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }))
  }

  useEffect(() => {
    async function checkAuth () {
      try {
        console.log('inside frontend check auth')
        const response = await fetch(
          'http://localhost:4000/record/accountSummary',
          {
            method: 'GET',
            credentials: 'include'
          }
        )
        if (!response.ok) {
          console.log('Response has failed')
          if (response.status === 201) {
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

        setAuthenticated(true) //set the Auth state to True
      } catch (err) {
        navigate('/login')
      }
    }

    async function fetchData () {
      try {
        console.log('inside frontend account fetch')
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

    checkAuth()
    fetchData()
  }, [navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      console.log('inside frontend Banking Summary')
      const response = await fetch(
        'http://localhost:4000/record/bankingSummary',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(form)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'bankingSummary failed')
      }
      navigate('/accountSummary')
    } catch (err) {
      alert('Unable to complete transaction: ' + err.message)
    }
  }

  if (!authenticated) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <p>Savings: {user.savings}</p>
          <p>Checkings: {user.checkings}</p>
          <p>Investments: {user.investments}</p>
        </div>
        <label htmlFor='transactionType'>Transaction Type:</label>
        <br />
        <label htmlFor='deposit'>Deposit </label>
        <input
          type='radio'
          id='deposit'
          name='transactionType'
          value='deposit'
          required
          checked={form.transactionType === 'deposit'}
          onChange={handleForm}
        />
        <br />
        <label htmlFor='withdraw'>Withdrawal </label>
        <input
          type='radio'
          id='withdraw'
          name='transactionType'
          value='withdraw'
          checked={form.transactionType === 'withdraw'}
          onChange={handleForm}
        />
    
        <br />
        <br />
        <label htmlFor='account'>Account Type:</label>
        <br />
        <label htmlFor='savings'>Savings  </label>
        <input
          type='radio'
          id='savings'
          name='account'
          value='savings'
          required
          checked={form.account === 'savings'}
          onChange={handleForm}
        />
            <br />
            <label htmlFor='checkings'>Checking  </label>
        <input
          type='radio'
          id='checkings'
          name='account'
          value='checkings'
          checked={form.account === 'checkings'}
          onChange={handleForm}
        />
        <br />
        <label htmlFor='investments'>Investments  </label>
        <input
          type='radio'
          id='investments'
          name='account'
          value='investments'
          required
          checked={form.account === 'investments'}
          onChange={handleForm}
        />
        <br />
        <br />

        <input
          name='amount'
          type='number'
          value={form.amount}
          onChange={handleForm}
          required
        />
        <br />
        <br />
        <button type='submit'>Submit</button>
      </form>
      <div>
        <label>
        Transaction History
        </label>
        <p>"type": "deposit", "account": "investments", "amount": "14","timestamp": "2024-07-26T22:40:20.657Z"</p>
      </div>
    </div>
  );
}