# Product Requirements Document (PRD)
## Lapzenix — PC Builds & Services Website
**Version:** 1.0 | **Author:** MCA Final Year Project | **Status:** Draft

---

## 1. Overview

Lapzenix is a single-page public website + admin dashboard for a Chennai-based PC builds and services business. It serves a dual purpose: MCA final-year enterprise project showcase and a live production business tool.

**Business goals**
- Capture customer enquiries online (replacing WhatsApp-only contact)
- Give the owner real-time visibility into all enquiries via a dashboard
- Get WhatsApp notification the moment a new enquiry arrives
- Zero recurring cost

**Project goals**
- Demonstrate full-stack, cloud-native architecture on LinkedIn/GitHub
- Show AWS integration (even on free tier) for resume value
- Production-grade: auth, analytics, database, CI/CD

---

## 2. Users

| User | Who | Access |
|------|-----|--------|
| Visitor | Anyone who lands on the site | Public — no login |
| Admin | Business owner (you) | Protected — Firebase Auth login |

---

## 3. User-Facing Website

### 3.1 Sections (single scrollable page)

1. **Hero** — Lapzenix branding, tagline, "Get a free quote" CTA
2. **Stats bar** — builds done, happy customers, response time, etc.
3. **Services** — 4 cards (PC Build / Parts / Service / Data Recovery) — clicking one reveals the relevant form fields below
4. **Enquiry Form** — common fields + dynamic service-specific fields
5. **Footer** — contact, social links

### 3.2 Enquiry Form — Common Fields (all services)

| Field | Type | Required |
|-------|------|----------|
| Full name | Text | Yes |
| Phone number | Tel (10 digits) | Yes |
| Email ID | Email | Yes |
| Service | Dropdown | Yes |

### 3.3 Dynamic Fields by Service

**PC Build**
- Budget (₹) — number input
- Purpose — dropdown (Gaming / Work & Productivity / Video Editing / General Use / Streaming)
- Preferred brands — text (optional)
- Timeline — dropdown (No rush / Within a month / Urgent)

**Parts**
- What parts do you need? — text area
- Condition preference — dropdown (New only / Used is fine / Either works)
- Budget (₹) — number input

**Service (Repair)**
- Device name / model — text (e.g. HP Pavilion 15)
- Issue description — textarea
- Urgency — dropdown (Normal 3–5 days / Urgent within 24 hrs)

**Data Recovery**
- Device type — dropdown (HDD / SSD / Pen drive / SD card / Phone storage)
- Cause of data loss — dropdown (Accidentally deleted / Formatted / Physical damage / Water damage / Device not detected)
- Data needed — dropdown (Photos & videos / Documents / Everything / Specific files)
- Is device detected? — dropdown (Yes / No / Not sure)
- Urgency — dropdown (Normal / Urgent within 24 hrs)

### 3.4 Post-Submission
- Success message shown inline: "Enquiry received! We'll WhatsApp you within a few hours."
- Row inserted into PostgreSQL `enquiries` table
- WhatsApp notification sent to owner via CallMeBot API
- Firebase Analytics event logged: `enquiry_submitted`

---

## 4. Admin Dashboard

**Access:** Firebase Auth (email + password, owner only). Deployed at `/admin` route, protected by auth guard.

### 4.1 Metrics Cards
| Metric | Source |
|--------|--------|
| Page visits today | Firebase Analytics |
| Total enquiries | COUNT from DB |
| Pending | COUNT where status = 'pending' |
| Completed | COUNT where status = 'done' |

### 4.2 Enquiries Table
Columns: Customer name · Service type · Phone · Email · Detail summary · Status (editable dropdown) · Received date

Status options: Pending → In Progress → Completed

Changing status updates the DB row immediately (no page reload).

### 4.3 Filters (nice-to-have v1)
- Filter by service type
- Filter by date range
- Search by name / phone

---

## 5. WhatsApp Notifications

- Service: **CallMeBot** (free, no credit card)
- Trigger: every new enquiry submission
- Message format:
```
🔔 New Lapzenix Enquiry
Name: {name}
Phone: {phone}
Service: {service}
Detail: {summary}
Time: {timestamp}
```

---

## 6. Analytics

Firebase Analytics (free, no quota limit for basic events):
- `page_view` — automatic
- `enquiry_submitted` — custom event on form submit
- `service_selected` — custom event when user picks a service card

Dashboard reads visitor count from Firebase Analytics Data API or a simple page-view counter stored in Neon.

---

## 7. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Cost | ₹0/month (all free tiers) |
| Performance | Lighthouse score > 85 |
| Mobile responsive | Yes — single column on mobile |
| Auth security | Firebase Auth, HTTPS only |
| Data privacy | No sensitive data beyond contact info |
| Uptime | Firebase Hosting (99.9% SLA) + Render (free tier, may cold-start) |

---

## 8. Out of Scope (v1)

- Payment gateway
- Customer login portal
- Live chat
- Invoice generation
- SMS notifications
