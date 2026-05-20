/**
 * Phase 5 Testing Script — ContentCreator & Admin Review
 * Chạy: node test-phase5.js
 */
const axios = require('axios');
const BASE = 'http://localhost:3001/api';

let creatorToken = '';
let adminToken = '';
let createdTopicId = null;
let createdWordId = null;
let createdQuestionId = null;
let createdMiniTestId = null;

const log = (label, ok, detail = '') => {
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
};

const api = (token) => axios.create({
  baseURL: BASE,
  headers: { Authorization: `Bearer ${token}` },
  validateStatus: () => true // don't throw on non-2xx
});

async function run() {
  console.log('\n═══════════════════════════════════════');
  console.log('  Phase 5: Testing ContentCreator Flow');
  console.log('═══════════════════════════════════════\n');

  // ────────────────────────────────────────────────
  // 1. Login Creator → JWT permissions
  // ────────────────────────────────────────────────
  console.log('── 1. LOGIN & JWT ──────────────────────');
  try {
    const res = await axios.post(`${BASE}/auth/login`, {
      email: 'teacher@vocaboost.com',
      password: 'Teacher@123'
    });
    if (res.status === 200 && res.data.token) {
      creatorToken = res.data.token;
      const u = res.data.user;
      log('Login Creator', true, `role=${u.role}, permissions=[${u.permissions.join(', ')}]`);

      // Check role
      log('Role is ContentCreator', u.role === 'ContentCreator', u.role);

      // Check key permissions
      const required = ['VIEW_DASHBOARD', 'MANAGE_TOPICS', 'MANAGE_WORDS', 'MANAGE_QUESTIONS', 'MANAGE_TESTS', 'SUBMIT_CONTENT_REVIEW', 'VIEW_CONTENT_ANALYTICS'];
      const missing = required.filter(p => !u.permissions.includes(p));
      log('Has required permissions', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'all present');

      // Must NOT have MANAGE_TOPIC_CATEGORIES
      log('No MANAGE_TOPIC_CATEGORIES', !u.permissions.includes('MANAGE_TOPIC_CATEGORIES'));
    } else {
      log('Login Creator', false, `status=${res.status}`);
      console.log('Cannot proceed without creator token.');
      return;
    }
  } catch (e) {
    log('Login Creator', false, e.message);
    return;
  }

  // Login Admin
  try {
    const res = await axios.post(`${BASE}/auth/login`, {
      email: 'system@vocaboost.com',
      password: 'Admin@123'
    });
    if (res.status === 200 && res.data.token) {
      adminToken = res.data.token;
      log('Login Admin', true, `role=${res.data.user.role}`);
    } else {
      log('Login Admin', false, `status=${res.status}`);
    }
  } catch (e) {
    log('Login Admin', false, e.message);
  }

  // ────────────────────────────────────────────────
  // 2. Creator CRUD + Ownership
  // ────────────────────────────────────────────────
  console.log('\n── 2. CREATOR CRUD + OWNERSHIP ─────────');
  const c = api(creatorToken);

  // Dashboard
  {
    const res = await c.get('/creator/dashboard');
    log('GET /creator/dashboard', res.status === 200, `status=${res.status}`);
  }

  // TopicCategories (read-only)
  {
    const res = await c.get('/creator/topic-categories');
    log('GET /creator/topic-categories', res.status === 200, `count=${res.data?.length || 0}`);
  }

  // === TOPICS ===
  {
    // Create
    const res = await c.post('/creator/topics', {
      topicName: '[TEST] Chủ đề Test ' + Date.now(),
      topicCode: 'TEST_PHASE5_' + Date.now(),
      description: 'Auto-test topic',
      topicCategoryId: 1
    });
    log('POST /creator/topics', res.status === 201 || res.status === 200, `status=${res.status}`);
    if (res.data?.data?.id) {
      createdTopicId = res.data.data.id;
    }

    // List
    const list = await c.get('/creator/topics');
    log('GET /creator/topics', list.status === 200, `count=${list.data?.length || 0}`);

    // Update
    if (createdTopicId) {
      const upd = await c.put(`/creator/topics/${createdTopicId}`, {
        topicName: '[TEST] Chủ đề Updated',
        description: 'Updated desc'
      });
      log('PUT /creator/topics/:id', upd.status === 200, `status=${upd.status}`);
    }
  }

  // === WORDS ===
  {
    const res = await c.post('/creator/words', {
      term: 'testword_' + Date.now(),
      meaning: 'Từ test tự động',
      phonetic: '/tɛst/',
      partOfSpeechId: 1,
      topicId: createdTopicId || 1
    });
    console.log('Word Create Response:', JSON.stringify(res.data));
    log('POST /creator/words', res.status === 201 || res.status === 200, `status=${res.status}`);
    if (res.data?.data?.id) {
      createdWordId = res.data.data.id;
    }

    const list = await c.get('/creator/words');
    log('GET /creator/words', list.status === 200, `count=${list.data?.length || 0}`);
  }

  // === QUESTIONS ===
  {
    const res = await c.post('/creator/questions', {
      wordId: createdWordId || 1,
      questionType: 'MCQ',
      questionText: 'Test question auto?',
      optionsJson: JSON.stringify(['A', 'B', 'C', 'D']),
      correctAnswer: 'A',
      explanation: 'Auto-test explanation'
    });
    log('POST /creator/questions', res.status === 201 || res.status === 200, `status=${res.status}`);
    if (res.data?.data?.id) {
      createdQuestionId = res.data.data.id;
    }

    const list = await c.get('/creator/questions');
    log('GET /creator/questions', list.status === 200, `count=${list.data?.length || 0}`);
  }

  // === MINITESTS ===
  {
    const res = await c.post('/creator/mini-tests', {
      topicId: createdTopicId || 1,
      title: 'Test MiniTest Auto ' + Date.now(),
      description: 'Auto-generated minitest'
    });

    log('POST /creator/mini-tests', res.status === 201 || res.status === 200, `status=${res.status}`);
    if (res.data?.data?.id) {
      createdMiniTestId = res.data.data.id;
    }

    const list = await c.get('/creator/mini-tests');
    log('GET /creator/mini-tests', list.status === 200, `count=${list.data?.length || 0}`);
  }

  // ── Submit for review ──
  console.log('\n── 2b. SUBMIT FOR REVIEW ───────────────');
  if (createdTopicId) {
    const res = await c.post(`/creator/topics/${createdTopicId}/submit-review`);
    log('Submit Topic for review', res.status === 200, `status=${res.status}, msg=${res.data?.message || ''}`);
  }

  // ── Ownership test: Unauthenticated / wrong user ──
  console.log('\n── 2c. OWNERSHIP TESTS ─────────────────');
  {
    // No token
    const noAuth = await axios.get(`${BASE}/creator/topics`, { validateStatus: () => true });
    log('No token → 401', noAuth.status === 401, `status=${noAuth.status}`);
  }

  // ────────────────────────────────────────────────
  // 3. Admin Approve / Reject
  // ────────────────────────────────────────────────
  console.log('\n── 3. ADMIN APPROVE / REJECT ────────────');
  if (adminToken) {
    const a = api(adminToken);

    // Get pending
    const pending = await a.get('/admin/content-review/pending');
    log('GET /admin/content-review/pending', pending.status === 200, `count=${pending.data?.length || 0}`);

    // Approve the topic we submitted
    if (createdTopicId) {
      const appr = await a.post(`/admin/content-review/topic/${createdTopicId}/approve`);
      log('Approve Topic', appr.status === 200, `status=${appr.status}, msg=${appr.data?.message || ''}`);

      // Check review logs
      const logs = await a.get(`/admin/content-review/topic/${createdTopicId}/logs`);
      log('GET review logs', logs.status === 200, `count=${logs.data?.length || 0}`);
    }

    // Creator should NOT be able to approve
    if (createdTopicId) {
      const hack = await c.post(`/admin/content-review/topic/${createdTopicId}/approve`);
      log('Creator cannot approve (403)', hack.status === 403, `status=${hack.status}`);
    }
  } else {
    console.log('⚠️ Skipping admin tests (no admin token)');
  }

  // ────────────────────────────────────────────────
  // 4. Cleanup — delete test data
  // ────────────────────────────────────────────────
  console.log('\n── 4. CLEANUP ──────────────────────────');
  // Delete in reverse dependency order using admin
  const cleanup = api(adminToken || creatorToken);

  if (createdMiniTestId) {
    // Must be Draft to delete, so we use admin route or accept failure
    const res = await c.delete(`/creator/mini-tests/${createdMiniTestId}`);
    log('Delete MiniTest', res.status === 200 || res.status === 204, `status=${res.status}`);
  }
  if (createdQuestionId) {
    const res = await c.delete(`/creator/questions/${createdQuestionId}`);
    log('Delete Question', res.status === 200 || res.status === 204, `status=${res.status}`);
  }
  if (createdWordId) {
    const res = await c.delete(`/creator/words/${createdWordId}`);
    log('Delete Word', res.status === 200 || res.status === 204, `status=${res.status}`);
  }
  if (createdTopicId) {
    // Topic was approved so it's Published — might fail for creator
    const res = await c.delete(`/creator/topics/${createdTopicId}`);
    log('Delete Topic (may fail if Published)', true, `status=${res.status}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  Testing Complete!');
  console.log('═══════════════════════════════════════\n');
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
