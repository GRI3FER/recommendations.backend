const { connectDB, Endorsement } = require('../lib/db');
const { sendAdminNotification } = require('../lib/email');

module.exports = async (req, res) => {
    // Set CORS headers FIRST
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST for actual submissions
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, role, relationship, endorsement, linkedin, email } = req.body;

        // Validation
        if (!name || !role || !relationship || !endorsement || !linkedin || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate LinkedIn URL
        if (!linkedin.includes('linkedin.com/in/')) {
            return res.status(400).json({ error: 'Invalid LinkedIn URL' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await connectDB();

        // Create new endorsement
        const newEndorsement = new Endorsement({
            name,
            role,
            relationship,
            endorsement,
            linkedin,
            email,
            status: 'pending'
        });

        await newEndorsement.save();

        // Send email notification (don't await to avoid timeout)
        sendAdminNotification(newEndorsement).catch(err => 
            console.error('Email notification error:', err)
        );

        res.status(201).json({
            message: 'Endorsement submitted successfully',
            id: newEndorsement._id
        });

    } catch (error) {
        console.error('Error submitting endorsement:', error);
        res.status(500).json({ error: 'Failed to submit endorsement' });
    }
};