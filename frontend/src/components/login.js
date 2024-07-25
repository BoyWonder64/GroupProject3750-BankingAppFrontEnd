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
}
