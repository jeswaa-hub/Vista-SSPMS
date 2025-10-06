require('dotenv').config();
const axios = require('axios');

async function testOTPFunctionality() {
  console.log('OTP Functionality Test');
  console.log('=====================');
  
  const baseURL = process.env.BACKEND_URL || 'http://localhost:5000/api';
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  try {
    console.log('\n1. Testing OTP Request...');
    const otpResponse = await axios.post(`${baseURL}/auth/request-otp`, {
      email: testEmail
    });
    
    console.log('✅ OTP Request successful:', otpResponse.data.message);
    
    // Note: In a real test, you would need to check the email or database for the OTP
    // For this test, we'll just verify the endpoint works
    console.log('\n2. Testing OTP Verification (with dummy OTP)...');
    
    try {
      const verifyResponse = await axios.post(`${baseURL}/auth/verify-otp`, {
        email: testEmail,
        otp: '123456' // Dummy OTP - this should fail
      });
      console.log('❌ OTP Verification should have failed but succeeded');
    } catch (verifyError) {
      if (verifyError.response?.status === 400) {
        console.log('✅ OTP Verification correctly rejected invalid OTP');
      } else {
        console.log('❌ Unexpected error during OTP verification:', verifyError.response?.data);
      }
    }
    
    console.log('\n3. Testing Password Reset (with dummy OTP)...');
    
    try {
      const resetResponse = await axios.post(`${baseURL}/auth/reset-password-with-otp`, {
        email: testEmail,
        otp: '123456', // Dummy OTP - this should fail
        newPassword: 'newpassword123'
      });
      console.log('❌ Password Reset should have failed but succeeded');
    } catch (resetError) {
      if (resetError.response?.status === 400) {
        console.log('✅ Password Reset correctly rejected invalid OTP');
      } else {
        console.log('❌ Unexpected error during password reset:', resetError.response?.data);
      }
    }
    
    console.log('\n✅ OTP functionality test completed successfully!');
    console.log('\nNote: To fully test OTP, you need to:');
    console.log('1. Check your email for the actual OTP code');
    console.log('2. Use the real OTP to test verification and password reset');
    
  } catch (error) {
    console.error('\n❌ OTP test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOTPFunctionality()
  .then(() => {
    console.log('\nTest completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
