const ReviewService = require('./src/services/review.service');
const { poolPromise } = require('./src/config/db');

async function test() {
  try {
    // Let's call ReviewService.approve with 'topic', some ID, and admin ID
    console.log('Calling ReviewService.approve...');
    await ReviewService.approve('topic', 9999, 1);
    console.log('Approve finished without throwing');
  } catch (err) {
    console.error('Approve failed with error:', err);
  }
  process.exit(0);
}

test();
