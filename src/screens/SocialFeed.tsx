import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Heart, MessageCircle, Send, AlertTriangle, Moon, Shield, ChevronLeft } from 'lucide-react'

// MOCK DATA
const MOCK_NEARBY = [
  { id: 1, author: 'Anonymous #812', reports: 5, time: '2m', tag: { label: 'Aggressive Group', icon: <AlertTriangle size={12} className="text-accent-red" /> }, content: 'Group of aggressive individuals near the station. Avoid the south entrance. Security has been notified but please take a detour.', likes: 24, comments: 3 },
  { id: 2, author: 'Citizen #492', reports: 0, time: '15m', tag: { label: 'No Lighting', icon: <Moon size={12} className="text-text-secondary" /> }, content: 'Streetlights are completely out on Westside Bridge. Very dark and unsafe right now, especially for pedestrians. Flashlights needed.', likes: 112, comments: 14, hasImage: true },
  { id: 3, author: 'Anonymous #112', reports: 12, time: '32m', tag: { label: 'Blocked Path', icon: <AlertTriangle size={12} className="text-accent-blue" /> }, content: 'Construction scaffolding collapsed partially on 5th Ave sidewalk. Path is completely impassable for wheelchairs or strollers.', likes: 45, comments: 2 },
  { id: 4, author: 'Citizen #991', reports: 2, time: '1h', tag: { label: 'Suspicious Activity', icon: <AlertTriangle size={12} className="text-orange-500" /> }, content: 'Someone checking car handles along Maple Street. Keep vehicles locked.', likes: 89, comments: 21 },
];

