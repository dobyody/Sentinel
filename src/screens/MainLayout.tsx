import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MapScreen from './MapScreen'
import SocialFeed from './SocialFeed'
import NavigationBar from '../components/NavigationBar'
import CreateReport from './CreateReport'
import ProfileScreen from './ProfileScreen'

type Tab = 'map' | 'feed' | 'profile';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [isReporting, setIsReporting] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full relative"
    >
      {/* Background Map - always present but might be blurred or covered */}
      <MapScreen activeTab={activeTab} />

      {/* Main Overlay Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <SocialFeed key="feed" />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen key="profile" />
        )}
      </AnimatePresence>

      {/* Report Modal / Bottom Sheet */}
      <AnimatePresence>
        {isReporting && (
          <CreateReport key="report" onClose={() => setIsReporting(false)} />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <NavigationBar 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
        onReport={() => setIsReporting(true)}
        isHidden={isReporting}
      />
    </motion.div>
  )
}
