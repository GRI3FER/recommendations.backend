const { connectDB, Endorsement } = require('../../lib/db');

module.exports = async (req, res) => {
    // 1. Setup CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

    // 2. Handle Options
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. CRITICAL FIX: Allow GET method (not POST)
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 4. Check Admin Key
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        // If visiting in browser, you will see this error (Unauthorized). 
        // This is normal! You must use the Admin Panel HTML to view data.
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await connectDB();
        
        // 5. Get Data (Allow filtering by ?status=pending)
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