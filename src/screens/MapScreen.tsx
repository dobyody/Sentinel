import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShieldCheck, ChevronLeft, MapPin, Clock, Home, Briefcase, Navigation, X } from 'lucide-react'
import { MOCK_HAZARDS } from '../data/mockHazards'

interface MapScreenProps {
  activeTab: string;
}

export default function MapScreen({ activeTab }: MapScreenProps) {
  const isBlurred = activeTab !== 'map';
  const [position] = useState<[number, number]>([47.0150, 28.8400]); // Moved closer to mock data center
  const [isRouting, setIsRouting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState<any | null>(null);

  // Minimal flat marker icon
  const createMarkerIcon = (type: 'danger' | 'warning' | 'info' | 'user' | 'destination') => {
    let bg = 'bg-text-primary';
    let size = 'w-3 h-3';
    let pulse = false;

    if (type === 'danger') bg = 'bg-accent-red';
    if (type === 'warning') bg = 'bg-orange-500';
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

  const getMarkerType = (category: string) => {
    if (['Threat', 'Fire Safety'].includes(category)) return 'danger';
    if (['Animal Hazard', 'Traffic', 'Obstacle'].includes(category)) return 'warning';
    return 'info';
  };

  const safeRouteCoords: [number, number][] = [
    [47.0150, 28.8400], // User start
    [47.0165, 28.8415],
    [47.0180, 28.8405],
    [47.0195, 28.8420],
    [47.0210, 28.8435]  // Destination
  ];

  const altRouteCoords: [number, number][] = [
    [47.0150, 28.8400],
    [47.0160, 28.8440],
    [47.0190, 28.8450], // Goes near hazards
    [47.0210, 28.8435]
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
          zoom={13} 
          zoomControl={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
          />
          
          {/* Mock Hazards */}
          {MOCK_HAZARDS.map(hazard => (
            <Marker 
              key={hazard.id} 
              position={[hazard.latitude, hazard.longitude]} 
              icon={createMarkerIcon(getMarkerType(hazard.category))} 
              eventHandlers={{
                click: () => {
                  setIsRouting(false);
                  setIsSearching(false);
                  setSelectedHazard(hazard);
                }
              }}
            />
          ))}

          {!isNavigating && (
             <Marker position={position} icon={createMarkerIcon('user')} />
          )}

          {isRouting && !isNavigating && (
            <>
              <Marker position={[47.0210, 28.8435]} icon={createMarkerIcon('destination')} />
              <Polyline 
                positions={altRouteCoords} 
                pathOptions={{ color: '#777777', weight: 4, opacity: 0.5, dashArray: '8, 8', lineCap: 'round', lineJoin: 'round' }} 
              />
              <Polyline 
                positions={safeRouteCoords} 
                pathOptions={{ color: '#0095F6', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} 
              />
            </>
          )}

          {isNavigating && (
            <>
              <Marker position={safeRouteCoords[1]} icon={createMarkerIcon('user')} />
              <Marker position={[47.0210, 28.8435]} icon={createMarkerIcon('destination')} />
              <Polyline 
                positions={safeRouteCoords.slice(1)} 
                pathOptions={{ color: '#0095F6', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} 
              />
            </>
          )}
        </MapContainer>

        {/* UI Overlay - Search Bar */}
        {!isRouting && !isSearching && !isNavigating && !selectedHazard && (
          <div 
            className="absolute left-4 right-4 z-10"
            style={{ top: 'calc(env(safe-area-inset-top) + 24px)' }}
          >
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
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-bg-primary z-50 flex flex-col"
            >
              <div 
                className="px-4 pb-4 border-b border-border-subtle flex items-center gap-3"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
              >
                <button onClick={() => setIsSearching(false)} className="p-2 -ml-2 text-text-primary">
                  <ChevronLeft size={24} strokeWidth={1.5} />
                </button>
                <div className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Search size={18} className="text-text-secondary" strokeWidth={1.5} />
                  <input 
                    type="text" 
                    placeholder="Search destination..." 
                    className="bg-transparent border-none outline-none text-text-primary text-[15px] w-full placeholder:text-text-secondary"
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
          {isRouting && !isNavigating && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute left-4 right-4 z-10"
              style={{ bottom: 'calc(env(safe-area-inset-bottom) + 112px)' }}
            >
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-3xl p-4 shadow-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-text-primary font-semibold text-[17px] flex items-center gap-2">
                      <ShieldCheck size={18} className="text-accent-blue" strokeWidth={2} />
                      Safe Route Generated
                    </h3>
                    <p className="text-text-secondary text-[14px] mt-0.5">Avoiding 5 reported hazards</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsRouting(false); }}
                    className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary border border-border-subtle hover:bg-bg-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
                      <div className="w-2 h-2 rounded-full bg-accent-blue" />
                      Safe Route (18 min)
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-medium text-text-secondary opacity-70">
                      <div className="w-2 h-2 rounded-full bg-text-secondary" />
                      Alt Route (15 min) - Hazards
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsNavigating(true)}
                    className="px-6 py-2.5 rounded-xl bg-text-primary text-bg-primary font-bold text-[15px] hover:opacity-90 transition-opacity"
                  >
                    Start
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI Overlay - Active Navigation Top Panel */}
        <AnimatePresence>
          {isNavigating && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute left-4 right-4 z-10"
              style={{ top: 'calc(env(safe-area-inset-top) + 24px)' }}
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
                  onClick={(e) => { e.stopPropagation(); setIsNavigating(false); setIsRouting(false); }}
                  className="px-4 py-2 rounded-xl bg-accent-red/20 text-accent-red font-semibold text-sm hover:bg-accent-red/30 transition-colors"
                >
                  End
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UI Overlay - Hazard Details */}
        <AnimatePresence>
          {selectedHazard && !isNavigating && !isRouting && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute left-4 right-4 z-10"
              style={{ bottom: 'calc(env(safe-area-inset-bottom) + 112px)' }}
            >
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-subtle rounded-3xl p-4 shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-[16px] ${getMarkerType(selectedHazard.category) === 'danger' ? 'text-accent-red' : getMarkerType(selectedHazard.category) === 'warning' ? 'text-orange-500' : 'text-text-secondary'}`}>
                      {selectedHazard.category}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedHazard(null); }}
                    className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary border border-border-subtle hover:bg-bg-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <p className="text-text-primary text-[14px] leading-relaxed font-light mb-4 line-clamp-3">
                  {selectedHazard.description}
                </p>

                {selectedHazard.id % 5 === 0 && (
                  <div className="w-full h-32 rounded-xl bg-bg-secondary mb-3 overflow-hidden border border-border-subtle relative">
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-text-secondary text-[12px]">Reported anonymously</span>
                </div>
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
