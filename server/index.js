require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const surveyRoutes = require('./routes/survey');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', surveyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🧠 Psychology Survey API running on http://localhost:${PORT}`);
  });
});
