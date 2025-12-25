# Quick Start Guide: Manga Backend System

## 🚀 Getting Started

The new manga backend is now ready to use! Here's how to get started.

## 📋 What You Got

- ✅ Complete Comix provider implementation
- ✅ Three API endpoints (search, chapters, pages)
- ✅ Redis caching for performance
- ✅ TypeScript types for development
- ✅ Comprehensive documentation
- ✅ Example frontend integration code
- ✅ Test scripts

## 🧪 Quick Test

### 1. Start Your Dev Server
```bash
npm run dev
```

### 2. Test the APIs

**Search for a manga:**
```bash
curl "http://localhost:3000/api/v2/manga/search?query=one%20piece&provider=comix"
```

**Get chapters** (use a manga ID from search result):
```bash
curl "http://localhost:3000/api/v2/manga/chapters?mangaId=MANGA_ID&provider=comix"
```

**Get pages** (use a chapter ID from chapters result):
```bash
curl "http://localhost:3000/api/v2/manga/pages?chapterId=CHAPTER_ID&provider=comix"
```

## 📱 Frontend Integration

### Option 1: Use the Client Library

```typescript
import { searchManga, getMangaChapters, getChapterPages } from '@/lib/manga/client';

// Search
const results = await searchManga('One Piece', 'comix');

// Get chapters
const chapters = await getMangaChapters(results[0].id, 'comix');

// Get pages
const pages = await getChapterPages(chapters[0].id, 'comix');
```

### Option 2: Direct API Calls

```typescript
// In your React component
const [manga, setManga] = useState([]);

useEffect(() => {
  async function fetchManga() {
    const response = await fetch('/api/v2/manga/search?query=naruto&provider=comix');
    const data = await response.json();
    setManga(data);
  }
  fetchManga();
}, []);
```

## 🏗️ Project Structure

```
lib/
├── comix/
│   ├── provider.ts       # Comix implementation
│   └── manifest.json     # Provider metadata
├── manga/
│   ├── index.ts          # Provider manager
│   ├── client.ts         # Frontend helper functions
│   └── README.md         # Full documentation
└── ...

pages/api/v2/manga/
├── search.ts             # Search endpoint
├── chapters.ts           # Chapters endpoint
└── pages.ts              # Pages endpoint

utils/
└── imageUtils.ts         # Image header handling (updated)
```

## 🔑 Key Concepts

### 1. Composite IDs
Comix uses composite IDs to maintain context:
- **Manga**: `hashId|slug` → `abc123|one-piece`
- **Chapter**: `hashId|slug|chapterId|number` → `abc123|one-piece|ch456|1`

### 2. Provider System
All providers follow the same interface:
```typescript
interface MangaProvider {
  search(opts): Promise<SearchResult[]>;
  findChapters(mangaId): Promise<Chapter[]>;
  findChapterPages(chapterId): Promise<Page[]>;
}
```

### 3. Caching
- Search results: 1 hour
- Chapters: 24 hours  
- Pages: 24 hours

## 📝 Example: Complete Read Flow

```typescript
// 1. Search for manga
const results = await searchManga('One Piece');
console.log(results[0].title); // "One Piece"

// 2. Get chapters
const chapters = await getMangaChapters(results[0].id);
console.log(chapters[0].title); // "Chapter 1 — Romance Dawn"

// 3. Get pages for first chapter
const pages = await getChapterPages(chapters[0].id);
console.log(pages.length); // e.g., 52 pages

// 4. Display images (with proper referer)
pages.forEach((page, index) => {
  // When fetching the image, include the referer header
  // Most browsers handle this automatically for <img> tags
  console.log(`Page ${index + 1}: ${page.url}`);
});
```

## 🎨 UI Integration Tips

### Search Component
```tsx
function MangaSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchManga(query, 'comix');
    setResults(data);
  };

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <div>
        {results.map(manga => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </div>
  );
}
```

### Chapter List Component
```tsx
function ChapterList({ mangaId }: { mangaId: string }) {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    getMangaChapters(mangaId, 'comix').then(setChapters);
  }, [mangaId]);

  return (
    <div>
      {chapters.map(chapter => (
        <Link 
          key={chapter.id}
          href={`/read?id=${chapter.id}&provider=comix`}
        >
          {chapter.title}
          {chapter.scanlator && ` (${chapter.scanlator})`}
        </Link>
      ))}
    </div>
  );
}
```

### Reader Component
```tsx
function MangaReader({ chapterId }: { chapterId: string }) {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    getChapterPages(chapterId, 'comix').then(setPages);
  }, [chapterId]);

  return (
    <div>
      <img src={pages[currentPage]?.url} alt={`Page ${currentPage + 1}`} />
      <div>
        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))}>
          Previous
        </button>
        <span>Page {currentPage + 1} / {pages.length}</span>
        <button onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}>
          Next
        </button>
      </div>
    </div>
  );
}
```

## 🔍 Debugging

### Enable Verbose Logging
Check the server console for detailed logs:
- Search: Query parameters and result count
- Chapters: Manga ID and chapter count
- Pages: Chapter ID and page count

### Common Issues

**No results from search:**
- Check if query is properly URL encoded
- Verify provider name is correct ('comix')
- Check server logs for API errors

**Chapters not loading:**
- Verify manga ID format: `hashId|slug`
- Check if manga exists on Comix.to
- Look for error messages in server logs

**Images not displaying:**
- Ensure referer header is being sent
- Check if image URLs are valid
- Verify CORS settings if needed

## 📚 Next Steps

1. **Integrate with existing manga pages**
   - Update `/pages/en/manga/[...id].tsx`
   - Modify chapter selection component
   - Update reader page

2. **Add provider selection UI**
   - Let users choose between providers
   - Save preference in local storage

3. **Implement reading progress**
   - Track current chapter and page
   - Sync across devices

4. **Add more providers**
   - MangaDex
   - MangaSee123
   - Other sources

## 💡 Tips

- Use the client library (`lib/manga/client.ts`) for cleaner code
- Leverage caching - identical requests are served from cache
- Handle loading and error states in your UI
- Preload next chapter for smoother reading experience
- Consider implementing image lazy loading for better performance

## 🆘 Need Help?

- 📖 Check `lib/manga/README.md` for detailed documentation
- 🧪 Run test script: `npx ts-node scripts/test-manga-provider.ts`
- 📝 Review example code in `lib/manga/client.ts`
- 📄 See full summary in `MANGA_BACKEND_UPDATE.md`

## ✅ Checklist

- [ ] Dev server running
- [ ] APIs tested and working
- [ ] Frontend integration started
- [ ] UI components updated
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] User testing completed

Happy coding! 🎉
