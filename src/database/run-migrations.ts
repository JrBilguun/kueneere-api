import dataSource from './data-source';

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations({ transaction: 'each' });
    console.log(`Ran ${migrations.length} migration(s)`);
    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

void runMigrations();
