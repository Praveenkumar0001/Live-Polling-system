import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Remove StrictMode to prevent double mounting
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)