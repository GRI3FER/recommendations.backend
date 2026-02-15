// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { connectDB, Endorsement } = require('../../lib/db');

// Admin authentication
function checkAdminAuth(req) {
    const adminKey = req.headers['x-admin-key'];
    return adminKey && adminKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    // CORS headers
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

        return res.status(200).json({ 
            message: 'Endorsement deleted',
            id 
        });

    } catch (error) {
        console.error('Error deleting endorsement:', error);
        return res.status(500).json({ error: 'Failed to delete endorsement' });
    }
};
