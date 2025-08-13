const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const authenticateToken = require('./auth');
const { createJob, getJobsByUser, getJobById, updateJob, ensureJobsTableExists } = require('./dynamo');

// Security headers
app.use(helmet());

// CORS configuration (env-driven)
const parsedAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const defaultOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
    ];
    const allowed = parsedAllowedOrigins.length > 0 ? parsedAllowedOrigins : defaultOrigins;
    if (allowed.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Job Service is running' });
});

// Create a new job application
app.post('/jobs', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { title, company, location } = req.body;

  if (!title || !company || !location) {
    return res.status(400).json({ message: 'Title, company, and location are required fields.' });
  }

  try {
    const newJob = await createJob(userId, req.body);
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job.' });
  }
});

// Get all jobs for the authenticated user
app.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const jobs = await getJobsByUser(userId);
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error in GET /jobs:', error);
    res.status(500).json({ message: 'Failed to retrieve jobs.' });
  }
});

// Get a specific job by its ID
app.get('/jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { jobId } = req.params;
    const job = await getJobById(userId, jobId);

    if (job) {
      res.status(200).json(job);
    } else {
      res.status(404).json({ message: 'Job not found.' });
    }
  } catch (error) {
    console.error('Error in GET /jobs/:jobId:', error);
    res.status(500).json({ message: 'Failed to retrieve job.' });
  }
});

// Update an existing job application
app.put('/jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { jobId } = req.params;
    const updatedJob = await updateJob(userId, jobId, req.body);
    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error in PUT /jobs/:jobId:', error);
    res.status(500).json({ message: 'Failed to update job.' });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`🚀 Job Service running on port ${PORT}`);
  try {
    await ensureJobsTableExists();
  } catch (e) {
    console.warn('Skipping local table ensure due to error:', e?.message || e);
  }
});