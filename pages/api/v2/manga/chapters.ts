import { NextApiRequest, NextApiResponse } from 'next';
import { comixProvider } from '@/lib/comix/provider';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { mangaId, provider = 'comix' } = req.query;

    if (!mangaId || typeof mangaId !== 'string') {
        return res.status(400).json({ error: 'Manga ID parameter is required' });
    }

    try {
        let cached;
        const cacheKey = `manga:chapters:${provider}:${mangaId}`;

        // Check cache
        if (redis) {
            cached = await redis.get(cacheKey);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }
        }

        let chapters;

        // Route to appropriate provider
        switch (provider) {
            case 'comix':
                chapters = await comixProvider.findChapters(mangaId);
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        if (!chapters || chapters.length === 0) {
            return res.status(404).json({ error: 'No chapters found' });
        }

        // Cache results for 24 hours
        if (redis && chapters) {
            await redis.set(cacheKey, JSON.stringify(chapters), 'EX', 60 * 60 * 24);
        }

        res.status(200).json(chapters);
    } catch (error: any) {
        console.error('Manga chapters error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
