const { connectToDatabase, Endorsement } = require('../../lib/db');

module.exports = async (req, res) => {
    // 1. Setup CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // CRITICAL: We must allow GET here
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Admin-Key, Content-Type');

    // 2. Handle Options (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 4. Verify Admin Key
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await connectToDatabase();
        
        // 5. Fetch Data
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const items = await Endorsement.find(filter).sort({ submittedAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        console.error("Admin Fetch Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};