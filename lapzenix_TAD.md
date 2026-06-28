# Technical Architecture Document (TAD)
## Lapzenix — PC Builds & Services Website
**Version:** 1.0 | **Stack:** React + Node.js + PostgreSQL (Neon) + Firebase + AWS

---

## 1. Architecture Overview

```
Browser
  │
  ├── React SPA (Firebase Hosting)
  │     ├── User page  → POST /api/enquiry  ──► Node/Express API (Render)
  │     └── Admin page → GET  /api/enquiries ──► Node/Express API (Render)
  │
  └── Firebase Analytics (auto page-view tracking)

Node/Express API (Render free tier)
  ├── PostgreSQL on Neon (free tier) — source of truth for all data
  ├── CallMeBot WhatsApp API — fire-and-forget on new enquiry
  └── AWS S3 (optional) — if you want file uploads (e.g. photos of damaged device)

Firebase (Google)
  ├── Hosting — serves React build
  ├── Auth — admin login only
  └── Analytics — visitor tracking
```

---

## 2. Tech Stack

| Layer | Tool | Why / Free tier |
|-------|------|-----------------|
| Frontend | React 18 + Vite | Fast build, component-based |
| Styling | Tailwind CSS | Utility-first, matches prototype colors |
| Hosting | Firebase Hosting | Free SSL, CDN, custom domain |
| Auth | Firebase Auth | Free up to 10k users/month |
| Analytics | Firebase Analytics | Free, unlimited events |
| Backend | Node.js + Express | Lightweight REST API |
| API Hosting | Render (free web service) | Free tier, auto-deploy from GitHub |
| Database | PostgreSQL on Neon | Free tier: 0.5 GB, 1 compute unit |
| WhatsApp | CallMeBot API | Free, no signup cost |
| Cloud (AWS) | AWS S3 (free tier) | Optional file upload; 5 GB free 12 months |
| Version control | GitHub | Free, used for CI/CD triggers |

**Why AWS is included:** Adds real enterprise credibility to your resume. Use S3 for storing any device images customers upload (optional feature). Free tier covers this project entirely for 12 months.

---

## 3. Repository Structure

```
lapzenix/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── ServiceCards.jsx
│   │   │   ├── EnquiryForm.jsx
│   │   │   ├── SuccessBox.jsx
│   │   │   └── Footer.jsx
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MetricsCards.jsx
│   │   │   └── EnquiriesTable.jsx
│   │   ├── firebase.js       # Firebase init
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local            # Firebase config (gitignored)
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Node.js backend
│   ├── routes/
│   │   ├── enquiries.js      # POST /api/enquiry, GET /api/enquiries
│   │   └── health.js         # GET /health
│   ├── db.js                 # Neon PostgreSQL connection (pg)
│   ├── whatsapp.js           # CallMeBot helper
│   ├── .env                  # DB URL, CallMeBot key (gitignored)
│   └── index.js
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI: lint → build → deploy to Firebase + Render
│
├── .gitignore
└── README.md
```

---

## 4. Database Schema (PostgreSQL / Neon)

```sql
-- enquiries table
CREATE TABLE enquiries (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  phone       VARCHAR(15)   NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  service     VARCHAR(20)   NOT NULL,  -- 'build' | 'parts' | 'service' | 'recovery'
  details     JSONB,                   -- service-specific fields stored as JSON
  status      VARCHAR(20)   DEFAULT 'pending',  -- pending | progress | done
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- page_views table (lightweight alternative to Analytics API)
CREATE TABLE page_views (
  id         SERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);
```

The `details` JSONB column stores whatever the service-specific form submits, e.g.:
```json
{ "budget": "60000", "purpose": "Gaming", "timeline": "Within a month" }
```

---

## 5. API Endpoints

### POST /api/enquiry
**Body:**
```json
{
  "name": "Arjun Kumar",
  "phone": "9876543210",
  "email": "arjun@email.com",
  "service": "build",
  "details": { "budget": "60000", "purpose": "Gaming" }
}
```
**Actions:** Insert row → send WhatsApp → return `{ success: true, id }`

