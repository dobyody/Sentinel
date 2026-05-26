import { motion, AnimatePresence } from 'framer-motion'
import { Map, Zap, User, Plus } from 'lucide-react'

interface NavProps {
  activeTab: 'map' | 'feed' | 'profile';
  onChangeTab: (tab: 'map' | 'feed' | 'profile') => void;
  onReport: () => void;
  isHidden?: boolean;
}

export default function NavigationBar({ activeTab, onChangeTab, onReport, isHidden = false }: NavProps) {
  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-40"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}
        >
          <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-[2rem] p-1.5 flex items-center justify-between shadow-2xl">
            <NavItem 
              icon={<Map size={24} strokeWidth={1.5} />} 
              isActive={activeTab === 'map'} 
              onClick={() => onChangeTab('map')} 
            />
            
            <NavItem 
              icon={<Zap size={24} strokeWidth={1.5} />} 
              isActive={activeTab === 'feed'} 
              onClick={() => onChangeTab('feed')} 
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onReport}
              className="w-12 h-12 rounded-full bg-text-primary text-bg-primary flex items-center justify-center mx-1 z-10"
            >
              <Plus size={26} strokeWidth={2} />
            </motion.button>

            <NavItem 
              icon={<User size={24} strokeWidth={1.5} />} 
              isActive={activeTab === 'profile'} 
              onClick={() => onChangeTab('profile')} 
            />
            
            <div className="w-10 hidden"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function NavItem({ icon, isActive, onClick }: { icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-12 h-12 relative z-10 transition-colors duration-200 ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
    >
      {icon}
      {isActive && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-text-primary"
        />
      )}
    </button>
  )
}
