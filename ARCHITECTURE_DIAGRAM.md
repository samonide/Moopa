# Manga Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  React Components                                               │
│  ├─ MangaSearch       → Search manga by title                  │
│  ├─ ChapterList       → Display available chapters             │
│  └─ MangaReader       → Read chapter pages                     │
│                                                                 │
│  Helper Functions (lib/manga/client.ts)                        │
│  ├─ searchManga()              ┐                              │
│  ├─ getMangaChapters()         │ Frontend API wrappers        │
│  └─ getChapterPages()          ┘                              │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /api/v2/manga/search.ts                                       │
│  ├─ GET ?query=...&provider=...                               │
│  └─ Returns: MangaSearchResult[]                              │
│                                                                 │
│  /api/v2/manga/chapters.ts                                     │
│  ├─ GET ?mangaId=...&provider=...                            │
│  └─ Returns: MangaChapter[]                                   │
│                                                                 │
│  /api/v2/manga/pages.ts                                        │
│  ├─ GET ?chapterId=...&provider=...                          │
│  └─ Returns: MangaPage[]                                      │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Provider Selection
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    PROVIDER MANAGER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  lib/manga/index.ts                                            │
│  ├─ getMangaProvider(providerId)                              │
│  ├─ searchManga(providerId, query)                            │
│  ├─ getMangaChapters(providerId, mangaId)                     │
│  └─ getMangaPages(providerId, chapterId)                      │
│                                                                 │
│  Provider Registry:                                             │
│  ├─ comix: comixProvider ──────────────┐                      │
│  └─ [future providers...]              │                       │
│                                         │                       │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                                          │ Delegate to provider
                                          │
┌─────────────────────────────────────────▼───────────────────────┐
│                    PROVIDER IMPLEMENTATIONS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Comix Provider (lib/comix/provider.ts)                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  search(query)                                            │ │
│  │  ├─ GET comix.to/api/v2/manga?keyword=...               │ │
│  │  └─ Returns manga with composite IDs                     │ │
│  │                                                           │ │
│  │  findChapters(mangaId)                                    │ │
│  │  ├─ Parse hashId|slug from composite ID                  │ │
│  │  ├─ GET comix.to/api/v2/manga/{hashId}/chapters         │ │
│  │  ├─ Paginate through all results                         │ │
│  │  └─ Returns chapters with scanlator info                 │ │
│  │                                                           │ │
│  │  findChapterPages(chapterId)                              │ │
│  │  ├─ Parse hashId|slug|chapterId|number                   │ │
│  │  ├─ GET comix.to/title/{hashId}-{slug}/...              │ │
│  │  ├─ Extract images array from HTML via regex             │ │
│  │  └─ Returns pages with referer headers                   │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Future: MangaDex Provider]                                   │
│  [Future: MangaSee Provider]                                   │
│  [Future: Other Providers...]                                  │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ External API calls
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Comix.to API                                                  │
│  ├─ /api/v2/manga (search)                                    │
│  ├─ /api/v2/manga/{id}/chapters                              │
│  └─ /title/{id} (chapter pages HTML)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                      CACHING LAYER (Redis)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  manga:search:{provider}:{query}      → 1 hour                 │
│  manga:chapters:{provider}:{mangaId}  → 24 hours               │
│  manga:pages:{provider}:{chapterId}   → 24 hours               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### 1. Search Flow
```
User Input: "One Piece"
    ↓
Frontend: searchManga("One Piece", "comix")
    ↓
API: GET /api/v2/manga/search?query=One%20Piece&provider=comix
    ↓
Check Redis: manga:search:comix:One%20Piece
    ↓ (cache miss)
Provider Manager: getMangaProvider("comix")
    ↓
Comix Provider: search({ query: "One Piece" })
    ↓
External API: GET comix.to/api/v2/manga?keyword=One%20Piece
    ↓
Response: [
  {
    id: "abc123|one-piece",
    title: "One Piece",
    image: "https://...",
    ...
  }
]
    ↓
Cache in Redis (1 hour)
    ↓
Return to Frontend
```

### 2. Chapter Listing Flow
```
User clicks manga: "abc123|one-piece"
    ↓
Frontend: getMangaChapters("abc123|one-piece", "comix")
    ↓
API: GET /api/v2/manga/chapters?mangaId=abc123|one-piece&provider=comix
    ↓
Check Redis: manga:chapters:comix:abc123|one-piece
    ↓ (cache miss)
Provider Manager: getMangaProvider("comix")
    ↓
Comix Provider: findChapters("abc123|one-piece")
    ↓
Parse ID: hashId="abc123", slug="one-piece"
    ↓
External API: GET comix.to/api/v2/manga/abc123/chapters
    ↓ (first page)
Response: { pagination: { last_page: 3 }, items: [...] }
    ↓ (fetch remaining pages)
External API: GET ...&page=2
External API: GET ...&page=3
    ↓
Combine all chapters and sort
    ↓
Response: [
  {
    id: "abc123|one-piece|ch456|1",
    title: "Chapter 1 — Romance Dawn",
    chapter: "1",
    scanlator: "Official",
    ...
  }
]
    ↓
Cache in Redis (24 hours)
    ↓
Return to Frontend
```

