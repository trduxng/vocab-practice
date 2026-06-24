const CreatorService = require('./src/services/creator.service');
const { poolPromise } = require('./src/config/db');

async function test() {
  try {
    console.log('Calling CreatorService.updateTopic...');
    const ok = await CreatorService.updateTopic(1, {
      topicName: '[TEST] Chủ đề Updated',
      description: 'Updated desc'
    }, 2);
    console.log('Result:', ok);
  } catch (err) {
    console.error('Failed with error:', err);
  }
  process.exit(0);
}

test();
