const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authenticateToken = require('./auth');
const { createJob, getJobsByUser, getJobById, updateJob } = require('./dynamo');

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`🚀 Job Service running on port ${PORT}`);
}); 