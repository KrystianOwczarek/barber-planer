import React from 'react'
import ReactDOM from 'react-dom/client'
import BarberPlaner from './BarberPlaner.jsx'
import './index.css'
import '../firebase'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BarberPlaner />
  </React.StrictMode>,
)
