import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer
      position="bottom-right"
      autoClose={2500}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: '#1a1a24',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#e0e0e0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        padding: '10px 14px',
      }}
    />
  </StrictMode>,
)
