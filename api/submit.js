// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { connectDB, Endorsement } = require('../lib/db');
const { sendAdminNotification } = require('../lib/email');

module.exports = async (req, res) => {
    // CORS
    const allowedOrigin = process.env.FRONTEND_URL || '*';

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let { name, role, relationship, endorsement, linkedin, email } = req.body;

        // Normalize input
        name = name?.trim();
        role = role?.trim();
        relationship = relationship?.trim();
        endorsement = endorsement?.trim();
        linkedin = linkedin?.trim();
        email = email?.trim().toLowerCase();

        // Required validation
        if (!name || !role || !relationship || !endorsement || !linkedin || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Length guards (basic abuse protection)
        if (endorsement.length > 5000) {
            return res.status(400).json({ error: 'Endorsement is too long' });
        }

        if (name.length > 100 || role.length > 150) {
            return res.status(400).json({ error: 'Input exceeds allowed length' });
        }

        // Validate LinkedIn URL
        const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;
        if (!linkedinRegex.test(linkedin)) {
            return res.status(400).json({ error: 'Invalid LinkedIn URL' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        await connectDB();

        const newEndorsement = await Endorsement.create({
            name,
            role,
            relationship,
            endorsement,
            linkedin,
            email,
            status: 'pending',
            createdAt: new Date()
        });

        // Send admin email (non-blocking)
        sendAdminNotification(newEndorsement).catch(err =>
            console.error('Email notification error:', err)
        );

        return res.status(201).json({
            message: 'Endorsement submitted successfully',
            id: newEndorsement._id
        });

    } catch (error) {
        console.error('Error submitting endorsement:', error);
        return res.status(500).json({ error: 'Failed to submit endorsement' });
    }
};
