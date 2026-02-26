window.LAYER_REGISTRY = {}; // id -> {layer, meta}

function buildBasemaps(){
  const cfg = window.APP_CONFIG.basemaps;
  const out = {};
  for(const key of Object.keys(cfg)){
    const b = cfg[key];
    out[key] = L.tileLayer(b.url, b.options || {});
  }
  return out;
}

function styleFromRenderer(renderer, feature){
  if(!renderer) return {};
  if(renderer.kind === "polygon"){
    return {
      weight: renderer.weight ?? 1,
      fillOpacity: renderer.fillOpacity ?? 0.1,
    };
  }
  return {};
}

function circleMarkerFromRenderer(renderer, feature, latlng){
  return L.circleMarker(latlng, {
    radius: renderer?.radius ?? 5,
    weight: 1,
    fillOpacity: renderer?.fillOpacity ?? 0.6,
  });
}

function buildPopupHTML(meta, props){
  const rows = (meta.popupFields || []).map(r => {
    const v = escapeHTML(props?.[r.field] ?? "");
    return `<div><span style="opacity:.7">${escapeHTML(r.label)}:</span> <b>${v}</b></div>`;
  }).join("");
  return `<div style="min-width:220px">${rows || "<div>No fields configured.</div>"}</div>`;
}

async function loadGeoJSONLayer(meta){
  const gj = await fetchJSON(meta.path);

  const renderer = meta.renderer || {};
  const isPoint = (gj.features || []).some(f => f.geometry && f.geometry.type && f.geometry.type.includes("Point"));

  // If points and cluster requested
  const wantsCluster = meta.label.toLowerCase().includes("cluster");

  if(isPoint && wantsCluster && L.markerClusterGroup){
    const cluster = L.markerClusterGroup();
    const layer = L.geoJSON(gj, {
      pointToLayer: (feature, latlng)=> circleMarkerFromRenderer(renderer, feature, latlng),
      onEachFeature: (feature, lyr)=> {
        const props = feature.properties || {};
        lyr.on("click", ()=> {
          setInfo(buildPopupHTML(meta, props));
        });
        lyr.bindPopup(buildPopupHTML(meta, props));
      }
    });
    cluster.addLayer(layer);
    return cluster;
  }

  const layer = L.geoJSON(gj, {
    style: (feature)=> styleFromRenderer(renderer, feature),
    pointToLayer: (feature, latlng)=> circleMarkerFromRenderer(renderer, feature, latlng),
    onEachFeature: (feature, lyr)=> {
      const props = feature.properties || {};
      lyr.on("click", ()=>{
        // custom click handler hook
        if(meta.onClick === "showMonthlyChart" && typeof window.showMonthlyChart === "function"){
          window.showMonthlyChart(feature, lyr);
        } else {
          setInfo(buildPopupHTML(meta, props));
        }
      });
      lyr.bindPopup(buildPopupHTML(meta, props));
    }
  });
  return layer;
}

async function buildOverlaysFromConfig(){
  const menus = window.APP_CONFIG.menus || [];
  const overlays = [];
  for(const menu of menus){
    for(const meta of (menu.layers || [])){
      overlays.push(meta);
    }
  }

  showLoading(true);
  setStatus("Loading layers...");
  try{
    for(const meta of overlays){
      const layer = await loadGeoJSONLayer(meta);
      window.LAYER_REGISTRY[meta.id] = { layer, meta };
    }
  } finally {
    showLoading(false);
    setStatus("Ready.");
  }
}
