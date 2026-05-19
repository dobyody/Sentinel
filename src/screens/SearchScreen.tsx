import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, ArrowLeft } from 'lucide-react'

export default function SearchScreen({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-bg-primary overflow-y-auto"
    >
      <div className="sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-20 border-b border-border-subtle p-4 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-text-primary p-1">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </button>
          <div className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl px-4 py-2 flex items-center gap-3">
            <Search size={18} className="text-text-secondary" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search users or places..." 
              className="bg-transparent border-none outline-none text-text-primary text-[15px] w-full placeholder:text-text-secondary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {query === '' ? (
          <>
            <h3 className="text-text-secondary font-semibold text-[13px] uppercase tracking-wider mb-4">Recent Searches</h3>
            <div className="flex flex-col gap-4">
              <SearchItem type="user" title="Elena M." subtitle="@elena.routes" />
              <SearchItem type="place" title="Central Station" subtitle="Chisinau" />
              <SearchItem type="user" title="Dan P." subtitle="@dan.explorer" />
            </div>

            <h3 className="text-text-secondary font-semibold text-[13px] uppercase tracking-wider mt-8 mb-4">Suggested Users</h3>
            <div className="flex flex-col gap-4">
              <UserFollowItem name="Urban Watch" handle="@city_watch" followers="1.2k" />
              <UserFollowItem name="Sarah K." handle="@sarah_safe" followers="450" />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-text-secondary font-semibold text-[13px] uppercase tracking-wider mb-2">Results for "{query}"</h3>
            <UserFollowItem name="Query Match User" handle={`@${query.replace(/\s+/g, '').toLowerCase()}`} followers="12" />
            <SearchItem type="place" title={`Place: ${query}`} subtitle="Nearby location" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SearchItem({ type, title, subtitle }: { type: 'user'|'place', title: string, subtitle: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-primary">
        {type === 'place' ? <MapPin size={18} strokeWidth={1.5} /> : <Search size={18} strokeWidth={1.5} />}
      </div>
      <div>
        <h4 className="text-[15px] font-semibold text-text-primary">{title}</h4>
        <p className="text-[13px] text-text-secondary">{subtitle}</p>
      </div>
    </div>
  )
}

function UserFollowItem({ name, handle, followers }: { name: string, handle: string, followers: string }) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center font-bold text-text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="text-[15px] font-semibold text-text-primary leading-tight">{name}</h4>
          <p className="text-[13px] text-text-secondary leading-tight">{handle} · {followers} followers</p>
        </div>
      </div>
      <button 
        onClick={() => setIsFollowing(!isFollowing)}
        className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-colors ${
          isFollowing 
            ? 'border border-border-strong text-text-primary bg-transparent' 
            : 'bg-text-primary text-bg-primary border border-text-primary'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}
