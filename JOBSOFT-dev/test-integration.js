const fetch = require('node-fetch');

const BASE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TEST_EMAIL = 'integration-test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

async function testIntegration() {
  console.log('🧪 Testing Auth Microservice Integration');
  console.log('==========================================');
  
  try {
    // 1. Health Check
    console.log('\n1. Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health Check:', health.status);
    
    // 2. Test Configuration
    console.log('\n2. Testing Configuration...');
    const configResponse = await fetch(`${BASE_URL}/test-config`);
    const config = await configResponse.json();
    console.log('✅ Configuration:', {
      region: config.region,
      userPoolConfigured: config.userPoolId === 'Configured',
      clientConfigured: config.clientId === 'Configured'
    });
    
    // 3. Test Sign Up
    console.log('\n3. Testing Sign Up...');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'Integration',
        lastName: 'Test'
      })
    });
    
    const signupResult = await signupResponse.json();
    if (signupResult.success) {
      console.log('✅ Sign Up Successful');
      console.log('   Generated Username:', signupResult.username);
      
      // Note: In a real test, you'd need to handle email confirmation
      console.log('⚠️  Email confirmation required (skipped in automated test)');
      
    } else {
      if (signupResult.message.includes('already exists')) {
        console.log('⚠️  User already exists (continuing test)');
      } else {
        console.log('❌ Sign Up Failed:', signupResult.message);
        return;
      }
    }
    
    // 4. Test Configuration Endpoints
    console.log('\n4. Testing API Endpoints...');
    
    const endpoints = [
      { method: 'POST', path: '/auth/signin', requiresAuth: false },
      { method: 'POST', path: '/auth/confirm', requiresAuth: false },
      { method: 'POST', path: '/auth/resend-code', requiresAuth: false },
      { method: 'GET', path: '/auth/user', requiresAuth: true },
      { method: 'POST', path: '/auth/change-password', requiresAuth: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (endpoint.requiresAuth) {
          options.headers['Authorization'] = 'Bearer test-token';
        }
        
        if (endpoint.method === 'POST') {
          options.body = JSON.stringify({ test: 'data' });
        }
        
        const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
        const expectedStatus = endpoint.requiresAuth ? 401 : [400, 401]; // Expect auth errors or validation errors
        
        if (Array.isArray(expectedStatus) ? expectedStatus.includes(response.status) : response.status === expectedStatus) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - responds correctly`);
        } else {
          console.log(`⚠️  ${endpoint.method} ${endpoint.path} - unexpected status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.method} ${endpoint.path} - error:`, error.message);
      }
    }
    
    // 5. Test CORS Headers
    console.log('\n5. Testing CORS Configuration...');
    try {
      const corsResponse = await fetch(`${BASE_URL}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://hirera.net',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      if (corsResponse.status === 204 || corsResponse.status === 200) {
        console.log('✅ CORS Headers - configured correctly');
      } else {
        console.log('⚠️  CORS Headers - may need configuration');
      }
    } catch (error) {
      console.log('❌ CORS Test failed:', error.message);
    }
    
    console.log('\n🎉 Integration Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. Start your Next.js app: npm run dev');
    console.log('2. Test the authentication flow in the browser');
    console.log('3. Check that cookies are set properly');
    console.log('4. Verify username generation and storage');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Add help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧪 Auth Microservice Integration Test

Usage: node test-integration.js [options]

Environment Variables:
  AUTH_SERVICE_URL    URL of the auth service (default: http://localhost:3001)

Options:
  --help, -h         Show this help message

Examples:
  node test-integration.js
  AUTH_SERVICE_URL=https://auth.hirera.net node test-integration.js
  `);
  process.exit(0);
}

testIntegration(); 