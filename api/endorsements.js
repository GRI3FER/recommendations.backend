const { connectDB, Endorsement } = require('../lib/db');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const endorsements = await Endorsement.find({ status: 'approved' })
            .select('-email') // Don't expose emails publicly
            .sort({ approvedDate: -1 });

        res.status(200).json(endorsements);
    } catch (error) {
        console.error('Error fetching endorsements:', error);
        res.status(500).json({ error: 'Failed to fetch endorsements' });
    }
};