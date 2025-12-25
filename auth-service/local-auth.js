const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data) {
  ensureDirForFile(filePath);
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const iterations = 150000;
  const keylen = 32;
  const digest = 'sha256';
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return { salt, iterations, keylen, digest, hash };
}

function verifyPassword(password, stored) {
  const { salt, iterations, keylen, digest, hash } = stored;
  const computed = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

class LocalAuthService {
  constructor() {
    this.mode = 'local';
    this.jwtSecret = process.env.JWT_SECRET;
    this.storePath = process.env.LOCAL_AUTH_STORE_PATH || '/data/users.json';

    if (!this.jwtSecret || this.jwtSecret.length < 16) {
      throw new Error('Missing required local auth configuration: JWT_SECRET (min length 16) is required.');
    }

    // Initialize store if missing
    const store = readJsonSafe(this.storePath, { users: [], refreshTokens: {} });
    if (!store.users) store.users = [];
    if (!store.refreshTokens) store.refreshTokens = {};
    writeJsonAtomic(this.storePath, store);

    console.log(`🔧 Local Auth Service initialized (store: ${this.storePath})`);
  }

  _loadStore() {
    const store = readJsonSafe(this.storePath, { users: [], refreshTokens: {} });
    store.users = store.users || [];
    store.refreshTokens = store.refreshTokens || {};
    return store;
  }

  _saveStore(store) {
    writeJsonAtomic(this.storePath, store);
  }

  _publicUser(user) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      country: user.country || undefined,
      emailVerified: !!user.emailVerified,
    };
  }

  _issueTokens(user) {
    const now = Math.floor(Date.now() / 1000);
    const base = {
      sub: user.id,
      username: user.username,
      email: user.email,
      iat: now,
      iss: 'hirera-local-auth',
    };

    const accessToken = jwt.sign({ ...base, type: 'access' }, this.jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });
    const idToken = jwt.sign({ ...base, type: 'id' }, this.jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

    const refreshToken = crypto.randomBytes(32).toString('hex');
    return { accessToken, idToken, refreshToken };
  }

  async testConnection() {
    return { success: true, config: { mode: 'local' } };
  }

  async findUserByEmail(email) {
    const store = this._loadStore();
    const needle = normalizeEmail(email);
    return store.users.find((u) => u.email === needle) || null;
  }

  async findUserByEmailOrUsername(identifier) {
    const store = this._loadStore();
    const id = String(identifier || '').trim();
    const needleEmail = normalizeEmail(id);
    const user =
      store.users.find((u) => u.username === id) ||
      store.users.find((u) => u.email === needleEmail) ||
      null;

    if (!user) {
      const err = new Error('User not found.');
      err.name = 'UserNotFoundException';
      throw err;
    }

    return { username: user.username, email: user.email };
  }

  async signUp(email, password, firstName = null, lastName = null, country = null, username = null) {
    const store = this._loadStore();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return { success: false, message: 'Email and password are required', error: 'InvalidParameterException' };
    }

    const emailExists = store.users.some((u) => u.email === normalizedEmail);
    if (emailExists) {
      return {
        success: false,
        message: 'This email address is already in use. Please try signing in or use a different email.',
        error: 'EmailExistsException',
      };
    }

    const baseUsername =
      (username && String(username).trim()) ||
      `${normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString().slice(-6)}`;

    const usernameTaken = store.users.some((u) => u.username === baseUsername);
    if (usernameTaken) {
      return { success: false, message: 'A user with this username already exists. Please choose a different username.', error: 'UsernameExistsException' };
    }

    const pw = hashPassword(password);
    const user = {
      id: uuidv4(),
      email: normalizedEmail,
      username: baseUsername,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      country: country || undefined,
      emailVerified: true, // local mode: auto-verified
      password: pw,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.push(user);
    this._saveStore(store);

    return {
      success: true,
      message: 'User registered successfully.',
      username: user.username,
      needsConfirmation: false,
    };
  }

  async confirmSignUp(email, confirmationCode, username = null) {
    // local mode auto-verifies, but keep endpoint for UI compatibility
    const store = this._loadStore();
    const normalizedEmail = normalizeEmail(email);
    const id = (username && String(username).trim()) || normalizedEmail;

    const user =
      store.users.find((u) => u.username === id) ||
      store.users.find((u) => u.email === normalizeEmail(id)) ||
      null;

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();
    this._saveStore(store);

    return { success: true, message: 'Email verified successfully.' };
  }

  async resendConfirmationCode(email, username = null) {
    // local mode: nothing to send
    return { success: true, message: 'Verification code sent to your email.' };
  }

  async signIn(email, password, username = null) {
    const store = this._loadStore();
    const identifier = (username && String(username).trim()) || String(email || '').trim();
    const isEmail = identifier.includes('@');

    const user = isEmail
      ? store.users.find((u) => u.email === normalizeEmail(identifier))
      : store.users.find((u) => u.username === identifier);

    if (!user) {
      return { success: false, message: 'User not found.', error: 'UserNotFoundException' };
    }

    if (!password) {
      return { success: false, message: 'Password is required for sign-in.', error: 'InvalidParameterException' };
    }

    if (!verifyPassword(password, user.password)) {
      return { success: false, message: 'Incorrect username/email or password.', error: 'NotAuthorizedException' };
    }

    if (!user.emailVerified) {
      return { success: false, message: 'User is not confirmed.', error: 'UserNotConfirmedException' };
    }

    const tokens = this._issueTokens(user);
    store.refreshTokens[tokens.refreshToken] = { userId: user.id, createdAt: new Date().toISOString() };
    this._saveStore(store);

    return {
      success: true,
      message: 'Sign in successful',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
      },
      user: this._publicUser(user),
    };
  }

  async getUserInfo(accessToken) {
    const payload = jwt.verify(accessToken, this.jwtSecret, { algorithms: ['HS256'] });
    const store = this._loadStore();
    const user = store.users.find((u) => u.id === payload.sub) || null;
    if (!user) throw new Error('User not found');
    return this._publicUser(user);
  }

  async changePassword(accessToken, oldPassword, newPassword) {
    const payload = jwt.verify(accessToken, this.jwtSecret, { algorithms: ['HS256'] });
    const store = this._loadStore();
    const user = store.users.find((u) => u.id === payload.sub) || null;
    if (!user) return { success: false, message: 'User not found', error: 'UserNotFoundException' };

    if (!verifyPassword(oldPassword, user.password)) {
      return { success: false, message: 'Current password is incorrect', error: 'NotAuthorizedException' };
    }

    user.password = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    this._saveStore(store);
    return { success: true, message: 'Password changed successfully' };
  }

  async checkAvailability(field, value) {
    const store = this._loadStore();
    if (field === 'email') {
      const needle = normalizeEmail(value);
      return { available: !store.users.some((u) => u.email === needle) };
    }
    if (field === 'username') {
      const needle = String(value || '').trim();
      return { available: !store.users.some((u) => u.username === needle) };
    }
    return { available: false, message: 'Invalid field specified.' };
  }
}

module.exports = LocalAuthService;





