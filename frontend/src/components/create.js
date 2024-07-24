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
        setForm({ lastName: "", firstName: "", email: "" , phone: "", password: "", });
        navigate('/create')
      } else {
        navigate('/accountSummary')
      }
    
    } catch (err) {
      window.alert("Accocount Creation has has failed: " + err.message)
      setForm({ lastName: "", firstName: "", email: "" , phone: "", password: "", });
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
      <fieldset>
  <legend>Select a role:</legend>

  <div>
    <input type="radio" id="admin" name="roleChoice" value="admin" checked />
    <label for="admin">Admin</label>
  </div>

  <div>
    <input type="radio" id="employee" name="roleChoice" value="employee" />
    <label for="employee">Employee</label>
  </div>

  <div>
    <input type="radio" id="customer" name="roleChoice" value="customer" />
    <label for="customer">Customer</label>
  </div>
</fieldset>
      <button type='submit'>Create Account</button>
    </form>
  )
}
