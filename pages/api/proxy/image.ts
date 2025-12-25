import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, referer } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        if (referer && typeof referer === 'string') {
            headers['Referer'] = referer;
        }

        const response = await axios.get(url, {
            headers,
            responseType: 'arraybuffer',
            timeout: 15000,
        });

        // Set appropriate headers
        const contentType = response.headers['content-type'] || 'image/webp';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        res.setHeader('Access-Control-Allow-Origin', '*');

        return res.status(200).send(response.data);
    } catch (error: any) {
        console.error('Image proxy error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch image' });
    }
}
