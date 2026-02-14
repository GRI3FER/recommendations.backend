const mongoose = require('mongoose');

let cachedConnection = null;

// Endorsement Schema
const endorsementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    relationship: { type: String, required: true },
    endorsement: { type: String, required: true },
    linkedin: { type: String, required: true },
    email: { type: String, required: true },
    linkedinProfilePic: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedDate: { type: Date, default: Date.now },
    approvedDate: { type: Date }
});

const Endorsement = mongoose.models.Endorsement || mongoose.model('Endorsement', endorsementSchema);

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('Please define MONGODB_URI environment variable');
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    cachedConnection = connection;
    return connection;
}

module.exports = { connectDB, Endorsement };