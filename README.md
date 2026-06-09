# AIM Global Talent Marketplace
**Ampersand International Mobility | Built for Deepak Duseja, AGM – BD & Operations**

A full-stack talent marketplace platform for managing beneficiary profiles, onboarding global employers, and controlling all access from one admin panel.

---

## What's included

| Module | Who uses it |
|--------|------------|
| Dashboard | Admin — live stats overview |
| Beneficiaries | Admin/Staff — full CRUD, profile management, doc status, timeline |
| Employers | Admin — onboard employers, set granular access per employer |
| Demands | Admin/Staff + Employers — raise and track open positions |
| Shortlists | Admin/Staff — approve/reject employer interest in profiles |
| Users & Access | Super Admin — invite team and employer logins |
| Settings | Super Admin — customise trades, countries, platform name |
| Employer Portal | Employer login — browse (limited), shortlist, raise demands |

---

## Quick Start

### 1. Set up Supabase (free, 5 minutes)
Follow `SUPABASE_SETUP.md` step by step.

### 2. Install and run
```bash
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm start
```

### 3. Open browser
Go to `http://localhost:3000`

---

## Roles

| Role | Access |
|------|--------|
| **Super Admin** (you) | Everything. Full control. |
| **Admin** | All modules except user management |
| **Staff** | Beneficiaries, Demands, Shortlists |
| **Employer** | Browse (limited), Shortlist, Raise Demand — only what you enable |

---

## Deploying publicly (free)

1. Push code to GitHub (free)
2. Go to vercel.com → Import your GitHub repo
3. Add environment variables (REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY)
4. Deploy — you get a live URL instantly

---

## Customising

**Add a new trade or country:** Settings → Trades / Countries

**Change employer access:** Employers → Access Control (per employer)

**Add a new field to beneficiary profiles:** Edit `src/pages/Beneficiaries.js` — add to the form and Supabase table

**Change the colour theme:** Edit the `#E85D26` (orange) and `#1D4ED8` (blue) values in any component

---

## Tech Stack

- React 18 (frontend)
- Supabase (database, auth, row-level security)
- React Router v6 (navigation)
- No paid dependencies. Yours forever.
