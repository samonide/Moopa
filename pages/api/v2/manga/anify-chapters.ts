import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Manga ID is required' });
    }

    try {
        let cached;
        const cacheKey = `anify:chapters:${id}`;

        // Check cache
        if (redis) {
            cached = await redis.get(cacheKey);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }
        }

        // Fetch from Anify with 8s timeout
        const { data } = await axios.get(
            `https://api.anify.tv/chapters/${id}`,
            {
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
            }
        );

        if (!data) {
            return res.status(404).json({ error: 'No chapters found' });
        }

        // Cache for 24 hours
        if (redis) {
            await redis.set(cacheKey, JSON.stringify(data), 'EX', 60 * 60 * 24);
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Anify chapters error:', error.message);

        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return res.status(504).json({ error: 'Anify API timeout' });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        return res.status(500).json({ error: 'Failed to fetch chapters' });
    }
}
