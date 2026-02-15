// Only load dotenv in local development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');

// Use global cache for serverless (Vercel safe)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Endorsement Schema
const endorsementSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        relationship: { type: String, required: true, trim: true },
        endorsement: { type: String, required: true, trim: true },
        linkedin: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        linkedinProfilePic: { type: String },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true
        },
        approvedDate: { type: Date }
    },
    {
        timestamps: { createdAt: 'submittedDate', updatedAt: true }
    }
);

// Index for faster public queries
endorsementSchema.index({ status: 1, approvedDate: -1 });

const Endorsement = mongoose.models.Endorsement || mongoose.model('Endorsement', EndorsementSchema, 'endorsements');

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = { connectDB, Endorsement };
