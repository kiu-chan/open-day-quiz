import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TailwindDemo from './TailwindDemo.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TailwindDemo />
  </StrictMode>,
)
