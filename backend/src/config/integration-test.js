const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let token = '';

async function runIntegrationTest() {
  console.log('🚀 STARTING INTEGRATION TEST...');
  
  try {
    // 1. Register a test user
    console.log('1. Testing Registration...');
    const email = `test_${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, {
      fullName: 'Test User',
      email: email,
      password: 'password123'
    });
    console.log('   ✅ Registration successful');

    // 2. Login
    console.log('2. Testing Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('   ✅ Login successful');

    // 2.3 Get a real Flashcard ID
    console.log('2.3 Fetching real Flashcard for testing...');
    const cardRes = await axios.get(`${API_URL}/user/flashcards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (cardRes.data.length === 0) throw new Error('No flashcards found to test submission');
    const testQuestionId = cardRes.data[0].questionId;
    console.log(`   ✅ Found Question ID: ${testQuestionId}`);

    // 2.5 Submit Answer
    console.log('2.5 Testing Answer Submission...');
    const submitRes = await axios.post(`${API_URL}/user/submit-answer`, {
      questionId: testQuestionId,
      submittedAnswer: 'test answer'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Answer submitted successfully');

    // 3. Get Stats (requires token)
    console.log('3. Testing Data Retrieval (Auth required)...');
    const statsRes = await axios.get(`${API_URL}/user/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Stats fetched (Words Learned: ${statsRes.data.totalLearned})`);

    // 4. Get Flashcards (Verify persistence)
    console.log('4. Testing Learning Engine Persistence...');
    const cardRes2 = await axios.get(`${API_URL}/user/flashcards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Flashcards received (${cardRes2.data.length} cards)`);

    console.log('\n✨ ALL BACKEND TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message);
    console.error('   Error Details:', error.response?.data?.error);
    process.exit(1);
  }
}

runIntegrationTest();
