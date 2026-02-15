require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. CONNECT TO MONGODB ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
}
connectDB(); // Connect immediately when server starts

// --- 2. DEFINE THE DATA STRUCTURE (SCHEMA) ---
const endorsementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    relationship: { type: String, required: true },
    endorsement: { type: String, required: true },
    linkedin: { type: String, required: true },
    email: { type: String, required: true },
    linkedinProfilePic: String,
    status: { type: String, default: 'pending', enum: ['pending', 'approved'] },
    submittedAt: { type: Date, default: Date.now },
    approvedDate: Date
});

// The Model (This interacts with the database)
const Endorsement = mongoose.model('Endorsement', endorsementSchema);

// --- 3. PUBLIC ROUTES ---

// GET /api/endorsements (Only Approved)
app.get('/api/endorsements', async (req, res) => {
    try {
        const approved = await Endorsement.find({ status: 'approved' }).sort({ approvedDate: -1 });
        res.json(approved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/endorsements (Submit New)
app.post('/api/endorsements', async (req, res) => {
    try {
        const { name, role, relationship, endorsement, linkedin, email } = req.body;
        
        // Simple validation
        if (!name || !role || !relationship || !endorsement) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newEndorsement = await Endorsement.create({
            name, role, relationship, endorsement, linkedin, email
        });

        res.status(201).json({ message: 'Submitted successfully', endorsement: newEndorsement });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- 4. ADMIN ROUTES ---

// GET /api/admin/endorsements (View All)
app.get('/api/admin/endorsements', async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        // Sort by newest submission first
        const all = await Endorsement.find(query).sort({ submittedAt: -1 });
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/endorsements/:id/approve
app.post('/api/admin/endorsements/:id/approve', async (req, res) => {
    try {
        const updated = await Endorsement.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', approvedDate: new Date() },
            { new: true } // Return the updated document
        );
        
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Approved', endorsement: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/endorsements/:id (Reject/Delete)
app.delete('/api/admin/endorsements/:id', async (req, res) => {
    try {
        const deleted = await Endorsement.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));