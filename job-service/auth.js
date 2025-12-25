const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch');

const AUTH_MODE = (process.env.AUTH_MODE || '').toLowerCase() || 'local';
const LOCAL_JWT_SECRET = process.env.JWT_SECRET;

let pems = null;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID;
const cognitoRegion = process.env.AWS_REGION;
const jwksUrl = (cognitoRegion && cognitoUserPoolId)
  ? `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`
  : null;

// Fetch and cache the public keys from Cognito's JWKS endpoint
const loadPems = async () => {
  try {
    if (!jwksUrl) throw new Error('JWKS URL is not configured (missing AWS_REGION or COGNITO_USER_POOL_ID)');
    console.log(`🔍 Fetching JWKS from ${jwksUrl}`);
    const response = await fetch(jwksUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch JWKS');
    }
    const jwks = await response.json();
    pems = {};
    for (const key of jwks.keys) {
      pems[key.kid] = jwkToPem(key);
    }
    console.log('✅ JWKS loaded and cached successfully.');
  } catch (error) {
    console.error('❌ Failed to load JWKS:', error);
    pems = null;
  }
};

// Load the PEMs on startup
if (AUTH_MODE === 'cognito') {
  loadPems();
}

// The authentication middleware function
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Local mode: verify JWT signed by auth-service (no AWS/Cognito dependency)
  if (AUTH_MODE !== 'cognito') {
    if (!LOCAL_JWT_SECRET || LOCAL_JWT_SECRET.length < 16) {
      return res.status(500).json({ message: 'Local auth misconfigured: JWT_SECRET is required.' });
    }
    try {
      const payload = jwt.verify(token, LOCAL_JWT_SECRET, { algorithms: ['HS256'] });
      req.user = payload;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  if (!pems) {
    await loadPems(); // Retry loading PEMs if initial load failed
    if (!pems) {
      return res.status(500).json({ message: 'Could not load Cognito public keys for validation.' });
    }
  }

  try {
    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
      return res.status(401).json({ message: 'Invalid token: No matching public key found.' });
    }

    const payload = jwt.verify(token, pem, {
      issuer: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`
    });

    req.user = payload; // Attach the decoded token payload to the request
    next();
  } catch (error) {
    console.error('JWT validation error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken; 