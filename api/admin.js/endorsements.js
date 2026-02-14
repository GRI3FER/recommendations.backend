const { connectDB, Endorsement } = require('../../lib/db');

// Admin authentication middleware
function checkAdminAuth(req) {
    const adminKey = req.headers['x-admin-key'];
    return adminKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check authentication
    if (!checkAdminAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await connectDB();

        const { status } = req.query;
        const query = status ? { status } : {};

        const endorsements = await Endorsement.find(query)
            .sort({ submittedDate: -1 });

        res.status(200).json(endorsements);
    } catch (error) {
        console.error('Error fetching endorsements:', error);
        res.status(500).json({ error: 'Failed to fetch endorsements' });
    }
};