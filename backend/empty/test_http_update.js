// Simulate exactly what the test-phase5.js does:
// 1. Create topic (POST)
// 2. Get its ID
// 3. PUT update the topic
// This tests the full flow via HTTP

const axios = require('axios');
const BASE = 'http://localhost:3001/api';

async function test() {
  // Login as creator
  const loginRes = await axios.post(`${BASE}/auth/login`, {
    email: 'teacher@vocaboost.com',
    password: 'Teacher@123'
  });
  const token = loginRes.data.token;
  const client = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true
  });

  // Create topic
  const createRes = await client.post('/creator/topics', {
    topicName: '[TEST] Topic to update',
    topicCode: 'TUPD_' + Date.now(),
    description: 'Test',
    topicCategoryId: 1
  });
  console.log('Create status:', createRes.status, createRes.data);
  const topicId = createRes.data?.data?.id;
  console.log('Created topic ID:', topicId);

  if (!topicId) {
    console.error('No topic ID returned!');
    process.exit(1);
  }

  // Update topic  
  const updateRes = await client.put(`/creator/topics/${topicId}`, {
    topicName: '[TEST] Topic UPDATED',
    description: 'Updated description'
  });
  console.log('Update status:', updateRes.status, updateRes.data);

  // Cleanup
  const delRes = await client.delete(`/creator/topics/${topicId}`);
  console.log('Delete status:', delRes.status);
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
