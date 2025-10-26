import dotenv from 'dotenv';
dotenv.config();

import db from '../../models/index.js';

async function setupDatabase() {
  try {
    console.log('Starting database setup...\n');

    await db.sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    await db.sequelize.sync({ alter: true });
    console.log('✓ All models synchronized successfully');

    const [metadata, created] = await db.Metadata.findOrCreate({
      where: { key_name: 'last_refresh' },
      defaults: {
        key_name: 'last_refresh',
        value: null
      }
    });

    if (created) {
      console.log('✓ Metadata initialized');
    } else {
      console.log('✓ Metadata already exists');
    }

    console.log('\n✓ Database setup completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('✗ Database setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
