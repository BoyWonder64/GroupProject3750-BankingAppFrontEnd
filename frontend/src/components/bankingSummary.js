import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const getTransactionHistory = async (customerId) => {
  const response = await fetch(`http://localhost:4000/record/transactionHistory`);
  const data = await response.json();
  return data;
};

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
        'http://localhost:4000/record/accountSummary/bankingSummary',
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
    <form onSubmit={handleSubmit}>
      <div>
        <p>Savings: {user.savings}</p>
        <p>Checkings: {user.checkings}</p>
        <p>Investments: {user.investments}</p>
      </div>
      <label for='transactionType'>Transaction Type:</label>
      <br></br>
      <input
        type='radio'
        id='deposit'
        name='transactionType'
        value='deposit'
        required
        checked={form.transactionType === 'deposit'}
        onChange={handleForm}
      />
      <label for='deposit'>Deposit</label>
      <input
        type='radio'
        id='withdraw'
        name='transactionType'
        value='withdraw'
        checked={form.transactionType === 'withdraw'}
        onChange={handleForm}
      />
      <label for='withdraw'>Withdrawal</label>
      <br></br>
      <br></br>
      <label for='transactionType'>AccountType:</label>
      <br></br>
      <input
        type='radio'
        id='savings'
        name='account'
        value='savings'
        required
        checked={form.account === 'savings'}
        onChange={handleForm}
      />
      <label for='savings'>Savings</label>
      <input
        type='radio'
        id='checking'
        name='account'
        value='checking'
        checked={form.account === 'checking'}
        onChange={handleForm}
      />
      <label for='checking'>Checking</label>
      <br></br>
      <br></br>
      <input
        name='amount'
        type='number'
        value={form.amount}
        onChange={handleForm}
        required
      />
       <label for='investments'>Investments</label>
      <br></br>
      <br></br>
      <input
        name='amount'
        type='number'
        value={form.amount}
        onChange={handleForm}
        required
      />
      <button type='submit'>Submit</button>
    </form>
  )
}
