/**
 * AniCrush Provider
 * Handles search, episode fetching, and streaming for anicrush.to
 */

export interface SearchOptions {
    query: string;
    dub: boolean;
    media: {
        romajiTitle: string;
        englishTitle?: string;
        startDate?: { year?: number; month?: number; day?: number };
    };
}

export interface SearchResult {
    id: string;
    title: string;
    url: string;
    subOrDub: string;
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
    url?: string;
}

export interface EpisodeDetails {
    id: string;
    number: number;
    url: string;
    title: string;
}

export interface VideoSource {
    url: string;
    type: "hls" | "mp4";
    quality: string;
}

export interface Subtitle {
    id: string;
    language: string;
    url: string;
    isDefault?: boolean;
}

export interface EpisodeServer {
    server: string;
    headers: Record<string, string>;
    videoSources: Array<{
        url: string;
        type: "hls" | "mp4";
        quality: string;
        subtitles: Subtitle[];
    }>;
    intro?: { start: number; end: number };
    outro?: { start: number; end: number };
}

class AniCrushProvider {
    private baseUrl = "https://anicrush.to";

    getSettings() {
        return {
            episodeServers: ["Southcloud-1", "Southcloud-2", "Southcloud-3"],
            supportsDub: true,
        };
    }

    private normalize(title: string): string {
        return (title || "")
            .toLowerCase()
            .replace(/(season|cour|part)/g, "")
            .replace(/\d+(st|nd|rd|th)/g, (m) => m.replace(/st|nd|rd|th/, ""))
            .replace(/[^a-z0-9]+/g, "")
            .replace(/(?<!i)ii(?!i)/g, "2");
    }

    private normalizeTitle(title: string): string {
        return (title || "")
            .toLowerCase()
            .replace(/(season|cour|part|uncensored)/g, "")
            .replace(/\d+(st|nd|rd|th)/g, (m) => m.replace(/st|nd|rd|th/, ""))
            .replace(/[^a-z0-9]+/g, "");
    }

