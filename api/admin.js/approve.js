const { connectDB, Endorsement } = require('../../lib/db');
const { sendApprovalNotification } = require('../../lib/email');

// Admin authentication middleware
function checkAdminAuth(req) {
    const adminKey = req.headers['x-admin-key'];
    return adminKey === process.env.ADMIN_KEY;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
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

        const endorsement = await Endorsement.findById(id);

        if (!endorsement) {
            return res.status(404).json({ error: 'Endorsement not found' });
        }

        endorsement.status = 'approved';
        endorsement.approvedDate = new Date();
        await endorsement.save();

        // Send approval notification (don't await to avoid timeout)
        sendApprovalNotification(endorsement).catch(err =>
            console.error('Approval email error:', err)
        );

        res.status(200).json({
            message: 'Endorsement approved',
            endorsement
        });

    } catch (error) {
        console.error('Error approving endorsement:', error);
        res.status(500).json({ error: 'Failed to approve endorsement' });
    }
};