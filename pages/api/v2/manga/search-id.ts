import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { romaji, english, native } = req.query;

    if (!romaji && !english && !native) {
        return res.status(400).json({ error: 'At least one title parameter is required' });
    }

    try {
        const query = (english || romaji) as string;

        if (!query) {
            return res.status(400).json({ error: 'Valid title parameter is required' });
        }

        const { data } = await axios.get(
            `https://api.anify.tv/search-advanced?query=${encodeURIComponent(query)}&type=manga`,
            {
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
            }
        );

        const findManga = data?.results?.find(
            (manga: any) =>
                manga.title.romaji === romaji ||
                manga.title.english === english ||
                manga.title.native === native
        );

        if (!findManga) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        return res.status(200).json({ id: findManga.id });
    } catch (error: any) {
        console.error('Anify search error:', error.message);

        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return res.status(504).json({ error: 'Anify API timeout' });
        }

        return res.status(500).json({ error: 'Failed to search manga' });
    }
}