    private normalizeDate(dateStr: string): { year: number; month: number } | null {
        if (!dateStr) return null;
        const months: Record<string, string> = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04",
            May: "05", Jun: "06", Jul: "07", Aug: "08",
            Sep: "09", Oct: "10", Nov: "11", Dec: "12",
        };
        const m = dateStr.match(/([A-Za-z]+)\s+\d{1,2},\s*(\d{4})/);
        if (!m) return null;
        return { year: parseInt(m[2]), month: parseInt(months[m[1]]) };
    }

    private levenshteinSimilarity(a: string, b: string): number {
        const lenA = a.length;
        const lenB = b.length;
        const dp = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));

        for (let i = 0; i <= lenA; i++) dp[i][0] = i;
        for (let j = 0; j <= lenB; j++) dp[0][j] = j;

        for (let i = 1; i <= lenA; i++) {
            for (let j = 1; j <= lenB; j++) {
                if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
                else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }

        const distance = dp[lenA][lenB];
        const maxLen = Math.max(lenA, lenB);
        return 1 - distance / maxLen;
    }

    private async fetchMatches(url: string): Promise<any[]> {
        try {
            const html = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json",
                    "Referer": this.baseUrl + "/",
                    "Origin": this.baseUrl,
                    "X-Site": "anicrush",
                },
            }).then((res) => res.json());

            return html.result?.movies?.map((movie: any) => ({
                id: movie.id,
                pageUrl: movie.slug,
                title: movie.name_english ? movie.name_english : movie.name,
                titleJP: movie.name,
                normTitleJP: this.normalize(movie.name),
                normTitle: this.normalize(movie.name_english ? movie.name_english : movie.name),
                dub: movie.has_dub,
                startDate: this.normalizeDate(movie.aired_from),
            })) ?? [];
        } catch (error) {
            console.error("AniCrush search error:", error);
            return [];
        }
    }

    async search(query: SearchOptions): Promise<SearchResult[]> {
        const start = query.media.startDate;
        const targetNormJP = this.normalize(query.media.romajiTitle);
        const targetNorm = query.media.englishTitle
            ? this.normalize(query.media.englishTitle)
            : targetNormJP;

        const url = `https://api.anicrush.to/shared/v2/movie/list?keyword=${encodeURIComponent(query.query)}&limit=48&page=1`;
        let matches = await this.fetchMatches(url);

        if (!matches.length) return [];

        if (query.dub) matches = matches.filter((m) => m.dub);

        let filtered = matches.filter((m) => {
            const titleMatch = m.normTitle === targetNorm || m.normTitleJP === targetNormJP;
            const dateMatch =
                m.startDate?.year === start?.year &&
                m.startDate?.month === start?.month;
            return titleMatch && dateMatch;
        });

        if (!filtered.length) {
            filtered = matches.filter((m) => {
                const titleMatch = m.normTitle === targetNorm || m.normTitleJP === targetNormJP;
                const dateMatch = m.startDate?.year === start?.year;
                return titleMatch && dateMatch;
            });
        }

        if (!filtered.length) {
            filtered = matches.filter((m) => {
                const titleMatch =
                    m.normTitle.includes(targetNorm) ||
                    m.normTitleJP.includes(targetNormJP) ||
                    targetNorm.includes(m.normTitle) ||
                    targetNormJP.includes(m.normTitleJP) ||
                    this.levenshteinSimilarity(m.normTitle, targetNorm) > 0.7 ||
                    this.levenshteinSimilarity(m.normTitleJP, targetNormJP) > 0.7;
                const dateMatch =
                    m.startDate?.year === start?.year &&
                    m.startDate?.month === start?.month;
                return titleMatch && dateMatch;
            });
        }

        if (!filtered.length) {
            filtered = matches.filter((m) => {
                const titleMatch =
                    m.normTitle.includes(targetNorm) ||
                    m.normTitleJP.includes(targetNormJP) ||
                    targetNorm.includes(m.normTitle) ||
                    targetNormJP.includes(m.normTitleJP) ||
                    this.levenshteinSimilarity(m.normTitle, targetNorm) > 0.7 ||
                    this.levenshteinSimilarity(m.normTitleJP, targetNormJP) > 0.7;
                const dateMatch = m.startDate?.year === start?.year;
                return titleMatch && dateMatch;
            });
        }

        let results = filtered.map((m) => ({
            id: `${m.id}/${query.dub ? "dub" : "sub"}`,
            title: m.title,
            url: `${this.baseUrl}/detail/${m.pageUrl}.${m.id}`,
            subOrDub: query.dub ? "dub" : "sub",
        }));

        if (!query.media.startDate || !query.media.startDate.year) {
            filtered = matches.filter((m) => {
                const titleMatch =
                    this.normalizeTitle(m.title) === this.normalizeTitle(query.query) ||
                    this.normalizeTitle(m.titleJP) === this.normalizeTitle(query.query) ||
                    this.normalizeTitle(m.title).includes(this.normalizeTitle(query.query)) ||
                    this.normalizeTitle(m.titleJP).includes(this.normalizeTitle(query.query)) ||
                    this.normalizeTitle(query.query).includes(this.normalizeTitle(m.title)) ||
                    this.normalizeTitle(query.query).includes(this.normalizeTitle(m.titleJP));
                return titleMatch;
            });

            filtered.sort((a, b) => {
                const A = this.normalizeTitle(a.title);
                const B = this.normalizeTitle(b.title);
                if (A.length !== B.length) {
                    return A.length - B.length;
                }
                return A.localeCompare(B);
            });

            results = filtered.map((m) => ({
                id: `${m.id}/${query.dub ? "dub" : "sub"}`,
                title: m.title,
                url: `${this.baseUrl}/detail/${m.pageUrl}.${m.id}`,
                subOrDub: query.dub ? "dub" : "sub",
            }));
        }

        return results;
    }

    async findEpisodes(Id: string): Promise<Episode[]> {
        const [id, subOrDub] = Id.split("/");

        try {
            const epRes = await fetch(
                `https://api.anicrush.to/shared/v2/episode/list?_movieId=${id}`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Accept": "application/json",
                        "Referer": this.baseUrl + "/",
                        "Origin": this.baseUrl,
                        "X-Site": "anicrush",
                    },
                }
            );

            const epJson = await epRes.json();
            const episodeGroups = epJson?.result ?? {};
            const episodes: Episode[] = [];

            for (const group of Object.values(episodeGroups)) {
                if (!Array.isArray(group)) continue;

                for (const ep of group as any[]) {
                    episodes.push({
                        id: `${id}/${subOrDub}`,
                        number: ep.number,
                        title: ep.name_english,
                        url: "",
                    });
                }
            }

            return episodes;
        } catch (error) {
            console.error("AniCrush findEpisodes error:", error);
            return [];
        }
    }

    async findEpisodeServer(episode: EpisodeDetails, _server: string = "Southcloud-1"): Promise<EpisodeServer> {
        const [id, subOrDub] = episode.id.split("/");

        const serverMap: Record<string, number> = {
            "Southcloud-1": 4,
            "Southcloud-2": 1,
            "Southcloud-3": 6,
        };

        const sv = serverMap[_server] ?? 4;

        try {
            const encryptedLinkUrl = `https://api.anicrush.to/shared/v2/episode/sources?_movieId=${id}&ep=${episode.number}&sv=${sv}&sc=${subOrDub}`;

            const res = await fetch(encryptedLinkUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json",
                    "Referer": this.baseUrl + "/",
                    "Origin": this.baseUrl,
                    "X-Site": "anicrush",
                },
            });

            const json = await res.json();
            const encryptedIframe = json?.result?.link;
            if (!encryptedIframe) throw new Error("Missing encrypted iframe link");

            let decryptData = null;
            try {
                decryptData = await this.extractMegaCloud(encryptedIframe);
            } catch (err) {
                console.warn("Primary decrypter failed:", err);
            }

            if (!decryptData) {
                console.warn("Primary decrypter failed — trying ShadeOfChaos fallback...");
                try {
                    const fallbackRes = await fetch(
                        `https://ac-api.ofchaos.com/api/anime/embed/convert/v2?embedUrl=${encodeURIComponent(encryptedIframe)}`
                    );
                    decryptData = await fallbackRes.json();
                } catch (fallbackErr) {
                    console.error("Fallback decrypter failed:", fallbackErr);
                }
            }

            if (!decryptData) throw new Error("No video sources from any decrypter");

            const streamSource =
                decryptData.sources?.find((s: any) => s.type === "hls") ||
                decryptData.sources?.find((s: any) => s.type === "mp4");

            if (!streamSource?.file) throw new Error("No valid stream file found");

            const subtitles = (decryptData.tracks || [])
                .filter((t: any) => t.kind === "captions")
                .map((track: any, index: number) => ({
                    id: `sub-${index}`,
                    language: track.label || "Unknown",
                    url: track.file,
                    isDefault: !!track.default,
                }));

            return {
                server: _server,
                headers: {
                    "Referer": "https://megacloud.club/",
                    "Origin": "https://megacloud.club",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                },
                videoSources: [
                    {
                        url: streamSource.file,
                        type: streamSource.type,
                        quality: "auto",
                        subtitles,
                    },
                ],
            };
        } catch (err) {
            console.error(`AniCrush failed on ${_server}:`, err);
            throw new Error(`No stream found for ${_server}`);
        }
    }

    private async extractMegaCloud(embedUrl: string): Promise<any> {
        const url = new URL(embedUrl);
        const baseDomain = `${url.protocol}//${url.host}/`;

        const headers = {
            Accept: "*/*",
            "X-Requested-With": "XMLHttpRequest",
            Referer: baseDomain,
            "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        };

        const html = await fetch(embedUrl, { headers }).then((r) => r.text());

        const fileIdMatch = html.match(/<title>\s*File\s+#([a-zA-Z0-9]+)\s*-/i);
        if (!fileIdMatch) throw new Error("file_id not found in embed page");
        const fileId = fileIdMatch[1];

        let nonce: string | null = null;
        const match48 = html.match(/\b[a-zA-Z0-9]{48}\b/);
        if (match48) {
            nonce = match48[0];
        } else {
            const match3x16 = [...html.matchAll(/["']([A-Za-z0-9]{16})["']/g)];
            if (match3x16.length >= 3) {
                nonce = match3x16[0][1] + match3x16[1][1] + match3x16[2][1];
            }
        }
        if (!nonce) throw new Error("nonce not found");

        const sourcesJson = await fetch(
            `${baseDomain}embed-2/v3/e-1/getSources?id=${fileId}&_k=${nonce}`,
            { headers }
        ).then((r) => r.json());

        return {
            sources: sourcesJson.sources,
            tracks: sourcesJson.tracks || [],
            intro: sourcesJson.intro || null,
            outro: sourcesJson.outro || null,
            server: sourcesJson.server || null,
        };
    }
}

export const anicrushProvider = new AniCrushProvider();
