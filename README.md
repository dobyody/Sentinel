# Sentinel 🛡️

**Sentinel** is a next-generation civic-social mobile application built as a Telegram Mini App. It functions as a **live urban awareness network**, allowing users to navigate cities safely by generating routes that avoid community-reported hazards in real-time.

With an ultra-minimalist, pitch-black "Threads-like" aesthetic, Sentinel focuses on anonymity, speed, and safety.

## 🌟 Core Features

- **Safe Routing (Map):** Interactive map powered by Leaflet with CartoDB Dark Matter tiles. Generates safe routes avoiding reported dangers (aggressive groups, unlit streets, stray dogs, etc.) with turn-by-turn navigation UI.
- **3-Tap Reporting Flow:** An ultra-fast, 5-second mechanism to report incidents while on the move. Uses clear, color-coded categories:
  - 🔴 **Threat** (Harassment, aggressive behavior)
  - 🟠 **Infrastructure Hazard** (Unlit street, open manhole)
  - 🟡 **Animal Hazard** (Stray dogs, aggressive animals)
  - 🔵 **Obstacle** (Blocked path, construction)
- **Pulse (Social Feed):** An anonymous, location-based feed showing **Nearby** and **Trending** urban moments and hazards. No influencer culture, no follower counts.
- **Anonymous Profiles:** Users are entirely anonymous (e.g., `Citizen #492`, `Anonymous #1234`). Profiles track civic contributions (reports made, people helped) and award trusted reporter badges.
- **Telegram Mini App Ready:** Fully integrated with Telegram WebApp SDK for seamless execution within Telegram chats.

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion (for fluid, cinematic, Apple-like transitions)
- **Maps:** Leaflet & React-Leaflet
- **Icons:** Lucide React
- **Integration:** @twa-dev/sdk (Telegram Web App SDK)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/` (or the port specified in the terminal). For the best experience, use the mobile view in your browser's Developer Tools.

## 🎨 Design Philosophy
- **"The city has a live multiplayer mode."**
- **Vibe:** Cinematic, dark, minimal, tactile.
- **Colors:** Pitch black, muted graphite, with stark, meaningful accent colors for hazards.
- **Typography:** System fonts (Inter, SF Pro) with clean hierarchies.

## 📄 License
MIT License
