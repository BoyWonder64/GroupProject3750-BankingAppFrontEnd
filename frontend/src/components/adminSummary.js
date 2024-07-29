import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSummary() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState('');
  const [selectedRole, setSelectedRole] = useState('Customer');
  const navigate = useNavigate();

  useEffect(() => {
    // Get accounts
    async function fetchAccounts() {
      try {
        const response = await fetch('http://localhost:4000/record/allAccounts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const accountsData = await response.json();
          setAccounts(accountsData);
        } else {
          if (response.status === 401) {
            navigate('/');
          } else {
            window.alert('Failed to fetch accounts.');
          }
        }
      } catch (error) {
        window.alert('Failed to fetch accounts.');
        console.error(error);
      }
    }

    fetchAccounts();
  }, [navigate]);

  const handleRoleChange = async () => {
    try {
      const response = await fetch(`http://localhost:4000/record/changeRole/${selectedAccountID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        window.alert('Role updated successfully.');
      } else {
        window.alert('Failed to update role.');
      }
    } catch (error) {
      window.alert('Failed to update role.');
      console.error(error);
    }
  };

  const handleUsernameChange = (e) => {
    const selectedUsername = e.target.value;
    const account = accounts.find(acc => acc.username === selectedUsername);
    if (account) {
      setSelectedAccountID(account.accountID);
    }
  };

  return (
    <div>
      <div>
        <h2>View and Manage Customer Accounts</h2>
        <ul>
          {accounts.map(account => (
            <li key={account.accountID}>
              User: {account.username} Role: {account.role}
            </li>
          ))}
        </ul>
      </div>
      <br></br>
      <div>
        <label>
          Select Username:
          <select onChange={handleUsernameChange}>
            <option value="">None Selected</option>
            {accounts.map(account => (
              <option key={account.accountID} value={account.username}>
                {account.username}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Role:
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
          </select>
        </label>
        <br />
        <button onClick={handleRoleChange}>Change Role</button>
      </div>
    </div>
  );
}