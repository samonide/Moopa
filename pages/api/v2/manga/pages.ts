import { NextApiRequest, NextApiResponse } from 'next';
import { comixProvider } from '@/lib/comix/provider';
import { redis } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chapterId, provider = 'comix' } = req.query;

    if (!chapterId || typeof chapterId !== 'string') {
        return res.status(400).json({ error: 'Chapter ID parameter is required' });
    }

    try {
        let cached;
        const cacheKey = `manga:pages:${provider}:${chapterId}`;

        // Check cache
        if (redis) {
            cached = await redis.get(cacheKey);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }
        }

        let pages;

        // Route to appropriate provider
        switch (provider) {
            case 'comix':
                pages = await comixProvider.findChapterPages(chapterId);
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        if (!pages || pages.length === 0) {
            return res.status(404).json({ error: 'No pages found' });
        }

        // Cache results for 24 hours
        if (redis && pages) {
            await redis.set(cacheKey, JSON.stringify(pages), 'EX', 60 * 60 * 24);
        }

        res.status(200).json(pages);
    } catch (error: any) {
        console.error('Manga pages error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
