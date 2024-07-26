<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.js'

export default function Login () {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const navigate = useNavigate()
  const { setAuthState } = useAuth()

  const updateForm = e => {
    const { name, value } = e.target
    setForm(prevForm => ({ ...prevForm, [name]: value }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    const response = await fetch('http://localhost:4000/record/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    }).catch(error => {
      window.alert(error)
      return
    })

    if (response.ok) {
      setAuthState({ isAuthenticated: true, role: DataTransfer.role })
      navigate('/accountSummary')
    } else {
      window.alert('An error occurred during the login process...')
      setForm({ email: '', password: '' })
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md'>
        <h3 className='text-2xl font-bold mb-4'>Login</h3>
        <form
          onSubmit={onSubmit}
          className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'
        >
          <div className='mb-4'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='email'
            >
              Email:
            </label>
            <input
              type='email'
              name='email'
              id='email'
              value={form.email}
              onChange={updateForm}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            />
          </div>
          <div className='mb-6'>
            <label
              className='block text-gray-700 text-sm font-bold mb-2'
              htmlFor='password'
            >
              Password:
            </label>
            <input
              type='password'
              name='password'
              id='password'
              value={form.password}
              onChange={updateForm}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
            />
          </div>
          <div className='flex items-center justify-between'>
            <input
              type='submit'
              value='Login'
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            />
          </div>
        </form>
      </div>
    </div>
  )
=======
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/record/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/accountSummary');
      } else {
        window.alert('Invalid username or password');
        setForm({ username: '', password: '' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      window.alert('An error occurred during the login process.');
    }
  };

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={updateForm}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateForm}
          />
        </div>
        <br />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
>>>>>>> d9877e049e9b13a766129670cbe2d27556b37b29
}