### 3. Page Reading Flow
```
User clicks chapter: "abc123|one-piece|ch456|1"
    ↓
Frontend: getChapterPages("abc123|one-piece|ch456|1", "comix")
    ↓
API: GET /api/v2/manga/pages?chapterId=abc123|one-piece|ch456|1&provider=comix
    ↓
Check Redis: manga:pages:comix:abc123|one-piece|ch456|1
    ↓ (cache miss)
Provider Manager: getMangaProvider("comix")
    ↓
Comix Provider: findChapterPages("abc123|one-piece|ch456|1")
    ↓
Parse ID: hashId="abc123", slug="one-piece", 
         chapterId="ch456", number="1"
    ↓
External API: GET comix.to/title/abc123-one-piece/ch456-chapter-1
    ↓
Parse HTML with regex: /"images":\[(.*?)\]/
    ↓
Extract images array and parse JSON
    ↓
Response: [
  {
    url: "https://cdn.comix.to/page1.jpg",
    index: 0,
    headers: {
      Referer: "https://comix.to/title/abc123-one-piece/ch456-chapter-1"
    }
  },
  ...
]
    ↓
Cache in Redis (24 hours)
    ↓
Return to Frontend
    ↓
Display images with proper referer
```

## Type Flow

```typescript
// API Request Types
type SearchRequest = {
  query: string;
  provider: string;
}

type ChaptersRequest = {
  mangaId: string;
  provider: string;
}

type PagesRequest = {
  chapterId: string;
  provider: string;
}

// Response Types
type MangaSearchResult = {
  id: string;           // Composite: "hashId|slug"
  title: string;
  synonyms?: string[];
  year?: number;
  image: string;
}

type MangaChapter = {
  id: string;           // Composite: "hashId|slug|chapterId|number"
  url: string;
  title: string;
  chapter: string;      // Chapter number
  index: number;        // Sort order
  scanlator?: string;   // "Official" or group name
  language?: string;    // "en", "ja", etc.
}

type MangaPage = {
  url: string;          // Direct image URL
  index: number;        // Page number (0-based)
  headers?: {
    Referer: string;    // Required for some CDNs
  }
}
```

## Provider Interface

```typescript
interface MangaProvider {
  // Search for manga by query string
  search(opts: MangaSearchOptions): Promise<MangaSearchResult[]>;
  
  // Get all chapters for a manga
  findChapters(mangaId: string): Promise<MangaChapter[]>;
  
  // Get all pages for a chapter
  findChapterPages(chapterId: string): Promise<MangaPage[]>;
  
  // Optional: Provider-specific settings
  getSettings?(): {
    supportsMultiScanlator?: boolean;
  };
}
```

## File Structure

```
lib/
├── comix/
│   ├── provider.ts           # Comix provider implementation
│   └── manifest.json         # Provider metadata
│
├── manga/
│   ├── index.ts             # Provider manager
│   ├── client.ts            # Frontend helper functions
│   └── README.md            # Full documentation
│
└── [future-provider]/
    ├── provider.ts
    └── manifest.json

pages/api/v2/manga/
├── search.ts                # Search endpoint
├── chapters.ts              # Chapters endpoint
└── pages.ts                 # Pages endpoint

utils/
└── imageUtils.ts            # Image header management

scripts/
└── test-manga-provider.ts   # Test script

Documentation:
├── MANGA_BACKEND_UPDATE.md  # Complete update summary
└── QUICK_START_MANGA.md     # Quick start guide
```

## Key Design Decisions

### 1. Composite IDs
**Why:** Comix requires context (hash_id, slug, chapter_id, number) for API calls
**Format:** Pipe-separated values: `hashId|slug|chapterId|number`
**Benefit:** Self-contained, no need for separate lookups

### 2. Provider Pattern
**Why:** Support multiple manga sources with unified interface
**Benefit:** Easy to add new providers, swap providers, fallback logic

### 3. Caching Strategy
**Why:** Reduce external API calls, improve performance
**TTL:** Search (1h), Chapters/Pages (24h)
**Benefit:** Fast responses, reduced server load

### 4. Singleton Providers
**Why:** Single instance per provider, consistent state
**Export:** `export const comixProvider = new ComixProvider();`
**Benefit:** Memory efficient, easy to import

### 5. Separate Client Library
**Why:** Clean separation of concerns
**Location:** `lib/manga/client.ts`
**Benefit:** Reusable frontend logic, consistent API usage

## Security Considerations

1. **Input Validation:** All API endpoints validate parameters
2. **Error Handling:** Errors don't expose internal details
3. **Rate Limiting:** Consider adding rate limiting to API endpoints
4. **CORS:** Configure appropriate CORS headers for image proxying
5. **Referer Headers:** Properly handled to respect CDN requirements

## Performance Optimizations

1. **Redis Caching:** Aggressive caching reduces external API calls
2. **Pagination:** Fetch all chapters at once to minimize roundtrips
3. **Parallel Requests:** Can search multiple providers simultaneously
4. **Image Preloading:** Client can preload next chapter
5. **CDN:** External images served from Comix CDN

## Future Enhancements

1. **More Providers:** MangaDex, MangaSee, MangaKakalot, etc.
2. **Provider Health Check:** Monitor provider availability
3. **Automatic Fallback:** Switch to backup provider on failure
4. **Batch Operations:** Fetch multiple chapters at once
5. **Image Proxy:** Optional image proxy for CORS/privacy
6. **Offline Reading:** Download chapters for offline access
7. **Reading Progress:** Track and sync reading position
8. **Bookmarks:** Save favorite manga and chapters
