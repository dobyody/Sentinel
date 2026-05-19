import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WebApp from '@twa-dev/sdk'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

console.log('WebApp from sdk:', WebApp);
if (WebApp && WebApp.ready) {
  WebApp.ready();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
