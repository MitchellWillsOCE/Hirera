require('dotenv').config();
const express = require('express');
const cors = require('cors');
const CognitoAuthService = require('./cognito-auth');

// Create instance of the auth service
const cognitoAuth = new CognitoAuthService();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from hirera.net domains and localhost for development
    const allowedOrigins = [
      'https://hirera.net',
      'https://www.hirera.net',
      'https://auth.hirera.net',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isDeepCheck = req.query.deep === 'true';
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dependencies: {
        cognito: 'pending'
      }
    };

    if (isDeepCheck) {
      console.log('🩺 Performing deep health check...');
      const cognitoStatus = await cognitoAuth.testConnection();
      if (cognitoStatus.success) {
        response.dependencies.cognito = 'healthy';
        console.log('  -> Cognito connection is healthy');
        return res.status(200).json(response);
      } else {
        response.status = 'unhealthy';
        response.dependencies.cognito = 'unhealthy';
        console.error('  -> Cognito connection is unhealthy:', cognitoStatus.error);
        return res.status(503).json({ ...response, error: cognitoStatus.error });
      }
    } else {
      // Basic health check
      response.dependencies.cognito = 'un-checked';
      return res.status(200).json(response);
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'An unexpected error occurred during health check.',
      error: error.message
    });
  }
});

// Test configuration endpoint
app.get('/test-config', (req, res) => {
  res.json({
    region: process.env.AWS_REGION || 'Not configured',
    userPoolId: process.env.COGNITO_USER_POOL_ID ? 'Configured' : 'Not configured',
    clientId: process.env.COGNITO_CLIENT_ID ? 'Configured' : 'Not configured',
    clientSecret: process.env.COGNITO_CLIENT_SECRET ? 'Configured' : 'Not configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, country, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await cognitoAuth.signUp(email, password, firstName, lastName, country, username);
    res.json(result);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/auth/confirm', async (req, res) => {
  try {
    const { email, confirmationCode, username } = req.body;

    if (!email || !confirmationCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and confirmation code are required'
      });
    }

    const result = await cognitoAuth.confirmSignUp(email, confirmationCode, username);
    res.json(result);
  } catch (error) {
    console.error('Confirm signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/auth/signin', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email && !username) {
    return res.status(400).json({ success: false, message: 'Email or username is required.' });
  }

  // Handle existence check for federated login
  if (!password) {
    try {
      const userExists = await cognitoAuth.findUserByEmailOrUsername(email || username);
      if (userExists) {
        return res.status(200).json({ success: true, message: 'User exists.', user: userExists });
      } else {
        // This case should ideally not be hit if findUserByEmailOrUsername throws,
        // but as a fallback, we explicitly state the user is not found.
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      console.error('Error during user existence check:', error);
      return res.status(500).json({ success: false, message: 'Internal server error during user check.' });
    }
  }

  // Handle standard password-based login
  try {
    const result = await cognitoAuth.signIn(email, password, username);
    res.json(result);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const userInfo = await cognitoAuth.getUserInfo(accessToken);
    
    if (userInfo) {
      res.json({
        success: true,
        user: {
          id: userInfo.username,
          email: userInfo.email,
          username: userInfo.username,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          emailVerified: userInfo.emailVerified
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/auth/resend-code', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await cognitoAuth.resendConfirmationCode(email, username);
    res.json(result);
  } catch (error) {
    console.error('Resend confirmation code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/auth/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    const result = await cognitoAuth.changePassword(accessToken, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/auth/check-availability', async (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field || !value) {
      return res.status(400).json({ available: false, message: 'Field and value are required.' });
    }

    let user;
    if (field === 'email') {
      user = await cognitoAuth.findUserByEmail(value);
    } else if (field === 'username') {
      // For username, we can leverage the primary lookup.
      // A simple ListUsers is efficient here.
      const params = { UserPoolId: cognitoAuth.userPoolId, Filter: `username = "${value}"`, Limit: 1 };
      const command = new (require('@aws-sdk/client-cognito-identity-provider').ListUsersCommand)(params);
      const response = await cognitoAuth.client.send(command);
      user = response.Users && response.Users.length > 0 ? response.Users[0] : null;
    } else {
      return res.status(400).json({ available: false, message: 'Invalid field specified.' });
    }

    res.json({ available: !user });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ available: false, message: 'Error checking availability.' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Cognito Auth Service running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 Production mode: CORS enabled for hirera.net domains`);
  } else {
    console.log(`🔧 Development mode: CORS enabled for localhost`);
  }
});

module.exports = app; 