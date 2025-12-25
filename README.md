# Moopa - Modern Anime Streaming Platform

<div align="center">
  <h2>A Next.js Anime Streaming Experience</h2>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![GitHub repo](https://img.shields.io/badge/GitHub-samonide%2Fmoopa-blue?logo=github)](https://github.com/samonide/moopa)
</div>

---

## 📋 Quick Overview

**Moopa** is a modern anime streaming platform built with Next.js 15, React 18, and TypeScript. It provides users with a seamless experience to search, discover, and stream anime with multi-provider support.

---

## 🚀 Core Features

### Streaming
- **Multi-Provider Support**: HiAnime, AniCrush, Consumet with seamless switching
- **High-Quality Playback**: Adaptive bitrate HLS streaming with multiple servers
- **Provider Abstraction**: Source1/2/3 UI with dynamic backend mapping
- **M3U8 Caching**: 30-second TTL manifest caching for optimized performance
- **Server Proxy**: CORS bypass with proper header handling

### User Experience
- **AniList Integration**: Sign in, track progress, manage lists
- **Watch History**: Automatic episode progress tracking
- **Responsive Design**: Mobile-first UI working on all devices
- **Subtitle Support**: Multiple languages with customizable display
- **Theater Mode**: Fullscreen immersive viewing

### Technical
- **Next.js 15**: Pages Router with Server-Side Rendering
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Modern, responsive styling
- **VidStack Player**: Professional video playback with HLS.js
- **PostgreSQL + Prisma**: Reliable data persistence

---

## 📊 Current Codebase Status

### ✅ Complete
- Multi-provider episode fetching and caching
- HiAnime integration with MegaCloud extraction
- AniCrush integration with dual decryption fallback
- Source mapping and provider abstraction
- Video player with adaptive bitrate
- M3U8 manifest caching system
- Subtitle handling with null safety
- User authentication & tracking
- Responsive UI components

### 🎯 Architecture Highlights
- **Modular Providers**: Each provider (`/lib/[provider]/`) handles search → episodes → streaming
- **Unified API**: `/api/v2/source` abstracts provider differences
- **Proxy Layer**: `/api/proxy/stream` handles CORS + URL rewriting
- **Type Safety**: Comprehensive TypeScript definitions for all entities
- **State Management**: React Context for global state

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 18, TypeScript 5.7, Tailwind CSS |
| **Video** | @vidstack/react, HLS.js 1.6 |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Cache** | Redis (optional), In-Memory fallback |
| **Auth** | NextAuth.js + AniList OAuth |
| **HTTP** | Axios for external API calls |

---

## 📦 Installation

```bash
# Clone
git clone https://github.com/samonide/moopa.git
cd moopa

# Install
npm install

# Configure environment (.env.local)
NEXTAUTH_SECRET=your_secret
DATABASE_URL=postgresql://...
REDIS_URL=redis://... (optional)

# Setup database
npx prisma migrate dev

# Run
npm run dev
# Visit http://localhost:3000
```

---

## 📂 Project Structure

```
moopa/
├── components/           # React components
│   ├── shared/          # Shared (Header, Footer, Nav)
│   ├── watch/           # Watch/Player components
│   └── anime/           # Anime-related components
├── pages/               # Next.js pages & API
│   ├── api/v2/          # Source/Episode/streaming APIs
│   ├── api/proxy/       # CORS proxy endpoint
│   └── en/              # Frontend pages
├── lib/                 # Business logic
│   ├── hianime/         # HiAnime provider
│   ├── anicrush/        # AniCrush provider (NEW)
│   ├── consumet/        # Consumet provider
│   └── hooks/           # Custom React hooks
├── types/               # TypeScript definitions
├── prisma/              # Database schema
└── public/              # Static assets
```

---

## 🎬 Streaming Providers

### Source 1: HiAnime
- **URL**: https://hianime.to
- **Servers**: HD-1, HD-2, HD-3
- **Format**: Robust search with direct ID matching
- **Decryption**: Built-in MegaCloud support

### Source 2: AniCrush (NEW)
- **URL**: https://anicrush.to
- **Servers**: Southcloud-1, Southcloud-2, Southcloud-3
- **Search**: Levenshtein similarity matching
- **Decryption**: Primary + ShadeOfChaos fallback

### Source 3: Consumet
- **Flexible**: Multiple sub-providers
- **Fallback**: When other sources unavailable

---

## 🚀 Performance Optimizations

### M3U8 Manifest Caching (Latest)
```javascript
// 30-second TTL, in-memory caching
// Cache key: url|referer|origin
// ~70% faster on repeated requests
// Auto-cleanup at 100 entries
```

### Subtitle Safety
- Null checks for all subtitle objects
- Proper fallback handling
- Filters out invalid entries

### Episode Fetching
- Guard clause prevents undefined watchId
- Automatic redirect with proper ID
- Better error handling

---

## 🔐 Security & Encryption

Moopa supports AES-256-GCM encryption for sensitive environment variables, preventing accidental exposure of secrets in version control or logs.

### Protected Variables
- `CLIENT_ID` - AniList OAuth client ID
- `CLIENT_SECRET` - AniList OAuth client secret
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - PostgreSQL direct connection
- `NEXTAUTH_SECRET` - NextAuth JWT secret

### Quick Setup

**1. Generate encryption key (production):**
```bash
npm run generate-key
```

**2. Encrypt secrets:**
```bash
npm run encrypt -- "your-secret-value"
```

**3. Update `.env`:**
```env
ENCRYPTION_KEY=your-256-bit-hex-key
ENCRYPTED_DATABASE_URL={"iv":"...","encryptedData":"...","authTag":"..."}
ENCRYPTED_CLIENT_ID={"iv":"...","encryptedData":"...","authTag":"..."}
```

### Environment Modes

**Development** (auto-fallback to NEXTAUTH_SECRET):
```env
NEXTAUTH_SECRET="your-secret"
CLIENT_ID="your-id"
DATABASE_URL="postgresql://..."
```

**Production** (encryption recommended):
```env
ENCRYPTION_KEY="generated-256-bit-key"
ENCRYPTED_CLIENT_ID={"iv":"...","encryptedData":"...","authTag":"..."}
ENCRYPTED_DATABASE_URL={"iv":"...","encryptedData":"...","authTag":"..."}
```

### Code Integration

Encryption is transparent - use `getEnv()` like before:

```typescript
import { getEnv } from 'lib/env';

const dbUrl = getEnv('DATABASE_URL');        // Works with plain or encrypted
const clientId = getEnv('CLIENT_ID');        // Automatically decrypted
```

### Security Notes
- ✅ Encryption key never committed to git
- ✅ AES-256-GCM with authentication tags
- ✅ Random IV for each encryption
- ✅ Server-side only decryption
- ✅ Backward compatible with plain text values

For detailed encryption documentation, see [ENCRYPTION.md](ENCRYPTION.md).

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Licensed under MIT - see [LICENSE.md](LICENSE.md)

---

## ⚖️ Legal Notice

Moopa is a streaming aggregator that does not host content. It provides links to third-party sources only. Users are responsible for ensuring legal compliance in their jurisdiction.

For DMCA concerns: Visit our [DMCA page](/en/dmca)

---

<div align="center">
  
  **Made with ❤️ by the Moopa Community**
  
  [Maintained by samonide](https://github.com/samonide) | [GitHub](https://github.com/samonide/moopa)
  
</div>