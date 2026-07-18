const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*', // We will restrict this in production
  exposedHeaders: ['Authorization']
}));
app.use(express.json());

// Basic Health Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Import Routes
const authRoutes = require('./routes/auth');
const verifyRoutes = require('./routes/verify');
const reportRoutes = require('./routes/report');

app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/report', reportRoutes);

// Fallback for 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Start Server
app.listen(PORT, () => {
  console.log(`Vero Backend API running on port ${PORT}`);
});
