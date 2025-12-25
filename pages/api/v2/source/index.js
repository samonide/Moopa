import { rateLimiterRedis, redis } from "@/lib/redis";
import { getAnimeSource } from "@/lib/consumet/anime/source";
import { getHiAnimeSource } from "@/lib/hianime/episodes";
import { getAniCrushSource } from "@/lib/anicrush/episodes";
import axios from "axios";

async function consumetSource(id) {
  try {
    const data = await getAnimeSource(id)

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function anifySource(providerId, watchId, episode, id, sub) {
  try {
    const { data } = await axios.get(
      `https://api.anify.tv/sources?providerId=${providerId}&watchId=${encodeURIComponent(
        watchId
      )}&episodeNumber=${episode}&id=${id}&subType=${sub}`
    );
    return data;
  } catch (error) {
    return { error: error.message, status: error.response.status };
  }
}

async function hiAnimeSource(episodeId, server = "HD-1") {
  try {
    const data = await getHiAnimeSource(episodeId, server);
    return data;
  } catch (error) {
    console.error("HiAnime source error:", error);
    return { error: error.message };
  }
}

async function anicrushSource(episodeId, server = "Southcloud-1") {
  try {
    const data = await getAniCrushSource(episodeId, server);
    return data;
  } catch (error) {
    console.error("AniCrush source error:", error);
    return { error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (redis) {
    try {
      const ipAddress = req.socket.remoteAddress;
      await rateLimiterRedis.consume(ipAddress);
    } catch (error) {
      return res.status(429).json({
        error: `Too Many Requests, retry after ${error.msBeforeNext / 1000}`,
      });
    }
  }

  const { source, providerId, watchId, episode, id, sub = "sub", server } = req.body;

  // Map source1, source2, etc. to actual provider names
  const sourceMap = {
    'source1': 'hianime',
    'source2': 'anicrush',
    'source3': 'consumet',
  };

  const mappedSource = sourceMap[source] || source;

  if (mappedSource === "hianime") {
    const data = await hiAnimeSource(watchId, server);
    console.log("HiAnime source response:", JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  }

  if (mappedSource === "anicrush") {
    const data = await anicrushSource(watchId, server);
    console.log("AniCrush source response:", JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  }

  if (mappedSource === "anify") {
    const data = await anifySource(providerId, watchId, episode, id, sub);
    return res.status(200).json(data);
  }

  if (mappedSource === "consumet") {
    const data = await consumetSource(watchId);
    return res.status(200).json(data);
  }
}