### GET /api/enquiries
**Headers:** `Authorization: Bearer <Firebase ID token>`  
**Returns:** Array of all enquiry rows ordered by `created_at DESC`

### PATCH /api/enquiries/:id/status
**Headers:** `Authorization: Bearer <Firebase ID token>`  
**Body:** `{ "status": "done" }`  
**Returns:** Updated row

### GET /health
Returns `{ status: "ok" }` — used by Render to keep service warm

---

## 6. Authentication Flow

```
Admin opens /admin
  │
  ├── Not logged in → show LoginForm (Firebase Auth UI)
  │     └── signInWithEmailAndPassword()
  │           └── Success → store user in React context
  │
  └── Logged in → show Dashboard
        └── All API calls include: Authorization: Bearer {idToken}
              └── Server verifies token with Firebase Admin SDK
```

Only one admin account. Created manually in Firebase Console (no self-registration).

---

## 7. WhatsApp Integration (CallMeBot)

1. Send a WhatsApp message to `+34 644 69 90 41` saying `I allow callmebot to send me messages`
2. You'll receive an API key
3. Store in server `.env` as `CALLMEBOT_KEY`
4. On each new enquiry, server calls:
```
GET https://api.callmebot.com/whatsapp.php?phone=91XXXXXXXXXX&text=...&apikey=KEY
```
Fire-and-forget (don't block the API response waiting for it).

---

## 8. AWS Integration

**Service used:** S3 (Simple Storage Service) — free tier 5 GB / 12 months

**Use case (optional v1 feature):** Customer can attach a photo of their damaged device or the part they want.

**Flow:**
1. React uploads file to S3 pre-signed URL (server generates it)
2. S3 URL stored in `details` JSONB
3. Admin can click the link in the dashboard to view the image

**IAM setup:**
- Create an IAM user with S3-only permissions (least privilege — good to mention in interviews)
- Store `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in server `.env`
- Bucket: `lapzenix-uploads`, region: `ap-south-1` (Mumbai — closest to Chennai)

If you don't want file uploads in v1, skip AWS entirely and add it as v2.

---

## 9. CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`

```
On push to main branch:
  1. Install dependencies (client + server)
  2. Lint check (ESLint)
  3. Build React app (npm run build)
  4. Deploy client/ build to Firebase Hosting
  5. Render auto-deploys server/ from GitHub (webhook)
```

Firebase deploy uses `FIREBASE_TOKEN` stored as a GitHub Secret.

---

## 10. Environment Variables

**client/.env.local** (gitignored)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

**server/.env** (gitignored)
```
DATABASE_URL=postgresql://...@neon.tech/lapzenix
CALLMEBOT_KEY=
CALLMEBOT_PHONE=91XXXXXXXXXX
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
AWS_ACCESS_KEY_ID=          # only if using S3
AWS_SECRET_ACCESS_KEY=      # only if using S3
AWS_BUCKET_NAME=lapzenix-uploads
```

---

## 11. Color Palette (from prototype)

| Token | Value |
|-------|-------|
| Background | `#f5f0e8` |
| Dark brown | `#2c1a0e` |
| Accent orange | `#c9873a` |
| Hero bg | `#3b2009` |
| Border | `#ddd0b8` |
| Muted text | `#8a7260` |

---

## 12. Deployment Checklist

- [ ] Firebase project created, Hosting + Auth + Analytics enabled
- [ ] Neon PostgreSQL project created, schema migrated
- [ ] Render web service connected to GitHub `server/` folder
- [ ] CallMeBot key obtained and `.env` updated
- [ ] AWS S3 bucket created (optional)
- [ ] GitHub Secrets added (`FIREBASE_TOKEN`, etc.)
- [ ] Custom domain pointed to Firebase Hosting (optional)
- [ ] Admin user created in Firebase Console
