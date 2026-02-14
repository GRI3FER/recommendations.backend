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
    res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check authentication
    if (!checkAdminAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Endorsement ID required' });
        }

        await connectDB();

        const endorsement = await Endorsement.findByIdAndDelete(id);

        if (!endorsement) {
            return res.status(404).json({ error: 'Endorsement not found' });
        }

        res.status(200).json({ message: 'Endorsement deleted' });

    } catch (error) {
        console.error('Error deleting endorsement:', error);
        res.status(500).json({ error: 'Failed to delete endorsement' });
    }
};