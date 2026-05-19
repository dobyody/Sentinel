import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Shield, AlertTriangle, ChevronLeft, Bell, Lock, Moon, LogOut } from 'lucide-react'

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'reports' | 'replies'>('reports');
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleShareStats = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="absolute inset-0 z-10 pt-16 px-4 pb-32 overflow-y-auto bg-bg-primary/80 backdrop-blur-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            Profile
          </h2>
          <div className="flex gap-4 text-text-primary">
            <button onClick={() => setShowSettings(true)}>
              <Settings size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Anonymous #1234</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-text-primary bg-bg-secondary px-2 py-1 rounded-lg text-[13px] border border-border-subtle flex items-center gap-1">
                <Shield size={14} className="text-accent-blue" />
                Trusted Reporter
              </span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center font-bold text-xl text-text-primary shadow-sm relative">
            A
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-bg-secondary border border-border-subtle rounded-full flex items-center justify-center">
              <Shield size={10} className="text-text-primary" />
            </div>
          </div>
        </div>

        <p className="text-text-primary text-[15px] font-light mb-4 leading-relaxed">
          Helping map the city's safe routes. 14 hazards reported this month.
        </p>

        <div className="flex items-center gap-4 text-text-secondary text-[14px] mb-6">
          <div className="flex flex-col">
            <span className="text-text-primary font-semibold">14</span>
            <span className="text-[12px]">Reports</span>
          </div>
          <div className="w-px h-6 bg-border-subtle"></div>
          <div className="flex flex-col">
            <span className="text-text-primary font-semibold">128</span>
            <span className="text-[12px]">People Helped</span>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <button className="flex-1 py-1.5 border border-border-strong rounded-xl text-[14px] font-semibold text-text-primary hover:bg-bg-secondary transition-colors">
            Generate New ID
          </button>
          <button onClick={handleShareStats} className="flex-1 py-1.5 border border-border-strong rounded-xl text-[14px] font-semibold text-text-primary hover:bg-bg-secondary transition-colors">
            Share Stats
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-border-subtle mb-4">
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 pb-3 text-[15px] transition-colors ${activeTab === 'reports' ? 'font-semibold text-text-primary border-b border-text-primary' : 'font-medium text-text-secondary'}`}
          >
            Reports
          </button>
          <button 
            onClick={() => setActiveTab('replies')}
            className={`flex-1 pb-3 text-[15px] transition-colors ${activeTab === 'replies' ? 'font-semibold text-text-primary border-b border-text-primary' : 'font-medium text-text-secondary'}`}
          >
            Replies
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {activeTab === 'reports' ? (
            <>
              <div className="p-4 rounded-2xl bg-bg-secondary/50 border border-border-subtle flex gap-3 items-start">
                <div className="p-2 rounded-full bg-orange-500/10 text-orange-500 mt-0.5">
                  <AlertTriangle size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] text-text-primary font-medium mb-1">Unlit street reported</p>
                  <p className="text-[13px] text-text-secondary mb-2">Westside Bridge · 2 days ago</p>
                  <div className="text-[12px] text-text-secondary bg-bg-tertiary px-2 py-1 rounded inline-block">
                    Helped 12 people reroute
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary/50 border border-border-subtle flex gap-3 items-start">
                <div className="p-2 rounded-full bg-accent-red/10 text-accent-red mt-0.5">
                  <AlertTriangle size={16} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] text-text-primary font-medium mb-1">Aggressive group reported</p>
                  <p className="text-[13px] text-text-secondary mb-2">Central Station · 5 days ago</p>
                  <div className="text-[12px] text-text-secondary bg-bg-tertiary px-2 py-1 rounded inline-block">
                    Helped 45 people reroute
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-bg-secondary/50 border border-border-subtle">
                <p className="text-[13px] text-text-secondary mb-1">Replying to Citizen #102</p>
                <p className="text-[14px] text-text-primary font-medium">Thanks for confirming, I took the alternative route.</p>
                <p className="text-[12px] text-text-secondary mt-2">1h ago</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-bg-primary z-50 flex flex-col"
          >
            <div className="pt-12 px-4 pb-4 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-20">
              <button onClick={() => setShowSettings(false)} className="text-text-primary flex items-center gap-1">
                <ChevronLeft size={24} strokeWidth={1.5} className="-ml-2" />
                <span>Back</span>
              </button>
              <span className="font-semibold text-text-primary">Settings</span>
              <div className="w-16" />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3 text-text-primary">
                    <Bell size={20} strokeWidth={1.5} />
                    <span>Push Notifications</span>
                  </div>
                  <div className="w-10 h-6 bg-accent-blue rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
                <button className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-colors">
                  <div className="flex items-center gap-3 text-text-primary">
                    <Moon size={20} strokeWidth={1.5} />
                    <span>Dark Mode</span>
                  </div>
                  <div className="w-10 h-6 bg-accent-blue rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </button>
                <button className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-colors mt-4">
                  <div className="flex items-center gap-3 text-text-primary">
                    <Lock size={20} strokeWidth={1.5} />
                    <span>Privacy Policy</span>
                  </div>
                </button>
                <button className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-colors text-accent-red mt-8">
                  <div className="flex items-center gap-3">
                    <LogOut size={20} strokeWidth={1.5} />
                    <span>Disconnect Data</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-bg-primary border border-border-subtle text-text-primary px-4 py-2 rounded-full text-[14px] shadow-lg z-50 whitespace-nowrap"
          >
            Copied stats to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
