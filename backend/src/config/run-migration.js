const { sql, poolPromise } = require('./db');

async function run() {
  console.log('Running database migration for MediaAssets...');
  try {
    const pool = await poolPromise;
    
    // 1. Drop existing check constraint if it exists
    console.log('Dropping old constraint CK_MediaAssets_MediaType if exists...');
    await pool.request().query(`
      IF EXISTS (
        SELECT 1 FROM sys.check_constraints 
        WHERE name = N'CK_MediaAssets_MediaType' 
        AND parent_object_id = OBJECT_ID(N'dbo.MediaAssets')
      )
      BEGIN
        ALTER TABLE dbo.MediaAssets DROP CONSTRAINT CK_MediaAssets_MediaType;
      END
    `);
    
    // 2. Add updated check constraint
    console.log('Adding new constraint CK_MediaAssets_MediaType supporting Video, Document, Audio...');
    await pool.request().query(`
      ALTER TABLE dbo.MediaAssets 
      ADD CONSTRAINT CK_MediaAssets_MediaType CHECK (
        MediaType IN (
          N'Audio',
          N'AudioUK',
          N'AudioUS',
          N'Image',
          N'ExampleAudio',
          N'QuestionAudio',
          N'QuestionImage',
          N'Video',
          N'Document'
        )
      );
    `);
    
    console.log('✅ Database migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
  process.exit(0);
}

run();
