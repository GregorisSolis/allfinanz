import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { UserProvider } from './contexts/UserContext'
import { TransactionProvider } from './contexts/TransactionContext'
import './global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <TransactionProvider>
        <App />
      </TransactionProvider>
    </UserProvider>
  </React.StrictMode>
)
