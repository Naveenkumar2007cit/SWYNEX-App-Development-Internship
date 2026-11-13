# Screenshots & Visual Design Reference

This directory provides visual representations and design captures of the **BusBridge** Chennai Urban Mobility web application developed for the **SWYNEX Technologies App Development Internship**.

---

## Screen Highlights

### 1. Home Dashboard & Live Stop Autocomplete
- Features the **Chennai Emerald Glassmorphism** header with MTC transit badge.
- Interactive starting stop and destination stop input boxes with real-time Chennai terminus autocomplete suggestions.
- Direction swap utility (`Shuffle`) and quick transit features grid.
- Accessible at: `/`

### 2. Smart Journey Planner
- Direct MTC routes and 1-transfer connections across Chennai hubs (Tambaram, Guindy, Koyambedu CMBT, Broadway, Saidapet, Adyar, Velachery).
- Live sorting toggles: **Fastest Route**, **Fewest Transfers**, and **Shortest Distance**.
- Interactive stop-by-stop route timelines with boarding/alighting indicators.
- 1-tap **"Save to Favourites"** button with duplicate detection.
- Accessible at: `/planner`

### 3. Nearby Bus Stops & Haversine Geolocation Radar
- Browser Geolocation API integration (privacy-first, user-click activated).
- Mathematical distance calculation using standard **Haversine formula**.
- Configurable radar radius (500m to 10km).
- Interactive Leaflet map with pulsing user beacon and colored stop pins.
- 8 Curated Chennai Transit Anchors fallback (Guindy, Tambaram, CMBT, T. Nagar, etc.).
- Accessible at: `/nearby`

### 4. Saved Routes & Persistent State (Task 3 Core Feature)
- Dedicated offline-resilient dashboard storing journeys in `localStorage`.
- Comprehensive validation against empty inputs and identical source/destination.
- Duplicate prevention matching source, destination, and bus sequence.
- Search, filter (Direct vs 1-Transfer), and sorting (Recent, Duration, Stops).
- Individual journey deletion and confirmed "Clear All" modal.
- Accessible at: `/saved`

### 5. Smart Service Alerts & Notification Center
- Categorized transit advisories: Bus Delays, Route Diversions, Service Disruptions, Stop Changes, Cancellations, and Announcements.
- Cross-references user's saved journeys with **"Affects Your Saved Journey"** highlight badges.
- Dynamic unread notification counter badge on Navbar and Bottom Navigation.
- In-app demo alert publisher with custom expiry and affected route pills.
- Accessible at: `/alerts`

### 6. Community Crowd Intelligence & Issue Reporting
- Community-sourced occupancy level estimation (Low: 1, Medium: 2, High: 3).
- Submission form with cooldown abuse protection and localStorage history.
- Passenger issue reporting with simulated reference IDs and ticket status tracker.
- Accessible at: `/crowd` and `/report`

---

*Design mockups and wireframes from Task 1 are additionally preserved in the `Design/` directory.*
