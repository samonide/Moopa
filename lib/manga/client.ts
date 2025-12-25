/**
 * Example Frontend Integration for Manga Provider System
 * 
 * This file demonstrates how to use the new manga backend APIs
 * in frontend components.
 */

// ==================== TYPES ====================

interface MangaSearchResult {
    id: string;
    title: string;
    synonyms?: string[];
    year?: number;
    image: string;
}

interface MangaChapter {
    id: string;
    url: string;
    title: string;
    chapter: string;
    index: number;
    scanlator?: string;
    language?: string;
}

interface MangaPage {
    url: string;
    index: number;
    headers?: {
        Referer: string;
    };
}

// ==================== API FUNCTIONS ====================

/**
 * Search for manga
 */
export async function searchManga(
    query: string,
    provider: string = 'comix'
): Promise<MangaSearchResult[]> {
    try {
        const response = await fetch(
            `/api/v2/manga/search?query=${encodeURIComponent(query)}&provider=${provider}`
        );

        if (!response.ok) {
            throw new Error('Failed to search manga');
        }

        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

/**
 * Get chapters for a manga
 */
export async function getMangaChapters(
    mangaId: string,
    provider: string = 'comix'
): Promise<MangaChapter[]> {
    try {
        const response = await fetch(
            `/api/v2/manga/chapters?mangaId=${encodeURIComponent(mangaId)}&provider=${provider}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch chapters');
        }

        return await response.json();
    } catch (error) {
        console.error('Chapters error:', error);
        return [];
    }
}

/**
 * Get pages for a chapter
 */
export async function getChapterPages(
    chapterId: string,
    provider: string = 'comix'
): Promise<MangaPage[]> {
    try {
        const response = await fetch(
            `/api/v2/manga/pages?chapterId=${encodeURIComponent(chapterId)}&provider=${provider}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch pages');
        }

        return await response.json();
    } catch (error) {
        console.error('Pages error:', error);
        return [];
    }
}

// ==================== REACT COMPONENT EXAMPLE ====================

/*
import { useState, useEffect } from 'react';

export function MangaSearchExample() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const data = await searchManga(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search manga..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <div>
        {results.map((manga) => (
          <div key={manga.id}>
            <img src={manga.image} alt={manga.title} />
            <h3>{manga.title}</h3>
            {manga.synonyms && <p>{manga.synonyms.join(', ')}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MangaChaptersExample({ mangaId }: { mangaId: string }) {
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapters() {
      setLoading(true);
      const data = await getMangaChapters(mangaId);
      setChapters(data);
      setLoading(false);
    }
    fetchChapters();
  }, [mangaId]);

  if (loading) return <div>Loading chapters...</div>;

  return (
    <div>
      <h2>Chapters</h2>
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <a href={`/read?chapterId=${chapter.id}`}>
            {chapter.title}
          </a>
          {chapter.scanlator && <span>by {chapter.scanlator}</span>}
        </div>
      ))}
    </div>
  );
}

export function MangaReaderExample({ chapterId }: { chapterId: string }) {
  const [pages, setPages] = useState<MangaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    async function fetchPages() {
      setLoading(true);
      const data = await getChapterPages(chapterId);
      setPages(data);
      setLoading(false);
    }
    fetchPages();
  }, [chapterId]);

  if (loading) return <div>Loading pages...</div>;

  return (
    <div>
      <div>
        Page {currentPage + 1} of {pages.length}
      </div>
      
      <img
        src={pages[currentPage]?.url}
        alt={`Page ${currentPage + 1}`}
        style={{ maxWidth: '100%' }}
      />
      
      <div>
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
*/

// ==================== INTEGRATION WITH EXISTING CODE ====================

/*
// In your existing manga page component:

import { searchManga, getMangaChapters, getChapterPages } from '@/lib/manga/client';

// Replace Anify API calls with new manga provider APIs:

// OLD:
const response = await fetch(`https://api.anify.tv/search-advanced?query=${query}&type=manga`);

// NEW:
const results = await searchManga(query, 'comix');

// OLD:
const chapters = await fetch(`https://api.anify.tv/chapters/${mangaId}`);

// NEW:
const chapters = await getMangaChapters(mangaId, 'comix');

// OLD:
const pages = await fetch(`https://api.anify.tv/pages?id=${id}&chapterNumber=${num}&providerId=${provider}`);

// NEW:
const pages = await getChapterPages(chapterId, 'comix');
*/

// ==================== ADVANCED USAGE ====================

/**
 * Search multiple providers and combine results
 */
export async function searchMultipleProviders(query: string): Promise<MangaSearchResult[]> {
    const providers = ['comix']; // Add more as they become available

    const results = await Promise.all(
        providers.map(provider => searchManga(query, provider))
    );

    // Flatten and deduplicate results
    const allResults = results.flat();
    const seen = new Set<string>();

    return allResults.filter(manga => {
        const key = manga.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Get chapters with fallback to another provider if first fails
 */
export async function getChaptersWithFallback(
    mangaId: string,
    primaryProvider: string = 'comix',
    fallbackProvider?: string
): Promise<MangaChapter[]> {
    let chapters = await getMangaChapters(mangaId, primaryProvider);

    if (chapters.length === 0 && fallbackProvider) {
        console.log(`Falling back to ${fallbackProvider}`);
        chapters = await getMangaChapters(mangaId, fallbackProvider);
    }

    return chapters;
}

/**
 * Preload next chapter pages for smoother reading
 */
export async function preloadNextChapter(
    currentChapterId: string,
    chapters: MangaChapter[],
    provider: string = 'comix'
): Promise<void> {
    const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
    if (currentIndex === -1 || currentIndex >= chapters.length - 1) return;

    const nextChapter = chapters[currentIndex + 1];
    const pages = await getChapterPages(nextChapter.id, provider);

    // Preload first few images
    pages.slice(0, 3).forEach(page => {
        const img = new Image();
        img.src = page.url;
    });
}

/**
 * Filter chapters by scanlator
 */
export function filterByScanlator(
    chapters: MangaChapter[],
    scanlator: string
): MangaChapter[] {
    return chapters.filter(c => c.scanlator === scanlator);
}

/**
 * Group chapters by scanlator
 */
export function groupByScanlator(
    chapters: MangaChapter[]
): Record<string, MangaChapter[]> {
    const grouped: Record<string, MangaChapter[]> = {};

    chapters.forEach(chapter => {
        const key = chapter.scanlator || 'Unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(chapter);
    });

    return grouped;
}

/**
 * Get available scanlators for a manga
 */
export function getAvailableScanlators(chapters: MangaChapter[]): string[] {
    const scanlators = new Set<string>();
    chapters.forEach(c => {
        if (c.scanlator) scanlators.add(c.scanlator);
    });
    return Array.from(scanlators).sort();
}

export default {
    searchManga,
    getMangaChapters,
    getChapterPages,
    searchMultipleProviders,
    getChaptersWithFallback,
    preloadNextChapter,
    filterByScanlator,
    groupByScanlator,
    getAvailableScanlators,
};
