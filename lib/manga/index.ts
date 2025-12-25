/**
 * Manga Provider Manager
 * Centralized interface for all manga providers
 */

import { comixProvider } from '../comix/provider';
import type {
    MangaSearchOptions,
    MangaSearchResult,
    MangaChapter,
    MangaPage,
} from '../comix/provider';

export type { MangaSearchOptions, MangaSearchResult, MangaChapter, MangaPage };

export interface MangaProvider {
    search: (opts: MangaSearchOptions) => Promise<MangaSearchResult[]>;
    findChapters: (mangaId: string) => Promise<MangaChapter[]>;
    findChapterPages: (chapterId: string) => Promise<MangaPage[]>;
    getSettings?: () => { supportsMultiScanlator?: boolean };
}

export const mangaProviders: Record<string, MangaProvider> = {
    comix: comixProvider,
};

export function getMangaProvider(providerId: string): MangaProvider | null {
    return mangaProviders[providerId] || null;
}

export async function searchManga(
    providerId: string,
    query: string
): Promise<MangaSearchResult[]> {
    const provider = getMangaProvider(providerId);
    if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
    }
    return provider.search({ query });
}

export async function getMangaChapters(
    providerId: string,
    mangaId: string
): Promise<MangaChapter[]> {
    const provider = getMangaProvider(providerId);
    if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
    }
    return provider.findChapters(mangaId);
}

export async function getMangaPages(
    providerId: string,
    chapterId: string
): Promise<MangaPage[]> {
    const provider = getMangaProvider(providerId);
    if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
    }
    return provider.findChapterPages(chapterId);
}
