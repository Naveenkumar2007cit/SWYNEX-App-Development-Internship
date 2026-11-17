# MTC Data Sources & Transit Authenticity
## Official Data Verification and Standards in BusBridge

BusBridge is engineered to provide authentic, verified public transit information for Chennai. To maintain absolute transparency and passenger safety, this document outlines the operational data sources, timetables, and verification mechanisms used across the platform.

---

## 1. Operating Transit Authorities

| Authority Acronym | Full Name | Jurisdiction / Coverage |
| :--- | :--- | :--- |
| **MTC** | Metropolitan Transport Corporation (Chennai) Ltd. | Intra-city bus transportation across the Chennai Metropolitan Area (CMA), covering Chennai, Chengalpattu, Kanchipuram, and Tiruvallur districts. |
| **TNSTC** | Tamil Nadu State Transport Corporation | Intra-state and inter-district express and ordinary services operating across Tamil Nadu divisions (Villupuram, Kumbakonam, Salem, Coimbatore, Madurai, Tirunelveli). |
| **SETC** | State Express Transport Corporation (Tamil Nadu) Ltd. | Long-distance inter-state and inter-city deluxe, ultra-deluxe, air-conditioned, and sleeper services spanning routes exceeding 300 km. |

---

## 2. Official Timetable & Route Reference Sources

All transit schedules, bus stop sequences, route numbers, and interchange locations implemented in BusBridge are calibrated against the following official government sources:

1. **Official MTC Chennai Portal:**
   - URL: [https://mtcbus.tn.gov.in](https://mtcbus.tn.gov.in)
   - Scope: Route directories, stage fare charts, ordinary vs deluxe fare stages, terminus allocation.
2. **Tamil Nadu State Transport Corporation e-Reservation Portal:**
   - URL: [https://www.tnstc.in](https://www.tnstc.in)
   - Scope: Intercity schedules, express route numbers, terminal departure bays, online advance booking.
3. **Chennai Metropolitan Development Authority (CMDA) - KCBT Kilambakkam Master Plan:**
   - Scope: Terminal bay allocation, platform 5–12 MTC city bus distribution, pedestrian concourses, and feeder bay layout.
4. **Government Press Releases (Information & Public Relations Dept):**
   - Scope: Special festival services, Pongal/Diwali round-the-clock feeder operational notifications, temporary terminus reallocations.

---

## 3. Disclaimers on Live GPS & Dynamic Data

BusBridge maintains strict engineering ethics regarding real-time data:
- **No Fabricated GPS:** BusBridge **does not simulate fake live GPS vehicle markers**. All arrival estimates are derived from verified official timetable frequencies and geographic distance calculations (Haversine formula).
- **No Third-Party Scraping:** Timetable data is curated in structured JSON configurations following official published MTC schedules.
- **Independent Application:** BusBridge is developed as an academic and internship public transit initiative under the SWYNEX Technologies App Development Internship program. It is not an official Tamil Nadu Government portal; all online ticket bookings are directed to the official government portal [www.tnstc.in](https://www.tnstc.in).

---

## 4. Emergency & Official Helplines

For real-time operational grievances, lost property, or direct official route inquiries:
- **State Transport Toll-Free Helpline:** `149` (24x7 Government of Tamil Nadu Transit Support)
- **MTC Chennai Customer Care:** `044-2345 5801` / `044-2345 5802`
- **Kilambakkam KCBT Information Desk:** Main Concourse Ground Level, 24x7 Help Desk.
