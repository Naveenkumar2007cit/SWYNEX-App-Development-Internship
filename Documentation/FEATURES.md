# BusBridge Features Specification & Status (SWYNEX Internship)

This document provides a feature audit and technical breakdown of the **BusBridge** application across **Task 1**, **Task 2**, and **Task 3**.

---

## 1. Task 3 Core Feature: Saved Bus Routes & Persistent State

| Requirement | Implementation Details | Status |
|---|---|---|
| **Search Journey & Save** | Users can search journeys in the Planner or Home, and save directly to favourites via `saveRoute()` | ✅ Working |
| **Source & Destination Validation** | Checks for non-empty string inputs, valid stop names, and sanitized objects | ✅ Working |
| **Prevent Identical Source & Destination** | Validates that source stop does not equal destination stop (`areStopsEqual`) | ✅ Working |
| **LocalStorage Persistence** | Uses `busbridge_saved_routes` key; resilient parsing with corrupted data recovery | ✅ Working |
| **Survive Browser Reloads** | Stored synchronously in `localStorage` and rehydrated automatically on mount | ✅ Working |
| **Duplicate Prevention** | `findDuplicate()` checks candidate `source`, `destination`, and `busNumber` sequence | ✅ Working |
| **Duplicate Validation Feedback** | Returns warning notification: *"Bus [X] ([From] ➔ [To]) is already in your saved routes"* | ✅ Working |
| **Individual Journey Deletion** | 1-tap delete button with immediate state sync and toast feedback | ✅ Working |
| **Confirmation Before Clear All** | Safe modal/confirmation dialog requiring user confirmation before wiping list | ✅ Working |
| **Meaningful Empty State** | Shows empty state with quick link to *"Explore Smart Planner"* | ✅ Working |
| **Instant Cross-Component Sync** | Custom DOM event `busbridge_saved_routes_changed` updates Navbar badge & Home list | ✅ Working |

---

## 2. Advanced Transit Features (Task 3 Feature Modules)

### Feature 1: Smart Journey Planner (`/planner`)
- **Direct & 1-Transfer Graph Search:** Breadth-first traversal over Chennai MTC bus routes.
- **Auto-Suggestions:** Real-time dropdown search over 40+ Chennai stops.
- **Sorting Options:** Fastest Route, Fewest Transfers, and Shortest Distance.
- **Stop Timelines:** Expandable visual timelines indicating boarding, transfer interchange, and alighting stops.
- **Direction Swap:** Inverts source and destination with 1 click.

### Feature 2: Nearby Bus Stops & Geolocation (`/nearby`)
- **Privacy-First Geolocation:** Activated only upon user request; coordinates stay strictly in browser memory.
- **Haversine Distance Radar:** Mathematical calculation of distance in kilometers/meters.
- **Filter Radius:** 500m, 1km, 2km, 3km, 5km, and 10km radius filters.
- **Interactive Leaflet Map:** Custom map pins, user pulse ring, and popup route listings.
- **Chennai Transit Anchors:** 8 curated hub presets for testing without GPS.

### Feature 3: Smart Service Alerts & Notification Center (`/alerts`)
- **Alert Types:** Delays, Diversions, Disruptions, Stop Changes, Cancellations, Advisories.
- **Personalized Route Matching:** Cross-references active advisories against user's saved routes with a gold **"Affects Your Saved Journey"** badge.
- **Notification Counter:** Real-time unread badge counter in desktop navbar and mobile bottom nav.
- **Demo Alert Publisher:** Admin simulator to publish custom advisories with expiration dates.

### Feature 4: Crowd Intelligence & Occupancy Estimates (`/crowd`)
- **Crowd Scoring:** Low (1), Medium (2), High (3) community calculation algorithm.
- **Abuse Cooldown:** Prevents rapid re-submission on the same bus route.
- **Confidence Indicator:** Displays confidence level based on recent report volume.
- **Demo Data Notice:** Clearly labeled as community-sourced estimation rather than official telemetry.

### Feature 5: Community Issue Reporting (`/report`)
- **Categorized Issue Submission:** Vehicle hygiene, punctuality, ticketing, driver behavior.
- **Unique Ticket ID:** Generates ticket tracking reference numbers stored in browser memory.
- **Status Dashboard:** Lists submitted tickets and their simulated resolution lifecycle.

---

## 3. UI/UX & Design System

- **Design Theme:** "Chennai Emerald Glassmorphism" featuring MTC Emerald accents, translucent frosted glass cards, and soft ambient glows.
- **Theme Mode:** Integrated Light Mode and Metro Dark Mode toggle with persistent `localStorage` preference.
- **Accessibility:** WCAG AA compliant color contrast, prominent focus rings (`focus:ring-emerald-400`), and screen-reader accessible attributes.
- **Mobile Thumb Zone:** Responsive bottom navigation bar with live notification badges and persistent **Nearby Radar FAB**.

