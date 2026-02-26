window.addEventListener("DOMContentLoaded", async ()=>{
  const cfg = window.APP_CONFIG;

  const map = L.map("map", { zoomControl: true });
  map.setView(cfg.map.initialView.center, cfg.map.initialView.zoom);

  // basemaps
  const basemaps = buildBasemaps();
  window.__currentBasemap = basemaps.osm.addTo(map);

  // Build UI shell first
  renderLayerPanel();
  renderLegend();
  bindSidebarControls(map, basemaps);

  // Load overlay layers
  await buildOverlaysFromConfig();

  // Bind toggles and default layers
  bindLayerToggles(map);

  setInfo("✅ Map is ready. Click a polygon area to see a monthly chart.");
});
