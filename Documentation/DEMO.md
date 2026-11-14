# BusBridge – Live Application Demonstration Guide
**SWYNEX Technologies App Development Internship – Task 4 Final Deliverable**

---

## 1. Purpose of BusBridge

**BusBridge** is a modern, responsive public transit web application designed to solve transit information gaps for commuters across the Chennai Metropolitan Transport Corporation (MTC) bus network.

Public bus commuters in metropolitan transit systems regularly experience:
1. **Uncertain connections:** Knowing which bus to take when no single direct bus runs between their origin and destination.
2. **Missing stop details:** Not knowing intermediate stops, boarding points, and interchange locations.
3. **Surprise disruptions:** Missing route diversions, temporary stop closures, or weekend cancellations.
4. **Overcrowding:** Boarding without prior knowledge of passenger crowd levels.
5. **No offline access:** Having to repeatedly search for everyday commutes.

BusBridge bridges this gap by providing an offline-resilient, community-driven transit hub that brings together multi-leg journey planning, nearby bus stop radar, active service advisories, crowd estimation, and persistent saved routes.

---

## 2. Main Features Overview

| Feature | Route | Key Capabilities |
|---|---|---|
| **Smart Dashboard** | `/` | Hero search, predictive Chennai stop autocompletes, 1-tap direction swap, quick feature launchpad, recent searches, live MTC demo badge |
| **Smart Journey Planner** | `/planner` | Breadth-first graph search over Chennai MTC routes, direct & 1-transfer connections, sorting (Fastest, Transfers, Distance), visual timeline, 1-tap save |
| **Saved Routes Hub** | `/saved` | Task 3 & 4 core feature: synchronous `localStorage` persistence, duplicate prevention, search & filters (Direct vs Transfer), confirmed clear all, empty state |
| **Nearby Stops Radar** | `/nearby` | Privacy-first browser GPS, standard Haversine distance formula, radius filter (500m to 10km), Leaflet map with user pulse circle, 8 Chennai transit anchors |
| **Service Alerts Center** | `/alerts` | 6 alert categories, personal matching against saved journeys (*"Affects Your Saved Journey"* badge), unread counter badge, demo alert publisher |
| **Crowd Intelligence** | `/crowd` | Community-sourced occupancy ratings (Low=1, Med=2, High=3), confidence indicator, submission cooldown abuse protection |
| **Grievance Issue Reporting** | `/report` | Passenger grievance filing with unique tracking reference IDs and status history |
| **Route Directory** | `/search` | Bus number and stop catalog search with intermediate schedules |
| **Interactive Map View** | `/route/:id` | Leaflet map with stop pins and route path polyline |
| **Theme Engine** | Global | "Chennai Emerald Glassmorphism" with persistent Light and Metro Dark mode toggle |

---

## 3. Recommended 5-Minute Demonstration Sequence

Follow this step-by-step sequence to demonstrate the entire application during evaluation:

### Step 1: Start the Application
```bash
cd busbridge
npm run dev
```
Open **`http://localhost:5173`** in Google Chrome or any modern browser.

---

### Step 2: Dashboard & Live Autocomplete (`/`)
1. Notice the **Chennai Emerald Glassmorphism** header with the MTC Chennai transit badge and active notification counter.
2. In the **"From"** input box, start typing `"Tam"`. Observe the instant predictive dropdown suggesting `Tambaram`, `Tambaram Sanatorium`, etc. Click `Tambaram`.
3. In the **"To"** input box, type `"Bro"` and click `Broadway` from the suggestions.
4. Click the **"Swap"** (`Shuffle`) button between the inputs to see origin and destination invert smoothly.
5. Click **"Find Routes"**.

---

### Step 3: Smart Journey Planner & Route Sorting (`/planner`)
1. On the Journey Planner results page, observe both:
   - **Direct Routes** (e.g. Bus `18A` or `A1` direct to Broadway).
   - **1-Transfer Connections** (e.g. Bus `21C` to Guindy Interchange, transferring to Bus `19H` to Broadway).
2. Switch between sorting toggles:
   - **Fastest Route** (sorts by lowest duration).
   - **Fewest Transfers** (prioritizes 0-transfer direct routes).
   - **Shortest Distance** (sorts by fewest kilometers).
