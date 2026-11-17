# BusBridge – Student Travel Hub Documentation
## Chennai College-to-Government-Bus Journey Planner

The **Student Travel Hub** in BusBridge is a specialized public transit advisory engine built specifically for university students, hostel residents, and newcomers in Chennai. It bridges the critical transit gap between suburban college campuses and major government long-distance bus terminals.

---

## 1. Primary Objective: The CIT ➔ Kilambakkam Corridor

Many students studying in Chennai engineering and arts colleges travel home during:
- Friday evenings & weekend breaks
- Semester holidays
- Major Tamil Nadu festivals (Pongal, Diwali, Tamil New Year, Christmas/New Year)

The flagship implementation focuses on:
> **Chennai Institute of Technology (CIT), Kundrathur ➔ Kilambakkam Kalaignar Centenary Bus Terminus (KCBT)**

### Why Kilambakkam (KCBT)?
Opened in December 2023, **Kalaignar Centenary Bus Terminus (KCBT)** at Kilambakkam on GST Road (Vandalur/Urapakkam) is the primary gateway for all government buses bound for Central and South Tamil Nadu (Madurai, Trichy, Tirunelveli, Kanyakumari, Salem, Coimbatore, Thanjavur, etc.). Long-distance buses no longer operate south from CMBT Koyambedu, making Kilambakkam the mandatory departure terminal for southern districts.

---

## 2. Two-Stage Transit Architecture

BusBridge strictly separates intra-city government city buses from intercity state express buses to avoid traveler confusion:

```
[ College Campus / Hostel ]
          │ (Walking / Feeder Share Auto: 4-12 mins)
          ▼
[ Verified Nearby Boarding Stop ] (e.g. Kundrathur Bus Stand / Puthuper)
          │
          ▼ ─── STAGE A: Intra-City Transit (MTC Chennai Government Buses)
[ MTC Route 66K Direct or 566 + GST Corridor ]
          │
          ▼
[ Kilambakkam KCBT MTC Zone ] (Platforms 5–12)
          │ (Pedestrian Overhead Canopy Walkway: 3-5 mins)
          ▼ ─── STAGE B: Intercity Transit (TNSTC / SETC State Express)
[ Long-Distance Bus Departure Bays ] ➔ Destination (Hometown)
```

### Stage A: College to Terminus (MTC Government Bus)
- **Operator:** Metropolitan Transport Corporation (Chennai) Ltd. (MTC)
- **Ticketing:** Cash / contactless on-board conductor ticketing (student concessions applicable where registered).
- **Stops:** Boarded at designated MTC municipal bus stops and terminus platforms.

### Stage B: Terminus to Hometown (Intercity Express)
- **Operators:**
  - **SETC (State Express Transport Corporation):** Long-distance AC Deluxe, Ultra Deluxe, and Sleeper buses to southern extremities and neighboring states.
  - **TNSTC (Tamil Nadu State Transport Corporation):** Villupuram, Kumbakonam, and Salem divisions operating express services.
- **Booking & Reservations:** Bookable strictly on the official Tamil Nadu government portal: [www.tnstc.in](https://www.tnstc.in) or physical reservation counters at the terminal concourse.
- **Helpline:** Government round-the-clock helpline **149**.

---

## 3. Verified Route Options for CIT Kundrathur

### Option 1: Direct MTC Route 66K (Recommended)
- **Origin Terminus:** Kundrathur Bus Stand (Platform 1)
- **Destination:** Kilambakkam KCBT (Platform 10)
- **Travel Time:** ~75 minutes
- **Frequency:** Every 25–35 minutes
- **Operator:** MTC Government City Bus (Ordinary & Deluxe)
- **Key Route Path:** Kundrathur B.S. ➔ Anakaputhur ➔ Pammal ➔ Pallavaram ➔ Chromepet ➔ TB Sanatorium ➔ Tambaram West ➔ Perungalathur ➔ Vandalur Zoo ➔ Kilambakkam KCBT.
- **Campus Link:** 350m walk to Puthuper stop, board a local feeder auto (₹15, 12 mins) to Kundrathur Bus Stand.

### Option 2: High-Frequency Transfer via Tambaram West
- **First Leg:** Board MTC Route 566 or shared feeder from Somangalam Road / Kundrathur to Tambaram West Bus Stand (~25 mins).
- **Second Leg:** Transfer at Tambaram West to any south-bound GST Road shuttle (Route 70, G18, E18, 91R, 66K) departing every 3–5 minutes down GST Road to KCBT (~30 mins).
- **Total Time:** ~65–75 minutes.

---

## 4. Government-Bus-Only Guarantee

BusBridge provides an enforced **"Govt Buses Only"** filter:
- Only official **MTC (Metropolitan Transport Corporation)** and **TNSTC/SETC** buses are presented.
- Private omnibuses, unauthorized private operators, and campus shuttles are strictly excluded from municipal routing schedules to protect students from arbitrary fare surges during festival rushes.

---

## 5. Festival & Vacation Travel Engine

During peak departure windows, BusBridge presents targeted advisory notes:
1. **Weekend Friday Rush (4:00 PM – 8:30 PM):** High passenger volume on Kundrathur–Tambaram corridor. Recommends departing campus by 4:15 PM.
2. **Pongal Vacation (Mid-January):** Special round-the-clock MTC feeder buses between Tambaram, Kundrathur, and Kilambakkam.
3. **Diwali Holidays (October/November):** Mandatory advance seat reservations via tnstc.in at least 2 weeks ahead.
4. **Semester End Vacation (May–June / Nov–Dec):** Guidance for heavy luggage handling starting from origin terminus points.

---

## 6. Freshers & Beginner's Guide (English & தமிழ்)

A 5-step interactive survival guide helps out-of-town students navigate Chennai transit:
1. **How to Identify an MTC Bus** (Distinct government emblem, red/cream ordinary & green/white deluxe liveries).
2. **How to Read the Route Board** (Front LED display format, destination validation).
3. **Locating Verified Boarding Stops** (Guidance on road junctions vs campus gates).
4. **Changing Buses at Interchanges** (Navigating Tambaram West and Sanatorium interchanges).
5. **Navigating Kilambakkam KCBT** (Transferring from MTC arrival bays 5–12 to SETC/TNSTC finger bays).
