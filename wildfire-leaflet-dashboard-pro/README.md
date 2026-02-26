# Wildfire Leaflet Dashboard (Portfolio Template)

A **job-portfolio-ready** Leaflet template that works on **GitHub Pages** (no backend).

## Features
- Multi-section sidebar menu generated from `js/config.js`
- Basemap switcher
- Layer groups (Active / Boundaries / Historical)
- Legend panel
- Feature info panel
- Search filter (by name / id)
- Click a management area → show a **monthly chart** (Chart.js)
- Optional point clustering (Leaflet.markercluster)

## Run locally
Use a local web server (important because `fetch()` won’t work via file://):
- `python -m http.server 8000`
- Open `http://localhost:8000`

## Deploy to GitHub Pages
1. Create a GitHub repo and upload all files.
2. GitHub → **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`

## Customize
- Replace GeoJSON in `data/`
- Edit menus/layers/legend/popup fields in `js/config.js`

---
This repo includes **placeholder** GeoJSON so the app runs immediately.
