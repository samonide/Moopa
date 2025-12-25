import axios from "axios";

export const config = {
    api: {
        responseLimit: false,
    },
};

// Simple in-memory cache for M3U8 manifests
const manifestCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

function getCacheKey(url, referer, origin) {
    return `${url}|${referer}|${origin}`;
}

export default async function handler(req, res) {
    const { url, referer, origin } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        const decodedUrl = decodeURIComponent(url);
        const isM3u8 = decodedUrl.includes(".m3u8");

        // Check cache for M3U8 manifests
        if (isM3u8) {
            const cacheKey = getCacheKey(decodedUrl, referer, origin);
            const cached = manifestCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Range");
                res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
                res.setHeader("X-Cache", "HIT");
                return res.send(cached.data);
            }
        }

        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        };

        if (referer) {
            headers["Referer"] = referer;
        }

        if (origin) {
            headers["Origin"] = origin;
        }

        // Add range header if present (for seeking)
        if (req.headers.range) {
            headers["Range"] = req.headers.range;
        }

        const response = await axios.get(decodedUrl, {
            headers,
            responseType: isM3u8 ? "text" : "stream",
            validateStatus: (status) => status < 500,
        });

        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Range");

        // Handle M3U8 manifest - rewrite URLs to proxy through our endpoint
        if (isM3u8 && typeof response.data === "string") {
            const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf("/") + 1);

            // Rewrite relative URLs in the manifest to go through our proxy
            const rewrittenManifest = response.data
                .split("\n")
                .map((line) => {
                    // Skip comments and empty lines
                    if (line.startsWith("#") || !line.trim()) {
                        return line;
                    }

                    // If it's a relative URL, make it absolute and proxy it
                    if (!line.startsWith("http")) {
                        const absoluteUrl = line.startsWith("/")
                            ? new URL(decodedUrl).origin + line
                            : baseUrl + line;

                        return `/api/proxy/stream?url=${encodeURIComponent(absoluteUrl)}${referer ? `&referer=${encodeURIComponent(referer)}` : ""
                            }${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;
                    }

                    // If it's already an absolute URL, proxy it
                    return `/api/proxy/stream?url=${encodeURIComponent(line)}${referer ? `&referer=${encodeURIComponent(referer)}` : ""
                        }${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;
                })
                .join("\n");

            // Cache the rewritten manifest
            const cacheKey = getCacheKey(decodedUrl, referer, origin);
            manifestCache.set(cacheKey, {
                data: rewrittenManifest,
                timestamp: Date.now()
            });

            // Cleanup old cache entries
            if (manifestCache.size > 100) {
                const now = Date.now();
                for (const [key, value] of manifestCache.entries()) {
                    if (now - value.timestamp > CACHE_TTL) {
                        manifestCache.delete(key);
                    }
                }
            }

            res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
            res.setHeader("X-Cache", "MISS");
            res.status(response.status);
            return res.send(rewrittenManifest);
        }

        // For non-M3U8 files, forward headers and pipe response
        Object.keys(response.headers).forEach((key) => {
            // Skip some headers that shouldn't be forwarded
            if (
                !["connection", "keep-alive", "transfer-encoding"].includes(
                    key.toLowerCase()
                )
            ) {
                res.setHeader(key, response.headers[key]);
            }
        });

        // Set status code
        res.status(response.status);

        // Pipe the response
        response.data.pipe(res);
    } catch (error) {
        console.error("Proxy error:", error.message);
        res.status(500).json({ error: "Failed to proxy request" });
    }
}
