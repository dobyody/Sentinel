import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WebApp from '@twa-dev/sdk'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

console.log('WebApp from sdk:', WebApp);
if (WebApp && WebApp.ready) {
  WebApp.ready();
  try {
    WebApp.expand();
    // Use optional chaining in case SDK version doesn't support these yet
    if (WebApp.disableVerticalSwipes) WebApp.disableVerticalSwipes();
    if (WebApp.setHeaderColor) WebApp.setHeaderColor('#000000');
    if (WebApp.setBackgroundColor) WebApp.setBackgroundColor('#000000');
  } catch (e) {
    console.error('Error configuring WebApp:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
