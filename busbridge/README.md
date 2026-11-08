# BusBridge – Public Bus Information Gap Solver

> **SWYNEX Internship – Task 2** | Chennai Public Transport Web Application

BusBridge is a Chennai-focused public bus information platform designed to solve the information gaps faced by daily bus passengers. It helps commuters search routes, understand journeys, report crowd conditions, report service problems, and save frequently used routes.

---

## Problem Statement

Passengers struggle to find reliable bus route information, stop details, estimated arrival times, crowd conditions, and service disruption updates. BusBridge provides a simple, accessible digital platform to bridge this information gap.

---

## Features

| Feature | Description |
|---|---|
| Route Search | Search bus routes between any two Chennai locations |
| Route Details | Full stop list, journey info, and interactive Leaflet map |
| Crowd Reporting | Community-submitted crowd status per route |
| Issue Reporting | Report delayed, cancelled, or misbehaving buses |
| Saved Routes | Bookmark favourite routes for quick access |
| Service Alerts | Live-style alerts for diversions and cancellations |
| Demo Mode | Works fully offline with localStorage — no backend needed |

---

## Technology Stack

- **Frontend:** React 18, Vite, JavaScript ES6+
- **Styling:** Tailwind CSS, custom navy/teal palette
- **Routing:** React Router DOM v6
- **Maps:** Leaflet + OpenStreetMap (no API key required)
- **Icons:** Lucide React
- **Backend (optional):** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel

---

## Project Structure

```
busbridge/
├── src/
│   ├── components/        Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── BottomNavigation.jsx
│   │   ├── RouteCard.jsx
│   │   ├── BusStopList.jsx
│   │   ├── CrowdStatusCard.jsx
│   │   ├── MapView.jsx
│   │   ├── AlertCard.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/             Screen-level components
│   │   ├── Home.jsx
│   │   ├── BusSearch.jsx
│   │   ├── RouteDetails.jsx
│   │   ├── CrowdStatus.jsx
│   │   ├── ReportIssue.jsx
│   │   ├── SavedRoutes.jsx
│   │   └── NotFound.jsx
│   ├── data/              Demo data
│   │   ├── demoRoutes.js  10 Chennai bus routes with stops
│   │   └── demoAlerts.js  Sample service alerts
│   ├── services/          API + storage layer
│   │   ├── supabaseClient.js
│   │   ├── routeService.js
│   │   ├── crowdService.js
│   │   ├── reportService.js
│   │   └── savedRoutesService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── schema.sql         Database schema
├── vercel.json            SPA routing config
├── .env.example           Environment variable template
└── README.md
```

---

## Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/busbridge.git
cd busbridge

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> The application works **fully in demo mode** without Supabase credentials.  
> All data is stored in browser localStorage.

---

## Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`
4. Copy your **Project URL** and **anon public key** from Project Settings → API
5. Add them to your `.env` file

---

## Production Build

```bash
npm run build      # Build for production
npm run preview    # Preview production build locally
```

---

## Deployment to Vercel

### Method 1: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Method 2: GitHub Integration
1. Push repository to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard (Settings → Environment Variables)
5. Deploy

The `vercel.json` file is already configured for SPA routing.

---

## GitHub Upload

```bash
git init
git add .
git commit -m "feat: BusBridge v1.0 – SWYNEX Internship Task 2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/busbridge.git
git push -u origin main
```

---

## Screenshots

> Add screenshots of each screen after first deployment.

| Home Dashboard | Bus Search | Route Details |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

| Crowd Status | Report Issue | Saved Routes |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## Data Disclaimer

All bus route numbers, stop names, journey durations, and crowd data shown in the application are **sample data for demonstration purposes only**. They do not represent official MTC Chennai schedules or real-time information.

---

## Future Improvements

- [ ] Integrate official MTC Chennai GTFS/API data
- [ ] Real-time GPS bus tracking
- [ ] User authentication (Supabase Auth)
- [ ] Push notifications for alerts
- [ ] Offline PWA support
- [ ] Tamil language support
- [ ] Accessibility (screen reader) improvements
- [ ] Bus pass / fare calculator
- [ ] Multi-city support (other Tamil Nadu cities)

---

## Internship Context

| Field | Detail |
|---|---|
| Organisation | SWYNEX |
| Task | Task 2 – Core App Screens |
| Application | BusBridge – Public Bus Information Gap Solver |
| Scope | Chennai, Tamil Nadu, India |
| Developer | NAVEENKUMAR S |
