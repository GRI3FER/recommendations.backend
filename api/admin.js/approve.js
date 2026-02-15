// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { connectDB, Endorsement } = require('../../lib/db');
const { sendApprovalNotification } = require('../../lib/email');

// Admin authentication
function checkAdminAuth(req) {
    const adminKey = req.headers['x-admin-key'];
    return adminKey && adminKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

    // Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
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

        const endorsement = await Endorsement.findById(id);

        if (!endorsement) {
            return res.status(404).json({ error: 'Endorsement not found' });
        }

        endorsement.status = 'approved';
        endorsement.approvedDate = new Date();
        await endorsement.save();

        // Fire-and-forget email to avoid serverless timeout
        sendApprovalNotification(endorsement)
            .catch(err => console.error('Approval email error:', err));

        return res.status(200).json({
            message: 'Endorsement approved',
            endorsement
        });

    } catch (error) {
        console.error('Error approving endorsement:', error);
        return res.status(500).json({ error: 'Failed to approve endorsement' });
    }
};
