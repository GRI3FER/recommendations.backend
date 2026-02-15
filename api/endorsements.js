// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { connectDB, Endorsement } = require('../lib/db');

module.exports = async (req, res) => {
    // CORS (restrict to your frontend in production)
    const allowedOrigin = process.env.FRONTEND_URL || '*';

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const endorsements = await Endorsement.find({ status: 'approved' })
            .select('-email -__v') // exclude sensitive + internal fields
            .sort({ approvedDate: -1 })
            .lean(); // performance boost

        return res.status(200).json(endorsements);

    } catch (error) {
        console.error('Error fetching endorsements:', error);
        return res.status(500).json({ error: 'Failed to fetch endorsements' });
    }
};
