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
  - if you switch to a non‑WGS84 projection (e.g. EPSG:3005) you can now load it directly; see note below
- Edit menus/layers/legend/popup fields in `js/config.js`



---

## Coordinate System / reprojection

Leaflet itself requires layers in geographic coordinates (EPSG:4326), but the
code now supports an optional `srcCrs` property on a layer entry. If you
convert a GeoJSON file to another projection (e.g. BC Albers **EPSG:3005**)
add a line like this to the layer config:

```json
"srcCrs": "EPSG:3005",
```

The app loads the proj4 library and will automatically reproject each vertex
back to 4326 as the file is fetched; no further changes are needed.

This repo includes **placeholder** GeoJSON so the app runs immediately.
