import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Create () {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: ""
  })


  const handleChange = e => {
    const { name, value } = e.target
    setForm(prevForm => ({...prevForm, [name]: value
    }))
  }

  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()

    console.log('Form submitted:', form)
    try {
      const response = await fetch('http://localhost:4000/record/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form)
      })

      if (response.status === 400) {
        window.alert("Email Already Exists")
        setForm({ username: "", password: ""});
        navigate('/create')
      } else {
        navigate('/accountSummary')
      }
    
    } catch (err) {
      window.alert("Accocount Creation has has failed: " + err.message)
      setForm({ username: "", password: "", role: "" });
    }
  }

  return (
  
    <form onSubmit={handleSubmit}>
    <h1>Account Creation</h1>
      <div>
        <label>Username:</label>
        <br/>
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
        />
      </div>
      <label>Password: </label>
      <div>
        <input
          name="password"
          type="text"
          value={form.password}
          onChange={handleChange}
        />
      </div>
      <label>Role: </label>
      <label>admin, customer, or employee </label>
      <div>
        <input
          name="role"
          type="text"
          value={form.role}
          onChange={handleChange}
        />
      </div>
      <button type='submit'>Create Account</button>
    </form>
  )
}
