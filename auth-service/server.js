require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const usernames = require('./usernames');

const AUTH_MODE = (process.env.AUTH_MODE || '').toLowerCase() || 'local';

// Create instance of the auth service (local by default; AWS infra may not be available)
let authService;
if (AUTH_MODE === 'cognito') {
  const CognitoAuthService = require('./cognito-auth');
  authService = new CognitoAuthService();
} else {
  const LocalAuthService = require('./local-auth');
  authService = new LocalAuthService();
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS configuration (env-driven)
// Set CORS_ALLOWED_ORIGINS as a comma-separated list, e.g.
// "https://web.local.hirera,https://hirera.net,https://www.hirera.net,http://localhost:8080"
const parsedAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // If no env configured, allow localhost defaults for DX
    const defaultOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
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
app.get('/health', async (req, res) => {
  try {
    const isDeepCheck = req.query.deep === 'true';
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dependencies: {
        auth: 'pending'
      }
    };

    if (isDeepCheck) {
      const status = await authService.testConnection();
      if (status.success) {
        response.dependencies.auth = AUTH_MODE === 'cognito' ? 'cognito:healthy' : 'local:healthy';
        return res.status(200).json(response);
      }
      response.status = 'unhealthy';
      response.dependencies.auth = AUTH_MODE === 'cognito' ? 'cognito:unhealthy' : 'local:unhealthy';
      return res.status(503).json({ ...response, error: status.error });
    }

    response.dependencies.auth = AUTH_MODE === 'cognito' ? 'cognito:un-checked' : 'local:un-checked';
    return res.status(200).json(response);
  } catch (error) {
    console.error('âŒ Health check failed:', error);
    return res.status(500).json({
      status: 'unhealthy',
      message: 'An unexpected error occurred during health check.',
      error: error.message
    });
  }
});

// Test configuration endpoint
app.get('/test-config', (req, res) => {
  res.json({
    authMode: AUTH_MODE,
    jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
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

    // Cognito mode: reserve username mapping if provided
    if (AUTH_MODE === 'cognito' && username) {
      const uname = String(username).trim().toLowerCase();
      const available = await usernames.isUsernameAvailable(uname);
      if (!available) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      await usernames.reserveUsername(uname, email);
    }

    try {
      const result = await authService.signUp(email, password, firstName, lastName, country, username);
      return res.json(result);
    } catch (e) {
      // Roll back username reservation on failure (Cognito mode only)
      if (AUTH_MODE === 'cognito' && username) {
        const uname = String(username).trim().toLowerCase();
        try { await usernames.releaseUsername(uname); } catch (_) {}
      }
      throw e;
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error?.name === 'InvalidParameterException') {
      return res.status(400).json({ success: false, message: error?.message || 'Invalid parameters' });
    }
    return res.status(500).json({
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

    const result = AUTH_MODE === 'cognito'
      ? await authService.confirmSignUp(email, confirmationCode, null)
      : await authService.confirmSignUp(email, confirmationCode, username);

    return res.json(result);
  } catch (error) {
    console.error('Confirm signup error:', error);
    return res.status(500).json({
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
      const userExists = await authService.findUserByEmailOrUsername(email || username);
      if (userExists) {
        return res.status(200).json({ success: true, message: 'User exists.', user: userExists });
      }
      return res.status(404).json({ success: false, message: 'User not found.' });
    } catch (error) {
      if (error.name === 'UserNotFoundException') {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      console.error('Error during user existence check:', error);
      return res.status(500).json({ success: false, message: 'Internal server error during user check.' });
    }
  }

  try {
    if (AUTH_MODE === 'cognito') {
      // Map username -> email if needed
      let identifier = '';
      if (username) {
        const uname = String(username).trim().toLowerCase();
        const mappedEmail = await usernames.getEmailByUsername(uname);
        if (!mappedEmail) {
          return res.status(404).json({ success: false, message: 'User not found.' });
        }
        identifier = mappedEmail;
      } else if (email) {
        const isEmailFormat = /@/.test(String(email));
        if (isEmailFormat) {
          identifier = email;
        } else {
          const uname = String(email).trim().toLowerCase();
          const mappedEmail = await usernames.getEmailByUsername(uname);
          if (!mappedEmail) {
            return res.status(404).json({ success: false, message: 'User not found.' });
          }
          identifier = mappedEmail;
        }
      }

      const result = await authService.signIn(identifier, password, null);
      return res.json(result);
    }

    const result = await authService.signIn(email, password, username);
    return res.json(result);
  } catch (error) {
    console.error('Signin error:', error);
    const name = error?.name || '';
    const message = error?.message || 'Sign in failed';

    if (name === 'UserNotFoundException') {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (name === 'NotAuthorizedException') {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }
    if (name === 'UserNotConfirmedException') {
      return res.status(403).json({ success: false, message: 'User is not confirmed. Please verify your email.' });
    }
    return res.status(400).json({ success: false, message });
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
    const userInfo = await authService.getUserInfo(accessToken);

    if (userInfo) {
      return res.json({
        success: true,
        user: {
          id: userInfo.id || userInfo.username,
          email: userInfo.email,
          username: userInfo.username,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          emailVerified: userInfo.emailVerified
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
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

    const result = await authService.resendConfirmationCode(email, username);
    return res.json(result);
  } catch (error) {
    console.error('Resend confirmation code error:', error);
    return res.status(500).json({
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
    const result = await authService.changePassword(accessToken, oldPassword, newPassword);
    return res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
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

    if (AUTH_MODE !== 'cognito') {
      const result = await authService.checkAvailability(field, value);
      return res.json({ available: !!result.available });
    }

    // Cognito mode
    let user;
    if (field === 'email') {
      user = await authService.findUserByEmail(value);
    } else if (field === 'username') {
      const uname = String(value).trim().toLowerCase();
      user = (await usernames.getEmailByUsername(uname)) ? { Username: uname } : null;
    } else {
      return res.status(400).json({ available: false, message: 'Invalid field specified.' });
    }

    return res.json({ available: !user });
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({ available: false, message: 'Error checking availability.' });
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
  console.log(`ðŸš€ Auth Service running on port ${PORT} (mode: ${AUTH_MODE})`);
  console.log(`ðŸ“ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`ðŸŒ Health check: http://localhost:${PORT}/health`);

  if (AUTH_MODE === 'cognito') {
    usernames.ensureUsernameTableExists().catch((e) => console.warn('Username table ensure skipped:', e?.message || e));
  }
});

module.exports = app;
