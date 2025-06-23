# Fix Login Issue - Step by Step Instructions

## 🚨 The Problem
Your login isn't working with `mitchellwills832@gmail.com` because of case sensitivity and environment variable issues.

## 🔧 Solution - Follow These Steps:

### Step 1: Set Environment Variables
In PowerShell, run these commands one by one:

```powershell
$env:NEXTAUTH_SECRET = "development-secret-key-123-change-for-production"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:DATABASE_URL = "file:./dev.db"
```

### Step 2: Create/Reset Your User Account
Run this command to create your user account properly:

```powershell
node create-user.js
```

This will:
- Delete any existing account with your email
- Create a new account with proper password hashing
- Test the password verification

### Step 3: Start the Development Server
```powershell
npm run dev
```

### Step 4: Test Login
1. Navigate to http://localhost:3000
2. Click "Sign In"
3. Enter:
   - Email: `mitchellwills832@gmail.com`
   - Password: `Rain47rain47&`
4. Click "Sign In"

## 🔍 What I Fixed

### 1. **Authentication Configuration**
- Fixed email lookup to use `toLowerCase().trim()` to match how emails are stored
- Added debug logging to see what's happening during authentication

### 2. **Case Sensitivity Issue**
- Your email is stored as lowercase in the database
- The login was case-sensitive, causing failures
- Now both registration and login use lowercase emails

### 3. **Environment Variables**
- NextAuth requires proper environment variables to work
- Added automatic setup script

## 🚨 Alternative Manual Fix

If the script doesn't work, try this manual approach:

### Option A: Use the Sign-Up Page
1. Go to http://localhost:3000/auth/signup
2. Create a new account with:
   - Email: `mitchellwills832@gmail.com` 
   - Password: `Rain47rain47&`
   - Fill in other required fields
3. Then try logging in

### Option B: Check Database Directly
1. Run: `npx prisma studio`
2. Open the Users table
3. Look for your email and verify it exists
4. If not, use the sign-up page

## 🐛 Troubleshooting

### If create-user.js fails:
```powershell
# Install dependencies first
npm install

# Then try again
node create-user.js
```

### If login still fails:
1. Open browser developer console
2. Look for error messages
3. Check the server console for authentication logs

### Check Environment Variables:
```powershell
echo $env:NEXTAUTH_SECRET
echo $env:NEXTAUTH_URL
echo $env:DATABASE_URL
```

## 📋 Expected Output

When `create-user.js` runs successfully, you should see:
```
Creating/updating user with email: mitchellwills832@gmail.com
User created successfully: {
  id: 'some-uuid',
  email: 'mitchellwills832@gmail.com',
  username: 'mitchell832',
  firstName: 'Mitchell',
  lastName: 'Wills'
}
Password verification test: PASSED
```

## ✅ Success Criteria

You'll know it's working when:
1. ✅ `create-user.js` shows "Password verification test: PASSED"
2. ✅ Server starts without errors
3. ✅ Login redirects to dashboard
4. ✅ No console errors in browser

---

**Next**: After login works, test the leaderboards country filtering and job status updates to ensure everything is working correctly. 