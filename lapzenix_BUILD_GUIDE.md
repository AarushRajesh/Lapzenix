# Lapzenix — Step-by-Step Build Guide
> Follow this in order. Each phase builds on the previous.

---

## Prerequisites (install these first)

- Node.js 20+ — https://nodejs.org
- Git — https://git-scm.com
- VS Code — https://code.visualstudio.com
- Firebase CLI — `npm install -g firebase-tools`
- GitHub account — https://github.com

---

## Phase 0 — GitHub Setup

```bash
# Create a new repo on github.com named "lapzenix"
# Then on your machine:
mkdir lapzenix && cd lapzenix
git init
git remote add origin https://github.com/YOUR_USERNAME/lapzenix.git
mkdir client server .github/workflows
touch .gitignore README.md
```

Add to `.gitignore`:
```
node_modules/
.env
.env.local
dist/
.firebase/
```

---

## Phase 1 — Firebase Setup

1. Go to https://console.firebase.google.com → **Add project** → name it `lapzenix`
2. Disable Google Analytics prompt (you'll enable it next) → **Create project**
3. In the project: **Build → Hosting** → Get started (just click through the wizard)
4. **Build → Authentication** → Get started → Sign-in method → **Email/Password** → Enable
5. **Authentication → Users → Add user** → enter your email + password (this is your admin login)
6. **Project Settings (gear icon) → General → Your apps → Add app → Web**
   - App nickname: `lapzenix-web`
   - Check "Also set up Firebase Hosting"
   - Copy the `firebaseConfig` object — you'll need it soon
7. **Analytics → Enable Google Analytics** → choose or create a GA4 account


---

## Phase 2 — Neon PostgreSQL Setup

1. Go to https://neon.tech → Sign up (free, no credit card)
2. **Create project** → name: `lapzenix`, region: `AWS ap-south-1` (Mumbai)
3. Copy the **Connection string** (looks like `postgresql://user:pass@...neon.tech/lapzenix`)
4. Open the **SQL Editor** in Neon and run:

```sql
CREATE TABLE enquiries (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  phone       VARCHAR(15)   NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  service     VARCHAR(20)   NOT NULL,
  details     JSONB,
  status      VARCHAR(20)   DEFAULT 'pending',
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE page_views (
  id         SERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 3 — CallMeBot WhatsApp Setup

1. Save the number `+34 644 69 90 41` on your phone as "CallMeBot"
2. Send a WhatsApp message to that number: `I allow callmebot to send me messages`
3. Within a minute you'll receive a reply with your **API key** — save it

---

## Phase 4 — Build the Backend (Node.js)

```bash
cd server
npm init -y
npm install express pg dotenv cors firebase-admin axios
npm install -D nodemon
```

Create `server/.env`:
```
DATABASE_URL=postgresql://...your neon connection string...
CALLMEBOT_KEY=your_key_here
CALLMEBOT_PHONE=91XXXXXXXXXX
FIREBASE_PROJECT_ID=lapzenix
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
PORT=4000
```

> For Firebase Admin SDK credentials: Firebase Console → Project Settings → Service accounts → **Generate new private key** → download JSON → copy `client_email` and `private_key` into .env

Create `server/index.js`:
```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/enquiries', require('./routes/enquiries'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 4000, () => console.log('Server running'));
```

Create `server/db.js`:
```js
const { Pool } = require('pg');
module.exports = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
```

Create `server/whatsapp.js`:
```js
const axios = require('axios');
exports.notify = async (text) => {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${process.env.CALLMEBOT_PHONE}&text=${encodeURIComponent(text)}&apikey=${process.env.CALLMEBOT_KEY}`;
  axios.get(url).catch(() => {}); // fire and forget
};
```

Create `server/routes/enquiries.js`:
```js
const router = require('express').Router();
const db = require('../db');
const { notify } = require('../whatsapp');

// POST /api/enquiries
router.post('/', async (req, res) => {
  const { name, phone, email, service, details } = req.body;
  const { rows } = await db.query(
    'INSERT INTO enquiries (name,phone,email,service,details) VALUES($1,$2,$3,$4,$5) RETURNING id',
    [name, phone, email, service, details]
  );
  const msg = `🔔 New Lapzenix Enquiry\nName: ${name}\nPhone: ${phone}\nService: ${service}\nTime: ${new Date().toLocaleString('en-IN')}`;
  notify(msg);
  res.json({ success: true, id: rows[0].id });
});

// GET /api/enquiries  (admin only — add token verify middleware later)
router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');
  res.json(rows);
});

// PATCH /api/enquiries/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  await db.query('UPDATE enquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
```

Test locally:
```bash
cd server && node index.js
# In another terminal:
curl -X POST http://localhost:4000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"9999999999","email":"t@t.com","service":"build","details":{"budget":"50000"}}'
```

---

## Phase 5 — Build the Frontend (React)

```bash
cd client
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom firebase
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Edit `tailwind.config.js`:
```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
theme: { extend: { colors: { brand: '#c9873a', dark: '#2c1a0e', bg: '#f5f0e8' } } }
```

Create `client/.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=lapzenix.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lapzenix
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_API_BASE_URL=http://localhost:4000
```

Create `client/src/firebase.js`:
```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export { logEvent };
```

Now build components from the prototype HTML — use the brown/beige colors above. The prototype file you have is your exact visual target.

Key routing in `App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPage from './UserPage';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Test frontend:
```bash
cd client && npm run dev
# Visit http://localhost:5173
```

---

## Phase 6 — Deploy Backend to Render

1. Go to https://render.com → Sign up with GitHub
2. **New → Web Service** → Connect your `lapzenix` repo
3. Settings:
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node index.js`
   - Environment: Node
4. Add all your `.env` variables under **Environment → Environment Variables**
5. Deploy — you'll get a URL like `https://lapzenix-api.onrender.com`
6. Update `client/.env.local`: `VITE_API_BASE_URL=https://lapzenix-api.onrender.com`

---

## Phase 7 — Deploy Frontend to Firebase Hosting

```bash
firebase login
cd client
npm run build          # creates dist/ folder
firebase init          # choose Hosting → use existing project (lapzenix)
                       # public dir: dist
                       # single-page app: YES
                       # don't overwrite index.html
firebase deploy
```

You'll get a URL like `https://lapzenix.web.app` — that's your live site.

---

## Phase 8 — GitHub CI/CD (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Lapzenix

on:
  push:
    branches: [main]

jobs:
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '20' }
      - run: cd client && npm install && npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: lapzenix
```

Add secrets in GitHub → repo → Settings → Secrets → Actions:
- `FIREBASE_SERVICE_ACCOUNT` (from Firebase Console → Project Settings → Service accounts)
- All `VITE_*` variables
- `VITE_API_BASE_URL`

Render auto-deploys `server/` when you push to `main` (enable in Render dashboard → Auto-Deploy: Yes).

---

## Phase 9 — AWS S3 (Optional — for file uploads)

Skip this for v1 if you want. Add it as a v2 feature.

1. Sign up at https://aws.amazon.com (free tier, needs credit card but won't charge for this scale)
2. Go to IAM → Create user `lapzenix-app` → attach policy `AmazonS3FullAccess`
3. Create access key → save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
4. Go to S3 → Create bucket → name: `lapzenix-uploads`, region: `ap-south-1`
5. Add to server: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
6. Add a `GET /api/upload-url` endpoint that returns a pre-signed S3 URL
7. Frontend uploads directly to S3 using that URL (no file goes through your server)

---

## Phase 10 — Final Checks

- [ ] Submit form on live site → WhatsApp received ✓
- [ ] Admin login works at `/admin` ✓
- [ ] Status change in dashboard updates DB ✓
- [ ] Metrics counts are correct ✓
- [ ] Push to `main` → auto-deploys ✓
- [ ] Mobile responsive ✓
- [ ] `README.md` written with screenshots for GitHub/LinkedIn

---

## Recommended README structure (for LinkedIn/GitHub)

```md
# Lapzenix — PC Builds & Services Platform

Live: https://lapzenix.web.app | Admin: https://lapzenix.web.app/admin

## Stack
React · Node.js/Express · PostgreSQL (Neon) · Firebase Hosting/Auth/Analytics · Render · AWS S3 · CallMeBot WhatsApp API · GitHub Actions CI/CD

## Features
- Public enquiry form with dynamic fields per service type
- Real-time admin dashboard with status management
- WhatsApp instant notifications on new enquiry
- Firebase Analytics visitor tracking
- Zero-cost infrastructure on free tiers
- Fully automated deployment pipeline

## Screenshots
[add screenshots here]
```

---

## Quick Reference — Useful URLs

| Service | URL |
|---------|-----|
| Firebase Console | https://console.firebase.google.com |
| Neon Dashboard | https://console.neon.tech |
| Render Dashboard | https://dashboard.render.com |
| CallMeBot Docs | https://www.callmebot.com/blog/free-api-whatsapp-messages |
| AWS Console | https://console.aws.amazon.com |
| GitHub Actions docs | https://docs.github.com/en/actions |