3. Expand a route card to view the stop-by-stop visual timeline.
4. Click the **"Save Route" / "Bookmark"** button on one of the journey cards. Notice the instant toast notification:  
   *"Bus 18A (Tambaram ➔ Broadway) saved to favourites!"*
5. Try clicking **"Save Route"** on the same journey again. Notice the duplicate validation warning:  
   *"Bus 18A (Tambaram ➔ Broadway) is already in your saved routes."*

---

### Step 4: Persistent Saved Routes & Offline Management (`/saved`)
1. Click **"Saved"** in the top navigation or bottom navigation bar.
2. Observe your saved journey listed with route chips, stop count, and saved timestamp.
3. Refresh the browser (`F5` or `Ctrl + R`). Verify that the saved route **remains intact** (persisted in `localStorage`).
4. Type in the search bar or toggle filters (*Direct Routes* vs *1-Transfer*) to see instant filtering.
5. Click the **"Delete"** (`Trash2`) button on an individual route to verify single removal.
6. Click **"Clear All"** and observe the confirmation safety modal before storage is cleared.
7. Once cleared, observe the clean, meaningful **empty state** with a 1-tap shortcut button: *"Explore Smart Planner"*.

---

### Step 5: Nearby Bus Stops & Haversine Radar (`/nearby`)
1. Navigate to **"Nearby"** via the top navbar or the floating **Nearby Radar FAB**.
2. Notice the privacy safeguard: GPS is **not** accessed automatically on page load.
3. Click any of the **Chennai Transit Anchors** (e.g., `Guindy`, `Tambaram`, or `CMBT Koyambedu`).
4. Observe the Leaflet map center immediately with a pulsing user beacon ring and color-coded stop pins.
5. Notice the calculated distance displayed in meters (`350 m`) or kilometers (`1.86 km`), computed via the **Haversine formula**.
6. Switch radius filters (`500m`, `1km`, `2km`, `5km`) to see the stop list update in real time.
7. Click the **"Plan Trip →"** action on any stop card to see that stop loaded directly into the journey planner.

---

### Step 6: Smart Service Alerts & Personalized Matching (`/alerts`)
1. Navigate to **"Alerts"**.
2. Notice the active alert cards categorized by severity (High, Medium, Low) with distinct animated pulse beacons.
3. Save a route that passes through `Saidapet` or `Anna Salai` (e.g. Bus `18A` or `21C`).
4. Switch to the **"My Saved"** tab in Service Alerts. Notice the **"Affects Your Saved Journey"** gold highlight badge.
5. Toggle an alert between **Mark Read** and **Mark Unread**. Watch the unread badge in the header navbar update instantaneously.

---

### Step 7: Crowd Intelligence & Issue Reporting (`/crowd`, `/report`)
1. Navigate to **"Crowd"**.
2. Select a bus route (e.g. `21C`), pick a crowd level (*Low*, *Medium*, or *High*), and submit.
3. Notice the community-weighted score update, accompanied by a submission cooldown timer preventing rapid abuse.
4. Navigate to **"Reports"**, submit an issue ticket (e.g. *Bus Punctuality*), and verify that a unique tracking reference ID is generated and saved to your history.

---

### Step 8: Theme Switcher (Light & Metro Dark Mode)
1. In the top navigation header, click the **Sun/Moon** icon.
2. Watch the application smoothly transition between **Neo-Transit Light** and **Metro Dark** modes.
3. Refresh the browser; verify that your selected theme preference persists via `localStorage`.

---

## 4. Evaluation Checklist

| Rubric Item | Verified Location | Result |
|---|---|---|
| Complete Feature Path | Saved Routes (`/saved`) | ✅ PASS |
| Input Validation | Planner & Saved Routes | ✅ PASS |
| Duplicate Prevention | `savedRoutesService.js` | ✅ PASS |
| Data Persistence | `localStorage` | ✅ PASS |
| Empty States | Saved Routes, Planner | ✅ PASS |
| Responsive Layout | 360px mobile to 1440px desktop | ✅ PASS |
| Production Build | `npm run build` | ✅ PASS (0 errors) |
| Actual Screenshots | `screenshots/` directory (9 PNGs) | ✅ PASS |
| Documentation | Root README, FEATURES, TECH_STACK, SETUP_GUIDE, DEMO | ✅ PASS |
