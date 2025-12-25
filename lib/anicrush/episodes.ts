/**
 * AniCrush Episodes Integration
 * Adapts AniCrush provider to work with Moopa's episode structure
 */

import { anicrushProvider } from "./provider";
import type { Episode } from "@/types/api/Episode";

export interface AniCrushEpisodeData {
    map?: boolean;
    providerId: string;
    episodes: {
        sub: Episode[];
        dub: Episode[];
    };
}

export async function fetchAniCrushEpisodes(
    _anilistId: string,
    title: string,
    romajiTitle?: string,
    englishTitle?: string,
    startDate?: { year?: number; month?: number; day?: number }
): Promise<AniCrushEpisodeData> {
    try {
        // Search for both sub and dub versions
        const [subResults, dubResults] = await Promise.all([
            anicrushProvider.search({
                query: title,
                dub: false,
                media: {
                    romajiTitle: romajiTitle || title,
                    englishTitle: englishTitle,
                    startDate: startDate,
                },
            }),
            anicrushProvider.search({
                query: title,
                dub: true,
                media: {
                    romajiTitle: romajiTitle || title,
                    englishTitle: englishTitle,
                    startDate: startDate,
                },
            }),
        ]);

        if (!subResults.length) {
            return {
                providerId: "anicrush",
                episodes: {
                    sub: [],
                    dub: [],
                },
            };
        }

        // Fetch episodes for both sub and dub
        const subAnimeId = subResults[0]?.id;
        const dubAnimeId = dubResults[0]?.id;

        const [subEpisodes, dubEpisodes] = await Promise.all([
            subAnimeId ? anicrushProvider.findEpisodes(subAnimeId) : Promise.resolve([]),
            dubAnimeId ? anicrushProvider.findEpisodes(dubAnimeId) : Promise.resolve([]),
        ]);

        // Format episodes to Moopa structure
        const formattedSub: Episode[] = subEpisodes.map((ep) => ({
            id: ep.id,
            number: ep.number,
            title: ep.title || `Episode ${ep.number}`,
            url: ep.url || "",
            description: "",
            img: "",
        }));

        const formattedDub: Episode[] = dubEpisodes.map((ep) => ({
            id: ep.id,
            number: ep.number,
            title: ep.title || `Episode ${ep.number}`,
            url: ep.url || "",
            description: "",
            img: "",
        }));

        return {
            map: true,
            providerId: "anicrush",
            episodes: {
                sub: formattedSub,
                dub: formattedDub,
            },
        };
    } catch (error) {
        console.error("Error fetching AniCrush episodes:", error);
        return {
            providerId: "anicrush",
            episodes: {
                sub: [],
                dub: [],
            },
        };
    }
}

export async function getAniCrushSource(episodeId: string, server: string = "Southcloud-1") {
    try {
        const episodeNumber = 1;

        const episode = {
            id: episodeId,
            number: episodeNumber,
            url: "",
            title: "",
        };

        const serverData = await anicrushProvider.findEpisodeServer(episode, server);

        // Format response to match Moopa's expected structure
        return {
            sources: serverData.videoSources.map((source) => ({
                url: source.url,
                quality: source.quality,
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
        console.error("Error getting AniCrush source:", error.message);
        throw new Error(`Failed to get streaming source: ${error.message}`);
    }
}
