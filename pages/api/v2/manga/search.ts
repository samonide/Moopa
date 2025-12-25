import { NextApiRequest, NextApiResponse } from 'next';
import { comixProvider } from '@/lib/comix/provider';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query, provider = 'comix' } = req.query;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        let cached;
        const cacheKey = `manga:search:${provider}:${query}`;

        // Check cache
        if (redis) {
            cached = await redis.get(cacheKey);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }
        }

        let results;

        // Route to appropriate provider
        switch (provider) {
            case 'comix':
                results = await comixProvider.search({ query });
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        // Cache results for 1 hour
        if (redis && results) {
            await redis.set(cacheKey, JSON.stringify(results), 'EX', 60 * 60);
        }

        res.status(200).json(results);
    } catch (error: any) {
        console.error('Manga search error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
