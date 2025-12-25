# Manga Provider System

This directory contains the manga provider infrastructure for Moopa, designed to support multiple manga sources with a unified interface.

## Structure

```
lib/
├── manga/
│   └── index.ts          # Provider manager and unified interface
├── comix/
│   ├── provider.ts       # Comix provider implementation
│   └── manifest.json     # Provider metadata
└── [other-providers]/
```

## Architecture

### Provider Interface

Each manga provider must implement the following interface:

```typescript
interface MangaProvider {
  search(opts: MangaSearchOptions): Promise<MangaSearchResult[]>;
  findChapters(mangaId: string): Promise<MangaChapter[]>;
  findChapterPages(chapterId: string): Promise<MangaPage[]>;
  getSettings?(): { supportsMultiScanlator?: boolean };
}
```

### Types

- **MangaSearchOptions**: Search query parameters
- **MangaSearchResult**: Manga metadata (id, title, image, etc.)
- **MangaChapter**: Chapter information (id, title, chapter number, scanlator, etc.)
- **MangaPage**: Page data with image URLs and headers

## API Endpoints

### 1. Search Manga
```
GET /api/v2/manga/search?query={searchQuery}&provider={providerId}
```

Example:
```bash
curl "http://localhost:3000/api/v2/manga/search?query=One%20Piece&provider=comix"
```

Response:
```json
[
  {
    "id": "hash123|one-piece",
    "title": "One Piece",
    "synonyms": ["ワンピース"],
    "image": "https://...",
    "year": 1997
  }
]
```

### 2. Get Chapters
```
GET /api/v2/manga/chapters?mangaId={mangaId}&provider={providerId}
```

Example:
```bash
curl "http://localhost:3000/api/v2/manga/chapters?mangaId=hash123|one-piece&provider=comix"
```

Response:
```json
[
  {
    "id": "hash123|one-piece|ch456|1",
    "url": "https://comix.to/...",
    "title": "Chapter 1 — Romance Dawn",
    "chapter": "1",
    "index": 0,
    "scanlator": "Official",
    "language": "en"
  }
]
```

### 3. Get Pages
```
GET /api/v2/manga/pages?chapterId={chapterId}&provider={providerId}
```

Example:
```bash
curl "http://localhost:3000/api/v2/manga/pages?chapterId=hash123|one-piece|ch456|1&provider=comix"
```

Response:
```json
[
  {
    "url": "https://...",
    "index": 0,
    "headers": {
      "Referer": "https://comix.to/..."
    }
  }
]
```

## Comix Provider

### Features
- Full-text manga search
- Complete chapter listing with pagination
- Multi-scanlator support
- Official and fan translations
- Language filtering

### ID Format
Comix uses composite IDs to maintain context:
- **Manga ID**: `{hash_id}|{slug}`
- **Chapter ID**: `{hash_id}|{slug}|{chapter_id}|{chapter_number}`

### Example Usage

```typescript
import { comixProvider } from '@/lib/comix/provider';

// Search
const results = await comixProvider.search({ query: 'One Piece' });

// Get chapters
const chapters = await comixProvider.findChapters('hash123|one-piece');

// Get pages
const pages = await comixProvider.findChapterPages('hash123|one-piece|ch456|1');
```

## Adding New Providers

To add a new manga provider:

1. Create a new directory under `lib/`:
   ```
   lib/
   └── your-provider/
       ├── provider.ts
       └── manifest.json
   ```

2. Implement the `MangaProvider` interface in `provider.ts`

3. Export a singleton instance:
   ```typescript
   export const yourProvider = new YourProvider();
   ```

4. Register in `lib/manga/index.ts`:
   ```typescript
   import { yourProvider } from './your-provider/provider';
   
   export const mangaProviders: Record<string, MangaProvider> = {
     comix: comixProvider,
     yourProvider: yourProvider, // Add here
   };
   ```

5. Create `manifest.json`:
   ```json
   {
     "id": "your-provider",
     "name": "Your Provider",
     "version": "1.0.0",
     "type": "manga",
     "author": "Your Name",
     "description": "Description",
     "lang": ["en"]
   }
   ```

6. Update API endpoints to handle the new provider

## Caching

All API endpoints use Redis caching:
- **Search results**: 1 hour
- **Chapters**: 24 hours
- **Pages**: 24 hours

Cache keys follow the format: `manga:{endpoint}:{provider}:{identifier}`

## Image Headers

Providers that require referer headers should be added to `utils/imageUtils.ts`:

```typescript
export function getHeaders(providerId: string) {
  switch (providerId) {
    case "comix":
      return { Referer: "https://comix.to" };
    // Add more providers here
  }
}
```

## Error Handling

All providers should:
1. Return empty arrays on failure (not throw)
2. Log errors for debugging
3. Validate input parameters
4. Handle API rate limits gracefully

## Best Practices

1. **Composite IDs**: Use composite IDs when chapters need context from parent manga
2. **Pagination**: Fetch all pages for complete chapter lists
3. **Sorting**: Sort chapters by number in descending order
4. **Scanlator Info**: Preserve scanlator information for multi-scanlator support
5. **Language Tags**: Include language information when available

## Testing

To test a provider:

```bash
# Start development server
npm run dev

# Test search
curl "http://localhost:3000/api/v2/manga/search?query=naruto&provider=comix"

# Test chapters
curl "http://localhost:3000/api/v2/manga/chapters?mangaId=MANGA_ID&provider=comix"

# Test pages
curl "http://localhost:3000/api/v2/manga/pages?chapterId=CHAPTER_ID&provider=comix"
```

## Future Enhancements

- [ ] Add more manga providers (MangaDex, MangaSee, etc.)
- [ ] Implement provider health checks
- [ ] Add provider switching/fallback logic
- [ ] Support for authentication-required providers
- [ ] Batch operations for multiple chapters
- [ ] Provider-specific settings and preferences
