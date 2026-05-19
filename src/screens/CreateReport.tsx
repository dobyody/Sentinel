import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, Dog, Construction, MapPin, CheckCircle2, ChevronLeft, Image as ImageIcon } from 'lucide-react'

// Defined categories based on 3-tap flow requirement
const CATEGORIES = [
  { id: 'threat', label: 'Threat', desc: 'Harassment, aggressive behavior', icon: <AlertCircle size={24} strokeWidth={1.5} />, color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  { id: 'infra', label: 'Infrastructure', desc: 'Unlit street, open manhole', icon: <AlertTriangle size={24} strokeWidth={1.5} />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { id: 'animal', label: 'Animal Hazard', desc: 'Stray dogs, aggressive animals', icon: <Dog size={24} strokeWidth={1.5} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { id: 'obstacle', label: 'Obstacle', desc: 'Blocked path, construction', icon: <Construction size={24} strokeWidth={1.5} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' }
];

type Step = 'category' | 'location' | 'success';

export default function CreateReport({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('category');
  

  const handleSelectCat = () => {
    
    setStep('location');
  };

  const handleSubmit = () => {
    setStep('success');
    // Auto close after success
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md z-40"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 w-full bg-bg-secondary border-t border-border-subtle rounded-t-[32px] z-50 shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-border-subtle">
          {step === 'location' ? (
            <button onClick={() => setStep('category')} className="text-text-primary p-1">
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
          ) : (
            <button onClick={onClose} className="text-text-secondary text-[15px] px-2">
              Cancel
            </button>
          )}
          
          <h3 className="text-[16px] font-semibold text-text-primary">
            {step === 'category' ? 'Report Incident' : step === 'location' ? 'Confirm Location' : ''}
          </h3>
          
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="p-4 relative min-h-[320px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CATEGORY SELECTION */}
            {step === 'category' && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-3"
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCat()}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${cat.border} ${cat.bg} hover:bg-bg-tertiary transition-colors text-left`}
                  >
                    <div className={`${cat.color}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className={`text-[16px] font-semibold ${cat.color}`}>{cat.label}</h4>
                      <p className="text-text-secondary text-[13px]">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* STEP 2: LOCATION CONFIRMATION */}
            {step === 'location' && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full"
              >
                {/* Fake mini map for pin dragging simulation */}
                <div className="w-full h-40 rounded-2xl bg-bg-tertiary border border-border-subtle relative overflow-hidden mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center grayscale" />
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                    <div className="w-3 h-3 bg-accent-blue rounded-full shadow-[0_0_10px_#0095F6]"></div>
                  </div>
                  <div className="absolute bottom-2 bg-bg-secondary/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-subtle text-text-primary text-[12px] flex items-center gap-1.5 z-10">
                    <MapPin size={12} className="text-accent-blue" />
                    Current GPS Location
                  </div>
                </div>

                <textarea 
                  placeholder="Optional details..."
                  className="w-full h-16 bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-text-primary text-[14px] placeholder:text-text-secondary resize-none mb-4"
                />

                <div className="mt-auto flex gap-3">
                  <button className="p-4 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary flex items-center justify-center">
                    <ImageIcon size={20} strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-1 py-4 rounded-xl bg-text-primary text-bg-primary font-bold text-[16px]"
                  >
                    Submit Report
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full absolute inset-0"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <CheckCircle2 size={64} className="text-green-500 mb-4" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Report Logged</h3>
                <p className="text-text-secondary text-center text-[14px]">
                  Warning sent to nearby users.<br/>Thank you for keeping the city safe.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
