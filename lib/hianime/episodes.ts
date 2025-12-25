/**
 * HiAnime Episodes Integration
 * Adapts HiAnime provider to work with Moopa's episode structure
 */

import { hiAnimeProvider } from "./provider";
import type { Episode } from "@/types/api/Episode";

export interface HiAnimeEpisodeData {
  map?: boolean;
  providerId: string;
  episodes: {
    sub: Episode[];
    dub: Episode[];
  };
}

/**
 * Fetch episodes from HiAnime for a given anime
 * @param anilistId - AniList ID of the anime
 * @param title - Title of the anime (preferably romaji or english)
 * @param romajiTitle - Romaji title
 * @param englishTitle - English title
 * @param startDate - Start date of the anime
 * @returns Episode data in Moopa format
 */
export async function fetchHiAnimeEpisodes(
  _anilistId: string,
  title: string,
  romajiTitle?: string,
  englishTitle?: string,
  startDate?: { year?: number; month?: number; day?: number }
): Promise<HiAnimeEpisodeData> {
  try {
    // Search for both sub and dub versions
    const [subResults, dubResults] = await Promise.all([
      hiAnimeProvider.search({
        query: title,
        dub: false,
        media: {
          romajiTitle: romajiTitle || title,
          englishTitle: englishTitle,
          startDate: startDate,
        },
      }),
      hiAnimeProvider.search({
        query: title,
        dub: true,
        media: {
          romajiTitle: romajiTitle || title,
          englishTitle: englishTitle,
          startDate: startDate,
        },
      }),
    ]);

    // Get the best match (first result is usually the most accurate)
    const subMatch = subResults[0];
    const dubMatch = dubResults[0];

    let subEpisodes: Episode[] = [];
    let dubEpisodes: Episode[] = [];

    // Fetch sub episodes
    if (subMatch) {
      const episodes = await hiAnimeProvider.findEpisodes(subMatch.id);
      subEpisodes = episodes.map((ep) => ({
        id: ep.id,
        title: ep.title || `Episode ${ep.number}`,
        img: "" as any,
        number: ep.number,
        createdAt: undefined,
        description: "",
        url: ep.url,
      }));
    }

    // Fetch dub episodes
    if (dubMatch) {
      const episodes = await hiAnimeProvider.findEpisodes(dubMatch.id);
      dubEpisodes = episodes.map((ep) => ({
        id: ep.id,
        title: ep.title || `Episode ${ep.number}`,
        img: "" as any,
        number: ep.number,
        createdAt: undefined,
        description: "",
        url: ep.url,
        hasDub: true,
      }));
    }

    return {
      map: true,
      providerId: "hianime",
      episodes: {
        sub: subEpisodes,
        dub: dubEpisodes,
      },
    };
  } catch (error: any) {
    console.error("Error fetching HiAnime episodes:", error.message);
    return {
      map: true,
      providerId: "hianime",
      episodes: {
        sub: [],
        dub: [],
      },
    };
  }
}

/**
 * Get streaming source from HiAnime
 * @param episodeId - Episode ID in format "episodeId/subOrDub"
 * @param server - Server name (HD-1, HD-2, etc.)
 * @returns Streaming source data
 */
export async function getHiAnimeSource(episodeId: string, server: string = "HD-1") {
  try {
    // Create episode object
    const episode = {
      id: episodeId,
      number: 0, // Not used in findEpisodeServer
      url: "",
      title: "",
    };

    const serverData = await hiAnimeProvider.findEpisodeServer(episode, server);

    // Format response to match Moopa's expected structure (Anify format)
    return {
      sources: serverData.videoSources.map((source) => ({
        url: source.url,
        quality: source.type === "m3u8" ? "auto" : source.quality,
      })),
      subtitles: serverData.videoSources[0]?.subtitles?.map((sub) => ({
        url: sub.url,
        lang: sub.language,
      })) || [],
      headers: serverData.headers,
      intro: serverData.intro,
      outro: serverData.outro,
    };
  } catch (error: any) {
    console.error("Error getting HiAnime source:", error.message);
    throw new Error(`Failed to get streaming source: ${error.message}`);
  }
}
