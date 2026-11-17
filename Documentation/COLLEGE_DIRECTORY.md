# Chennai College Directory & Transit Mappings
## Institutional Coverage in BusBridge Student Travel Hub

The BusBridge College Directory includes premier educational institutions situated across Chennai's suburban educational clusters. Each college configuration provides verified geographic coordinates, campus entrance access points, walking distances to official municipal stops, feeder links, and transit mappings to major bus terminals.

---

## 1. Initial College Coverage (7 Key Institutions)

| Institution Name | Short Name | Area / Educational Zone | Campus GPS | Primary Boarding Stop | Walking / Feeder Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chennai Institute of Technology** *(Priority #1)* | CIT Kundrathur | Sarathy Nagar, Kundrathur | 12.9716° N, 80.0412° E | Puthuper Bus Stop (350m) / Kundrathur B.S. (6.2km) | 4 min walk to Puthuper; ₹15 share-auto (12 min) to Kundrathur B.S. |
| **College of Engineering, Guindy (Anna Univ)** | CEG Guindy | Sardar Patel Road, Guindy | 13.0109° N, 80.2354° E | Anna University / Guindy Bus Stop (120m) | 2 min walk directly onto Sardar Patel Road |
| **Madras Institute of Technology (MIT)** | MIT Chromepet | Radha Nagar, Chromepet | 12.9482° N, 80.1415° E | Chromepet Bus Stand & Railway Gate (250m) | 3 min walk to GST Road transit corridor |
| **Indian Institute of Technology Madras** | IIT Madras | Sardar Patel Road, Adyar / Guindy | 12.9915° N, 80.2337° E | IIT Main Gate Bus Stop (100m) | 1 min walk to IIT gate on Sardar Patel Road |
| **Vellore Institute of Technology Chennai** | VIT Chennai | Vandalur-Kelambakkam Road | 12.8406° N, 80.1535° E | VIT Chennai Campus Stop (50m) | 1 min walk to Vandalur-Kelambakkam Rd |
| **IIITDM Kancheepuram** | IIITDM | Melakottaiyur, Off V-K Road | 12.8384° N, 80.1492° E | Kandigai Junction Bus Stop (1.2km) | 14 min walk or ₹10 local share auto |
| **SRM Easwari Engineering College** | SRM Easwari | Bharathi Salai, Ramapuram | 13.0322° N, 80.1812° E | Ramapuram Signal / Arignar Anna Stop (350m) | 4 min walk to Mount-Poonamallee feeder road |

---

## 2. Institutional Transit Configurations

### 1. Chennai Institute of Technology (CIT), Kundrathur
- **Campus Location:** Sarathy Nagar, Nandhambakkam Post, Kundrathur, Chennai - 600069.
- **Campus Coordinates:** `12.9716, 80.0412`
- **Nearby Boarding Stops:**
  - *Puthuper Bus Stop:* 350 meters walk (4 mins). Local feeder auto point.
  - *Somangalam Road Junction:* 750 meters walk (9 mins). Direct link to West Tambaram.
  - *Kundrathur Bus Stand:* 6.2 km (12–15 mins via share-auto). Starting terminus for Route 66K (Platform 1).
- **Supported Terminals:**
  - **Kilambakkam KCBT:** Direct Route 66K (~75 mins) or Route 566 + Tambaram GST Shuttle (~70 mins).
  - **CMBT Koyambedu:** Direct Route 88K / 88C from Kundrathur B.S. (~65 mins).
  - **Tambaram West Terminus:** Direct Route 66, 66K, 566 (~25 mins).
  - **Broadway / Central:** Route 88K / 66 to Guindy + Metro/Bus to Central (~80 mins).

### 2. College of Engineering, Guindy (CEG - Anna University)
- **Campus Location:** Sardar Patel Road, Guindy, Chennai - 600025.
- **Nearby Boarding Stops:** Anna University Stop, Gandhi Mandapam Stop, Guindy Race Course Stop.
- **Key Routes to Kilambakkam:** Route 21G, 70V, G18 directly down GST Road corridor.

### 3. Madras Institute of Technology (MIT - Anna University), Chromepet
- **Campus Location:** Radha Nagar, Chromepet, Chennai - 600044.
- **Nearby Boarding Stops:** Chromepet MIT Gate Stop, Chromepet Bus Stand.
- **Key Routes to Kilambakkam:** Situated directly on GST Road. Routes 66K, 70, G18, E18, 91R provide high-frequency service (buses every 2–4 mins).

### 4. IIT Madras, Adyar / Guindy
- **Campus Location:** Sardar Patel Road, Opposite C.L.R.I., Adyar, Chennai - 600036.
- **Nearby Boarding Stops:** IIT Madras Main Gate, Gandhi Mandapam.
- **Key Routes to Kilambakkam:** Route 21G, 19B to Guindy + G18/70 to Kilambakkam.

### 5. VIT Chennai, Vandalur-Kelambakkam Road
- **Campus Location:** Kelambakkam - Vandalur Rd, Rajan Nagar, Melakottaiyur, Chennai - 600127.
- **Nearby Boarding Stops:** VIT Chennai Campus Gate Stop (50m).
- **Key Routes to Kilambakkam:** Route 515, 515T, 55K directly to Kilambakkam KCBT (20–25 mins).

### 6. IIITDM Kancheepuram
- **Campus Location:** Melakottaiyur, Off Vandalur-Kelambakkam Road, Chennai - 600127.
- **Nearby Boarding Stops:** Kandigai Junction Stop (1.2 km).
- **Key Routes to Kilambakkam:** Route 515, 55K via Kandigai to KCBT (25 mins).

### 7. SRM Easwari Engineering College, Ramapuram
- **Campus Location:** Bharathi Salai, Ramapuram, Chennai - 600089.
- **Nearby Boarding Stops:** Ramapuram Signal, DLF IT Park Stop.
- **Key Routes to Kilambakkam:** Route 54B / 88K to Porur/Guindy + Route 70 / 66K to Kilambakkam.

---

## 3. Persistence & College Switching Architecture
- Selected college ID is stored in browser `localStorage` under key `busbridge_selected_college_id`.
- Emits custom DOM event `busbridge_college_changed` across components for instant synchronized UI updates without full page reload.
- Defaults safely to `cit-kundrathur` as the flagship campus.
