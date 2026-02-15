require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// --- 1. CRITICAL: ALLOW FRONTEND ACCESS (CORS) ---
app.use(cors({
    origin: '*', // Allow your local website to talk to this backend
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these actions
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// --- 2. CONNECT TO DATABASE ---
if (!process.env.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is missing in Vercel Environment Variables!");
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- 3. DEFINE DATA MODEL ---
const Endorsement = mongoose.model('Endorsement', new mongoose.Schema({
    name: String,
    role: String,
    relationship: String,
    endorsement: String,
    linkedin: String,
    email: String,
    status: { type: String, default: 'pending' }
}));

// --- 4. API ROUTES ---

// GET: Test if server is running
app.get('/', (req, res) => {
    res.send("Backend is running! 🚀 Use /api/endorsements");
});

// GET: Fetch endorsements
app.get('/api/endorsements', async (req, res) => {
    try {
        const approved = await Endorsement.find({ status: 'approved' });
        res.json(approved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Submit new endorsement
app.post('/api/endorsements', async (req, res) => {
    try {
        console.log("📥 Received submission:", req.body); // Log for debugging
        const newItem = await Endorsement.create(req.body);
        res.status(201).json({ message: 'Success', item: newItem });
    } catch (err) {
        console.error("❌ Save Error:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- 5. REQUIRED FOR VERCEL ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app; // <--- THIS IS THE MAGIC LINE VERCEL NEEDS