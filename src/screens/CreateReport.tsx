import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, Dog, Construction, MapPin, CheckCircle2, ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useTelegramLocation } from '../hooks/useTelegramLocation'

const CATEGORIES = [
  { id: 'threat', label: 'Threat', desc: 'Harassment, aggressive behavior', icon: <AlertCircle size={24} strokeWidth={1.5} />, color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  { id: 'infra', label: 'Infrastructure', desc: 'Unlit street, open manhole', icon: <AlertTriangle size={24} strokeWidth={1.5} />, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { id: 'animal', label: 'Animal Hazard', desc: 'Stray dogs, aggressive animals', icon: <Dog size={24} strokeWidth={1.5} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { id: 'obstacle', label: 'Obstacle', desc: 'Blocked path, construction', icon: <Construction size={24} strokeWidth={1.5} />, color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30' }
];

type Step = 'category' | 'location' | 'success';

function MapEvents({ setReportPos }: { setReportPos: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setReportPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function CreateReport({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('category');
  const { position: currentPosition } = useTelegramLocation([47.0150, 28.8400]);
  const [reportPos, setReportPos] = useState<[number, number] | null>(null);

  const handleSelectCat = () => {
    setReportPos(currentPosition); // Default to user's live position
    setStep('location');
  };

  const handleSubmit = () => {
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const createReportMarkerIcon = () => {
    return divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-accent-blue opacity-30 animate-pulse"></div>
          <div class="w-4 h-4 rounded-full bg-accent-blue border-[1.5px] border-bg-primary shadow-sm shadow-accent-blue/50"></div>
        </div>
      `,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
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
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 w-full bg-bg-secondary border-t border-border-subtle rounded-t-[32px] z-50 shadow-2xl flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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

        <div className="p-4 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
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

            {step === 'location' && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full absolute inset-4"
              >
                <p className="text-text-secondary text-[13px] mb-2 text-center">Drag map to adjust pin</p>
                <div className="w-full h-48 rounded-2xl bg-bg-tertiary border border-border-subtle relative overflow-hidden mb-4 z-0">
                  <MapContainer 
                    center={currentPosition} 
                    zoom={15} 
                    zoomControl={false}
                    className="w-full h-full z-0"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution=""
                    />
                    <MapEvents setReportPos={setReportPos} />
                    {reportPos && (
                      <Marker position={reportPos} icon={createReportMarkerIcon()} />
                    )}
                  </MapContainer>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-bg-secondary/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-subtle text-text-primary text-[12px] flex items-center gap-1.5 z-10 pointer-events-none">
                    <MapPin size={12} className="text-accent-blue" />
                    {reportPos === currentPosition ? "Current GPS" : "Custom Pin"}
                  </div>
                </div>

                <textarea 
                  placeholder="Optional details..."
                  className="w-full h-16 bg-bg-tertiary border border-border-subtle rounded-xl p-3 outline-none text-text-primary text-[14px] placeholder:text-text-secondary resize-none mb-4"
                />

                <div className="mt-auto flex gap-3 pb-2">
                  <button className="p-4 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary flex items-center justify-center hover:bg-bg-secondary transition-colors">
                    <ImageIcon size={20} strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-1 py-4 rounded-xl bg-text-primary text-bg-primary font-bold text-[16px] hover:opacity-90 transition-opacity"
                  >
                    Submit Report
                  </button>
                </div>
              </motion.div>
            )}

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
