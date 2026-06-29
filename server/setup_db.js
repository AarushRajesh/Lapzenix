require('dotenv').config();
const db = require('./db');
async function setupDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        phone       VARCHAR(15)   NOT NULL,
        email       VARCHAR(150)  NOT NULL,
        service     VARCHAR(20)   NOT NULL,
        details     JSONB,
        status      VARCHAR(20)   DEFAULT 'pending',
        created_at  TIMESTAMPTZ   DEFAULT NOW()
      );
    `);
    console.log('enquiries table created or exists');

    await db.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id         SERIAL PRIMARY KEY,
        visited_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('page_views table created or exists');
  } catch (err) {
    console.error('DB ERROR:', err.message);
  }
  process.exit(0);
}
setupDB();
