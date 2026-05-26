import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Heart, MessageCircle, Send, AlertTriangle, Moon, Shield, ChevronLeft, Dog, Construction } from 'lucide-react'
import { MOCK_HAZARDS } from '../data/mockHazards'

// Transform raw hazard data into feed-ready post data
const transformHazardToPost = (hazard: any) => {
  // Deterministic random generation based on ID
  const authorId = (hazard.id * 17) % 999;
  const isCitizen = hazard.id % 2 === 0;
  const reportsCount = (hazard.id * 7) % 20;
  const likes = (hazard.id * 13) % 250;
  const commentsCount = (hazard.id * 3) % 45;
  const minutesAgo = (hazard.id * 5) % 60;
  
  let icon = <AlertTriangle size={12} className="text-orange-500" />;
  
  
  if (hazard.category === 'Threat') { icon = <AlertTriangle size={12} className="text-accent-red" />;  }
  else if (hazard.category === 'Lighting') { icon = <Moon size={12} className="text-text-secondary" />;  }
  else if (hazard.category === 'Animal Hazard') { icon = <Dog size={12} className="text-yellow-500" />;  }
  else if (hazard.category === 'Obstacle') { icon = <Construction size={12} className="text-accent-blue" />;  }

  return {
    id: hazard.id,
    author: isCitizen ? `Citizen #${authorId}` : `Anonymous #${authorId}`,
    reports: reportsCount,
    time: `${minutesAgo}m`,
    tag: { label: hazard.category, icon },
    content: hazard.description,
    likes,
    comments: commentsCount,
    hasImage: false // Removing the incorrect image placeholder
  };
};

const ALL_POSTS = MOCK_HAZARDS.map(transformHazardToPost);
// Split data for demo
const POSTS_NEARBY = ALL_POSTS.slice(0, 25);
const POSTS_TRENDING = ALL_POSTS.slice(25, 50).sort((a, b) => b.likes - a.likes);

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
        className="absolute inset-0 z-10 overflow-y-auto bg-bg-primary/80 backdrop-blur-md"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 128px)' }}
      >
        <div 
          className="sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-30 border-b border-border-subtle px-4 pb-0 mb-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
        >
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
            {(activeTab === 'nearby' ? POSTS_NEARBY : POSTS_TRENDING).map((post) => (
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-bg-primary z-50 flex flex-col"
          >
            <div 
              className="px-4 pb-4 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-primary/90 backdrop-blur-xl z-20"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
            >
              <button onClick={() => setSelectedPost(null)} className="text-text-primary flex items-center gap-1">
                <ChevronLeft size={24} strokeWidth={1.5} className="-ml-2" />
                <span>Back</span>
              </button>
              <span className="font-semibold text-text-primary">Thread</span>
              <div className="w-16" />
            </div>

            <div 
              className="flex-1 overflow-y-auto"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 128px)' }}
            >
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
                  <p className="text-text-primary text-[14px] font-light">Can confirm, just passed by there. Be careful!</p>
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
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-bg-primary/90 backdrop-blur-xl border-t border-border-subtle"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
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
            {author.replace(/[^a-zA-Z]/g, '').charAt(0)}
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
            <div className="w-full h-48 rounded-xl bg-bg-tertiary mb-3 overflow-hidden border border-border-subtle animate-pulse" />
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
