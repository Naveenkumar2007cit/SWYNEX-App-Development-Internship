# BusBridge Setup & Execution Guide

Step-by-step instructions to clone, configure, run, and test **BusBridge** on Windows, macOS, or Linux.

---

## 1. Prerequisites

- **Node.js:** v18.0.0 or higher (Tested with Node v20+ and v24+)
- **npm:** v9.0.0 or higher
- **Git**

---

## 2. Installation Steps

### Step 1: Open Terminal or Command Prompt (`cmd`)
Open PowerShell, Terminal, or Command Prompt.

### Step 2: Navigate to the `busbridge` Directory
```bash
# If you are in the repository root:
cd busbridge

# On Windows cmd directly:
cd /d "d:\SWYNEX App Development Internship\busbridge"
```

### Step 3: Install Dependencies
```bash
npm install
```

---

## 3. Running the Application

### Development Server
Start Vite's local dev server with Hot Module Replacement:
```bash
npm run dev
```

Output:
```text
  VITE v5.4.10  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Open **`http://localhost:5173`** in your browser.

---

## 4. Building for Production

To create an optimized, code-split production bundle inside `/dist`:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 5. Verification & Testing

### Running Storage & Validation Test Suite
You can verify the Task 3 Saved Routes and Storage Validation engine anytime using Node:
```bash
node --input-type=module -e "
globalThis.window = { dispatchEvent: () => {}, localStorage: { _data: {}, getItem(k){return this._data[k]||null;}, setItem(k,v){this._data[k]=String(v);}, removeItem(k){delete this._data[k];} } };
globalThis.localStorage = globalThis.window.localStorage;
globalThis.CustomEvent = class {};
const { saveRoute, isRouteSaved, unsaveRoute, getLocalSaved } = await import('./src/services/savedRoutesService.js');
console.log('Running test...');
const res = await saveRoute({ from: 'Tambaram', to: 'Broadway', busNumber: '18A' });
console.assert(res.success === true, 'Save failed');
console.log('✅ Save Route Test Passed');
"
```

---

## 6. Troubleshooting Common Issues

| Issue | Cause | Solution |
|---|---|---|
| `npm error Missing script: "dev"` | Command was run outside the `busbridge` subfolder | Run `cd busbridge` first, then run `npm run dev` |
| `Leaflet map blank or tiles grey` | Leaflet CSS stylesheet not loaded | Verify internet connectivity to load OpenStreetMap tiles |
| `Geolocation denied error` | Browser blocked location permission | Use the **"Chennai Transit Anchors"** buttons on `/nearby` as a direct fallback |
| `Corrupted localStorage` | Malformed test string in browser storage | Clear browser cache or click **"Clear All"** on the Saved Routes page |
