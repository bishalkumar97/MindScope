const mongoose = require('mongoose');

// ─── Connect to MongoDB ───
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// ─── User Schema ───
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  age: { type: Number, required: true },
  gender: { type: String, default: '' },
  education: { type: String, default: '' },
  occupation: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
}, { timestamps: true });

// ─── Response Schema (individual answers) ───
const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  section: { type: String, required: true },
  questionIndex: { type: Number, required: true },
  questionText: { type: String, required: true },
  answer: { type: Number, required: true },
  answerText: { type: String, default: '' },
}, { timestamps: true });

// ─── Result Schema (personality analysis) ───
const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  invalidationScore: { type: Number },
  invalidationLevel: { type: String },
  attachmentStyle: { type: String },
  attachmentScore: { type: Number },
  reappraisalScore: { type: Number },
  suppressionScore: { type: Number },
  emotionRegulationTendency: { type: String },
  personalitySummary: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Response = mongoose.model('Response', responseSchema);
const Result = mongoose.model('Result', resultSchema);

module.exports = { connectDB, User, Response, Result };
