import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShieldCheck, AlertTriangle, ArrowRight, ChevronLeft, MapPin, Clock, Home, Briefcase, Navigation, X } from 'lucide-react'

interface MapScreenProps {
  activeTab: string;
}

export default function MapScreen({ activeTab }: MapScreenProps) {
  const isBlurred = activeTab !== 'map';
  const [position] = useState<[number, number]>([47.0105, 28.8322]); 
  const [isRouting, setIsRouting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Minimal flat marker icon
  const createMarkerIcon = (type: 'danger' | 'info' | 'user' | 'destination') => {
    let bg = 'bg-text-primary';
    let size = 'w-3 h-3';
    let pulse = false;

    if (type === 'danger') bg = 'bg-accent-red';
    if (type === 'info') bg = 'bg-text-secondary';
    if (type === 'destination') {
      bg = 'bg-text-primary';
      size = 'w-4 h-4';
    }
    if (type === 'user') {
      bg = 'bg-accent-blue';
      size = 'w-4 h-4';
      pulse = true;
    }

    const html = `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<div class="absolute w-8 h-8 rounded-full ${bg} opacity-20 animate-ping"></div>` : ''}
        <div class="${size} rounded-full ${bg} border-[1.5px] border-bg-primary shadow-sm"></div>
      </div>
    `;

    return divIcon({
      html,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const safeRouteCoords: [number, number][] = [
    [47.0105, 28.8322], // User
    [47.0115, 28.8335],
    [47.0130, 28.8325],
    [47.0140, 28.8310],
    [47.0150, 28.8300]  // Destination
  ];

  const handleSelectDestination = () => {
    setIsSearching(false);
    setIsRouting(true);
  };

  return (
    <div className="absolute inset-0 z-0 bg-bg-primary overflow-hidden">
      <motion.div 
        animate={{ 
          filter: isBlurred ? 'blur(8px) brightness(0.6)' : 'blur(0px) brightness(1)',
          scale: isBlurred ? 0.98 : 1
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full h-full relative"
      >
        <MapContainer 
          center={position} 
          zoom={15} 
          zoomControl={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
          />
          
          <Marker position={[47.0105, 28.8322]} icon={createMarkerIcon('user')} />
          
          {/* Hazards */}
          <Marker position={[47.0125, 28.8310]} icon={createMarkerIcon('danger')} />
          <Marker position={[47.0145, 28.8335]} icon={createMarkerIcon('danger')} />
          <Marker position={[47.0090, 28.8355]} icon={createMarkerIcon('danger')} />

          {(isRouting || isNavigating) && (
            <>
              <Marker position={[47.0150, 28.8300]} icon={createMarkerIcon('destination')} />
              <Polyline 
                positions={safeRouteCoords} 
                pathOptions={{ color: '#0095F6', weight: 4, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }} 
              />
            </>
          )}
        </MapContainer>

        {/* UI Overlay - Search Bar */}
        {!isRouting && !isSearching && !isNavigating && (
          <div className="absolute top-12 left-4 right-4 z-10">
            <div 
              className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg"
              onClick={() => setIsSearching(true)}
            >
              <Search size={20} className="text-text-secondary" strokeWidth={1.5} />
              <div className="text-text-secondary text-[15px] w-full">Where to, safely?</div>
            </div>
          </div>
        )}

        {/* UI Overlay - Search Full Screen */}
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-bg-primary z-50 flex flex-col"
            >
              <div className="pt-12 px-4 pb-4 border-b border-border-subtle flex items-center gap-3">
                <button onClick={() => setIsSearching(false)} className="p-2 -ml-2 text-text-primary">
                  <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                <div className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Search size={18} className="text-text-secondary" strokeWidth={1.5} />
                  <input 
                    type="text" 
                    placeholder="Search destination..." 
                    className="bg-transparent border-none outline-none text-text-primary text-[15px] w-full placeholder:text-text-secondary"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <h4 className="text-text-secondary text-[13px] font-semibold uppercase tracking-wider mb-2">Saved Places</h4>
                <button onClick={handleSelectDestination} className="flex items-center gap-4 p-3 hover:bg-bg-secondary rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary">
                    <Home size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left flex-1 border-b border-border-subtle pb-3">
                    <div className="text-text-primary font-semibold text-[15px]">Home</div>
                    <div className="text-text-secondary text-[13px]">Strada Alba Iulia 75</div>
                  </div>
                </button>
                <button onClick={handleSelectDestination} className="flex items-center gap-4 p-3 hover:bg-bg-secondary rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary">
                    <Briefcase size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left flex-1 border-b border-border-subtle pb-3">
                    <div className="text-text-primary font-semibold text-[15px]">Work</div>
                    <div className="text-text-secondary text-[13px]">Stefan cel Mare 105</div>
                  </div>
                </button>

                <h4 className="text-text-secondary text-[13px] font-semibold uppercase tracking-wider mt-4 mb-2">Recent Searches</h4>
                <button onClick={handleSelectDestination} className="flex items-center gap-4 p-3 hover:bg-bg-secondary rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary">
                    <Clock size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left flex-1 border-b border-border-subtle pb-3">
                    <div className="text-text-primary font-semibold text-[15px]">Central Station</div>
                    <div className="text-text-secondary text-[13px]">Aleea Gării 1</div>
                  </div>
                </button>
                <button onClick={handleSelectDestination} className="flex items-center gap-4 p-3 hover:bg-bg-secondary rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left flex-1 border-b border-border-subtle pb-3">
                    <div className="text-text-primary font-semibold text-[15px]">Valea Morilor Park</div>
                    <div className="text-text-secondary text-[13px]">Strada Grigore Alexandrescu</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI Overlay - Route Info */}
        <AnimatePresence>
          {isRouting && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-28 left-4 right-4 z-10"
            >
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-3xl p-4 shadow-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-text-primary font-semibold text-[17px] flex items-center gap-2">
                      <ShieldCheck size={18} className="text-accent-blue" strokeWidth={2} />
                      Safe Route Generated
                    </h3>
                    <p className="text-text-secondary text-[14px] mt-0.5">Avoiding 2 reported hazards</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsRouting(false); }}
                      className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary border border-border-subtle hover:bg-bg-primary transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsRouting(false); setIsNavigating(true); }}
                      className="w-8 h-8 rounded-full bg-accent-blue flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[13px] font-medium">
                  <div className="bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle text-text-primary">
                    18 min walk
                  </div>
                  <div className="bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle flex items-center gap-1.5 text-accent-red">
                    <AlertTriangle size={14} />
                    Detour active
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI Overlay - Navigation Info */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-12 left-4 right-4 z-10"
            >
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-4 shadow-lg flex justify-between items-center">
                <div>
                  <div className="text-text-primary font-bold text-lg flex items-center gap-2">
                    <Navigation size={20} className="text-accent-blue" />
                    Head North
                  </div>
                  <div className="text-text-secondary text-sm">Towards safe destination</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsNavigating(false); }}
                  className="px-4 py-2 rounded-xl bg-accent-red/20 text-accent-red font-semibold text-sm hover:bg-accent-red/30 transition-colors"
                >
                  End
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-0" />
      </motion.div>
    </div>
  )
}
