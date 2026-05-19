import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Splash from './screens/Splash'
import MainLayout from './screens/MainLayout'

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-bg-charcoal text-text-cream relative">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Splash key="splash" />
        ) : (
          <MainLayout key="main" />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
