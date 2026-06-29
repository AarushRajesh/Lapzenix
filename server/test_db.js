require('dotenv').config();
const db = require('./db');
async function test() {
  try {
    const res = await db.query('SELECT 1 as val');
    console.log('DB SUCCESS:', res.rows);
    
    // Now let's try an insert into enquiries to see if the table exists
    const res2 = await db.query("INSERT INTO enquiries (name,phone,email,service,details) VALUES('x','x','x','x','{}') RETURNING id");
    console.log('TABLE SUCCESS:', res2.rows);
  } catch (err) {
    console.error('DB ERROR:', err.message);
  }
  process.exit(0);
}
test();