const MOCK_TRENDING = [
  { id: 101, author: 'Anonymous #999', reports: 45, time: '1h', tag: { label: 'Major Roadblock', icon: <AlertTriangle size={12} className="text-orange-500" /> }, content: 'Central avenue is completely blocked off due to a major water main break. Traffic is being rerouted. Avoid the area if possible.', likes: 450, comments: 89 },
  { id: 102, author: 'Citizen #102', reports: 0, time: '2h', tag: { label: 'Stray Dogs', icon: <AlertTriangle size={12} className="text-yellow-500" /> }, content: 'Pack of stray dogs acting aggressively near the alley by the park. Had to turn around. Avoid walking pets here tonight.', likes: 256, comments: 45 },
  { id: 103, author: 'Anonymous #33', reports: 8, time: '5h', tag: { label: 'Protest', icon: <AlertTriangle size={12} className="text-accent-blue" /> }, content: 'Large peaceful gathering moving towards the square. Heavy pedestrian traffic, expect delays if walking through the center.', likes: 890, comments: 112 }
];

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState<'nearby' | 'trending'>('nearby');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const handleShare = (post: any) => {
    const text = encodeURIComponent(`Sentinel Alert: ${post.tag?.label} - ${post.content}`);
    const url = encodeURIComponent('https://sentinel.app/p/' + post.id);
    window.location.href = `https://t.me/share/url?url=${url}&text=${text}`;
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute inset-0 z-10 pt-12 pb-32 overflow-y-auto bg-bg-primary/80 backdrop-blur-md"
      >
        <div className="sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-20 border-b border-border-subtle pt-4 px-4 pb-0 mb-4">
          <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">Pulse</h2>
          <div className="flex w-full justify-between relative">
            <button 
              onClick={() => setActiveTab('nearby')}
              className={`flex-1 pb-3 text-[15px] font-semibold transition-colors relative ${activeTab === 'nearby' ? 'text-text-primary' : 'text-text-secondary'}`}
            >
              Nearby
              {activeTab === 'nearby' && (
                <motion.div layoutId="pulse-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('trending')}
              className={`flex-1 pb-3 text-[15px] font-semibold transition-colors relative ${activeTab === 'trending' ? 'text-text-primary' : 'text-text-secondary'}`}
            >
              Trending
              {activeTab === 'trending' && (
                <motion.div layoutId="pulse-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {(activeTab === 'nearby' ? MOCK_NEARBY : MOCK_TRENDING).map((post) => (
              <FeedCard 
                key={post.id}
                {...post} 
                onCommentClick={() => setSelectedPost(post)}
                onShareClick={() => handleShare(post)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Post Details / Comments Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-bg-primary z-50 flex flex-col"
          >
            <div className="pt-12 px-4 pb-4 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-20">
              <button onClick={() => setSelectedPost(null)} className="text-text-primary flex items-center gap-1">
                <ChevronLeft size={24} strokeWidth={1.5} className="-ml-2" />
                <span>Back</span>
              </button>
              <span className="font-semibold text-text-primary">Thread</span>
              <div className="w-16" />
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
              {/* Original Post */}
              <div className="border-b border-border-strong">
                <FeedCard {...selectedPost} isDetail />
              </div>
              
              {/* Mock Comments */}
              <div className="px-4 py-4 border-b border-border-subtle flex gap-3 pl-8">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary flex-shrink-0 text-sm">
                  C
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-text-primary text-[14px]">Citizen #102</span>
                    <span className="text-text-secondary text-[13px] font-light">1m</span>
                  </div>
                  <p className="text-text-primary text-[14px] font-light">Can confirm, just passed by there. It's totally dark. Be careful!</p>
                </div>
              </div>
              <div className="px-4 py-4 border-b border-border-subtle flex gap-3 pl-8">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary flex-shrink-0 text-sm">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-text-primary text-[14px]">Anonymous #44</span>
                    <Shield size={12} className="text-accent-blue" />
                    <span className="text-text-secondary text-[13px] font-light">5m</span>
                  </div>
                  <p className="text-text-primary text-[14px] font-light">Thanks for the heads up, rerouting now.</p>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-bg-primary/90 backdrop-blur-xl border-t border-border-subtle">
              <div className="flex gap-3 items-center bg-bg-secondary border border-border-subtle rounded-full px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary text-sm font-bold">
                  E
                </div>
                <input 
                  type="text" 
                  placeholder="Reply anonymously..." 
                  className="bg-transparent border-none outline-none flex-1 text-text-primary text-[15px]"
                />
                <button className="text-accent-blue font-semibold text-[14px]">Post</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FeedCard({ author, reports, time, tag, content, likes, comments, hasImage = false, isDetail = false, onCommentClick, onShareClick }: any) {
  return (
    <div className={`px-4 py-4 border-b border-border-subtle transition-colors ${!isDetail && 'hover:bg-bg-secondary/30'}`}>
      <div className="flex gap-3">
        {/* Avatar Area */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center font-medium text-text-primary flex-shrink-0">
            {author.charAt(0)}
          </div>
          {!isDetail && <div className="w-[1.5px] h-full bg-border-subtle mt-2 mb-1" />}
        </div>

        {/* Content Area */}
        <div className="flex-1 pb-1">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-text-primary text-[15px]">{author}</span>
              {reports > 0 && (
                <Shield size={14} className="text-accent-blue" />
              )}
              <span className="text-text-secondary text-[14px] font-light">· {time}</span>
            </div>
            <button className="text-text-secondary hover:text-text-primary p-1 rounded-full hover:bg-bg-tertiary transition-colors">
              <MoreHorizontal size={18} strokeWidth={1.5} />
            </button>
          </div>

          {tag && (
            <div className="inline-flex items-center gap-1.5 bg-bg-secondary border border-border-subtle px-2 py-0.5 rounded-md mb-2 mt-1">
              {tag.icon}
              <span className="text-[12px] font-medium text-text-primary">{tag.label}</span>
            </div>
          )}

          <p className={`text-text-primary leading-relaxed font-light ${isDetail ? 'text-[16px] mb-4' : 'text-[15px] mb-3'}`}>
            {content}
          </p>

          {hasImage && (
            <div className="w-full h-48 rounded-xl bg-bg-tertiary mb-3 overflow-hidden border border-border-subtle">
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-6 text-text-secondary mt-1">
            <button className="flex items-center gap-1.5 hover:text-text-primary transition-colors group">
              <Heart size={18} strokeWidth={1.5} className="group-active:scale-75 transition-transform" />
              <span className="text-[13px]">{likes}</span>
            </button>
            <button onClick={onCommentClick} className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
              <MessageCircle size={18} strokeWidth={1.5} />
              <span className="text-[13px]">{comments}</span>
            </button>
            <button onClick={onShareClick} className="flex items-center hover:text-text-primary transition-colors ml-auto">
              <Send size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
