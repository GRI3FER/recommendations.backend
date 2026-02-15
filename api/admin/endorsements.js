// api/admin/endorsements.js
const { connectDB, Endorsement } = require('../../lib/db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Admin-Key, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // FIXED: Changed connectToDatabase to connectDB
        await connectDB();
        
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const items = await Endorsement.find(filter).sort({ submittedDate: -1 });
        res.status(200).json(items);
    } catch (err) {
        console.error("Admin Fetch Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};