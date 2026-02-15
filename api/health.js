// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = async (req, res) => {
    // Optional CORS (if this endpoint is called from frontend)
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(), // seconds
        timestamp: new Date().toISOString()
    });
};
