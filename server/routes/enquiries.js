const router = require('express').Router();
const db = require('../db');
const { notify } = require('../whatsapp');

// Firebase Admin initialization for auth verification
const admin = require('firebase-admin');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, '\n') : undefined
    })
  });
} catch (error) {
  console.log('Firebase admin initialization error:', error.message);
}

// Middleware to verify Firebase token for admin routes
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// POST /api/enquiries - Public route
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, service, details } = req.body;
    const { rows } = await db.query(
      'INSERT INTO enquiries (name, phone, email, service, details) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, phone, email, service, details]
    );
    const msg = `🔔 New Lapzenix Enquiry\nName: ${name}\nPhone: ${phone}\nService: ${service}\nTime: ${new Date().toLocaleString('en-IN')}`;
    notify(msg);
    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error('Error creating enquiry:', err);
    res.status(500).json({ error: 'Server error creating enquiry' });
  }
});

// GET /api/enquiries - Admin only
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching enquiries:', err);
    res.status(500).json({ error: 'Server error fetching enquiries' });
  }
});

// PATCH /api/enquiries/:id/status - Admin only
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE enquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating enquiry status:', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

module.exports = router;
