# BusBridge Technology Stack & Architecture

This document describes the technical architecture, libraries, algorithms, and data persistence models powering the **BusBridge** Chennai Urban Mobility web application.

---

## 1. Core Framework & Libraries

| Technology | Version | Purpose |
|---|---|---|
| **React** | `18.3.1` | Declarative UI component tree, state management, and lifecycle hooks |
| **Vite** | `5.4.10` | Next-generation frontend build tooling and Hot Module Replacement (HMR) |
| **React Router DOM** | `6.28.0` | Client-side routing, route-based code-splitting, and query param state |
| **Tailwind CSS** | `3.4.14` | Utility-first styling, responsive layout grid, and CSS variable dark mode |
| **Leaflet & React-Leaflet** | `1.9.4` / `4.2.1` | Interactive geospatial transit map rendering and custom coordinate markers |
| **Lucide React** | `0.453.0` | Accessible, tree-shakeable SVG icon components |
| **Supabase JS (Optional)** | `2.45.4` | Optional cloud database client; gracefully falls back to local demo state |

---

## 2. Architecture & Directory Structure

```text
busbridge/
├── index.html                   # HTML entry point with font preloading
├── vite.config.js               # Build config with Rollup manual chunks
├── tailwind.config.js           # Theme configuration, colors & dark mode
├── package.json                 # Project dependencies & scripts
└── src/
    ├── main.jsx                 # React root DOM hydration
    ├── App.jsx                  # Root layout, router, Suspense, theme wrapper
    ├── index.css                # Base Tailwind layer & custom scrollbars
    ├── components/
    │   ├── AlertCard.jsx        # Memoized service alert presentation card
    │   ├── BottomNavigation.jsx # Mobile thumb-zone bottom navigation bar
    │   ├── BusStopList.jsx      # Stop sequence timeline listing
    │   ├── CrowdStatusCard.jsx  # Community crowd occupancy indicator
    │   ├── JourneyCard.jsx      # Direct & transfer route recommendation card
    │   ├── LoadingSpinner.jsx   # Accessible SVG loading state spinner
    │   ├── MapView.jsx          # Interactive Leaflet map with user pulse ring
    │   ├── Navbar.jsx           # Desktop navigation, theme toggle & badges
    │   └── RouteCard.jsx        # Bus route catalog preview card
    ├── data/
    │   ├── demoAlerts.js        # Baseline Chennai MTC service advisories
    │   └── demoRoutes.js        # Comprehensive Chennai bus stops & coordinates
    ├── hooks/
    │   └── useSavedRoutes.js    # Custom React hook for saved journey reactivity
    ├── pages/
    │   ├── BusSearch.jsx        # Bus route search and catalog explorer
    │   ├── CrowdStatus.jsx      # Community crowd reporting and analytics
    │   ├── Home.jsx             # Hero search, live autocompletes, quick links
    │   ├── JourneyPlanner.jsx   # Direct & 1-transfer journey planning engine
    │   ├── NearbyStops.jsx      # GPS geolocation radar with Haversine formula
    │   ├── NotFound.jsx         # 404 fallback page
    │   ├── ReportIssue.jsx      # Passenger issue reporting & ticket tracker
    │   ├── RouteDetails.jsx     # Stop-by-stop route schedule & map timeline
    │   ├── SavedRoutes.jsx      # Saved journey management dashboard
    │   └── ServiceAlerts.jsx    # Real-time service alerts & notification center
    └── services/
        ├── alertService.js      # Service alerts CRUD, matching & read status
        ├── crowdService.js      # Crowd report submission, weighting & caching
        ├── geolocationService.js# Haversine distance, catalog & GPS wrapper
        ├── journeyService.js    # Route-finding graph search & connection solver
        ├── reportService.js     # Issue submission & ticket status lifecycle
        ├── routeService.js      # Bus search query engine & recent searches
        ├── savedRoutesService.js# Persistent storage, duplicate checks & sanitization
        └── supabaseClient.js    # Resilient Supabase client with offline fallback
```

---

## 3. Data Storage & State Architecture

### LocalStorage Persistence Schema

BusBridge is designed with an **offline-first, zero-backend dependency** architecture for maximum reliability during local development and evaluation:

1. `busbridge_saved_routes`: Stores array of formatted journey objects containing:
   - `id`: Unique journey string key.
   - `from` / `to`: Boarding and destination stops.
   - `busNumber`: Operating bus route number or multi-leg string (`"21C + 19H"`).
   - `transfersCount`: Number of vehicle interchanges (`0` or `1`).
   - `duration` / `distance`: Estimated travel metrics.
   - `legs`: Array of leg segments with boarding/alighting stops.
   - `savedAt`: ISO 8601 timestamp.
2. `busbridge_service_alerts`: Active and archived transit notices.
3. `busbridge_read_notifications`: Set of alert IDs marked as read by user.
4. `busbridge_crowd_reports`: Community crowd rating submissions with cooldown locks.
5. `busbridge_reported_issues`: Passenger grievance reports and ticket statuses.
6. `busbridge_recent_searches`: Last 5 search queries for 1-tap replay.
7. `busbridge_theme`: Persistent visual mode selection (`"light"` or `"dark"`).

---

## 4. Key Algorithms

### 1. Haversine Distance Formula
Used in [`geolocationService.js`](file:///d:/SWYNEX%20App%20Development%20Internship/busbridge/src/services/geolocationService.js) to compute accurate Great-Circle distance over Earth's spherical surface:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- $R = 6371\text{ km}$ (Earth mean radius).
- Formatted as meters if $< 1\text{ km}$ (e.g. `350 m`) or kilometers if $\ge 1\text{ km}$ (`1.86 km`).

### 2. Multi-Leg Journey Search Algorithm
Implemented in [`journeyService.js`](file:///d:/SWYNEX%20App%20Development%20Internship/busbridge/src/services/journeyService.js):
- **Pass 1:** Direct route query scanning route stops in order of travel.
- **Pass 2:** 1-transfer interchange finding where `Stop A ➔ Intermediate Interchange Stop ➔ Stop B` using verified stop intersections.
- Routes are filtered to ensure connectivity and sorted by duration, transfers, or distance.

