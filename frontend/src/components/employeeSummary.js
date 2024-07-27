// Can view any account associated with a bank customer ID
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeSummary() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState('');
  const [amount, setAmount] = useState('');
  const [accountType, setAccountType] = useState('savings'); // Default to savings
  const [targetAccountID, setTargetAccountID] = useState('');
  const [targetAccountType, setTargetAccountType] = useState('savings'); // Default to savings
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
        } 
        else {
          if (response.status === 401) {
            navigate('/');
          } 
          else {
            window.alert('Failed to fetch accounts.');
          }
        }
      } 
      catch (error) {
        window.alert('Failed to fetch accounts.');
        console.error(error);
      }
    }

    fetchAccounts();
  }, [navigate]);

  // Deposit/Withdraw
  const handleTransaction = async (transactionType) => {
    try {
      const response = await fetch('http://localhost:4000/record/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountID: selectedAccountID,
          transactionType,
          accountType,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        window.alert('Transaction successful');
      } else {
        window.alert('Transaction failed.');
      }
    } catch (error) {
      window.alert('Transaction failed.');
      console.log("Transaction error");
    }
  };

  // Transfer between users
  const handleTransfer = async () => {
    try {
      const response = await fetch('http://localhost:4000/record/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromAccountID: selectedAccountID,
          fromAccountType: accountType,
          toAccountID: targetAccountID,
          toAccountType: targetAccountType,
          amount: parseFloat(amount),
        }),
      });

      if (response.ok) {
        window.alert('Transfer successful');
      } else {
        window.alert('Transfer failed.');
      }
    } catch (error) {
      window.alert('Transfer failed.');
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <h2>View and Manage Customer Accounts</h2>
        <ul>
          {accounts.map(account => (
            <li key={account.accountID}>
              Account ID: {account.accountID}, Username: {account.username}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Deposit or Withdraw Money</h2>
        <label>
            Account ID:
          <input
            type="text"
            value={selectedAccountID}
            onChange={e => setSelectedAccountID(e.target.value)}
          />
        </label>
        <br />
        <label>
          Account Type:
          <select
            value={accountType}
            onChange={e => setAccountType(e.target.value)}
          >
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="investments">Investments</option>
          </select>
        </label>
        <br />
        <label>
          Amount:
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </label>
        <br />
        <button onClick={() => handleTransaction('deposit')}>Deposit</button>
        <button onClick={() => handleTransaction('withdraw')}>Withdraw</button>
      </div>
      <div>
        <h2>Transfer Money</h2>
        <label>
          Target Account ID:
          <input
            type="text"
            value={targetAccountID}
            onChange={e => setTargetAccountID(e.target.value)}
          />
        </label>
        <br />
        <label>
          Target Account Type:
          <select
            value={targetAccountType}
            onChange={e => setTargetAccountType(e.target.value)}
          >
            <option value="savings">Savings</option>
            <option value="checking">Checking</option>
            <option value="investments">Investments</option>
          </select>
        </label>
        <br />
        <button onClick={handleTransfer}>Transfer</button>
      </div>
    </div>
  );
}
