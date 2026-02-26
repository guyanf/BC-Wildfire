function makeSection(title){
  const wrap = document.createElement("div");
  wrap.className = "section";

  const head = document.createElement("div");
  head.className = "section__head";
  head.innerHTML = `<div class="section__title">${escapeHTML(title)}</div><div style="opacity:.7">▾</div>`;

  const body = document.createElement("div");
  body.className = "section__body";

  head.addEventListener("click", ()=>{
    wrap.classList.toggle("collapsed");
  });

  wrap.appendChild(head);
  wrap.appendChild(body);
  return { wrap, body };
}

function renderLayerPanel(){
  const cfg = window.APP_CONFIG;
  const panel = $("layerPanel");
  panel.innerHTML = "";

  for(const menu of (cfg.menus || [])){
    const { wrap, body } = makeSection(menu.title);

    for(const meta of (menu.layers || [])){
      const row = document.createElement("label");
      row.className = "toggle";
      row.innerHTML = `<input type="checkbox" id="tog_${meta.id}" /> <span>${escapeHTML(meta.label)}</span>`;
      body.appendChild(row);
    }

    panel.appendChild(wrap);
  }
}

function renderLegend(){
  const legend = $("legendPanel");
  legend.innerHTML = "";

  const items = [];
  for(const menu of (window.APP_CONFIG.menus || [])){
    for(const meta of (menu.layers || [])){
      if(meta.legend) items.push(meta.legend);
    }
  }

  for(const it of items){
    const div = document.createElement("div");
    div.className = "legendItem";
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = it.swatch || "#999";
    div.appendChild(sw);
    const txt = document.createElement("div");
    txt.textContent = it.label || "Legend";
    div.appendChild(txt);
    legend.appendChild(div);
  }
}

function bindSidebarControls(map, basemaps){
  // Collapse/expand
  $("btnCollapse").addEventListener("click", ()=>{
    $("sidebar").classList.add("collapsed");
    $("btnExpand").style.display = "inline-flex";
  });
  $("btnExpand").addEventListener("click", ()=>{
    $("sidebar").classList.remove("collapsed");
    $("btnExpand").style.display = "none";
  });

  // Basemap switch
  const sel = $("basemapSelect");
  sel.addEventListener("change", ()=>{
    if(window.__currentBasemap) map.removeLayer(window.__currentBasemap);
    window.__currentBasemap = basemaps[sel.value] || basemaps.osm;
    window.__currentBasemap.addTo(map);
  });

  // Zoom/reset
  $("btnZoomBC").addEventListener("click", ()=>{
    const v = window.APP_CONFIG.map.bcView;
    map.setView(v.center, v.zoom);
  });
  $("btnResetView").addEventListener("click", ()=>{
    const v = window.APP_CONFIG.map.resetView;
    map.setView(v.center, v.zoom);
  });

  // Clear
  $("btnClear").addEventListener("click", ()=>{
    $("searchBox").value = "";
    clearSearchFilter(map);
    setInfo("Cleared.");
  });

  // Search
  $("searchBox").addEventListener("input", debounce(()=>{
    const q = $("searchBox").value.trim();
    applySearchFilter(map, q);
  }, 250));
}

function bindLayerToggles(map){
  for(const layerId of Object.keys(window.LAYER_REGISTRY)){
    const { layer, meta } = window.LAYER_REGISTRY[layerId];
    const tog = $("tog_" + layerId);
    if(!tog) continue;

    // default on
    tog.checked = !!meta.defaultOn;
    if(tog.checked) layer.addTo(map);

    tog.addEventListener("change", ()=>{
      if(tog.checked) layer.addTo(map);
      else map.removeLayer(layer);
    });
  }
}

function applySearchFilter(map, query){
  if(!query){
    clearSearchFilter(map);
    setStatus("Ready.");
    return;
  }
  const q = query.toLowerCase();
  let found = 0;
  let firstBounds = null;

  for(const key of Object.keys(window.LAYER_REGISTRY)){
    const { layer } = window.LAYER_REGISTRY[key];

    // For cluster groups, drill down to child layer if possible
    const target = (layer.getLayers ? layer : null);

    // We will set style opacity or remove? easiest: bring matches to front and open popup on first.
    if(layer.eachLayer){
      layer.eachLayer((lyr)=>{
        if(lyr.feature && lyr.feature.properties){
          const p = lyr.feature.properties;
          const hay = (p.incident_name || p.name || p.id || "").toString().toLowerCase();
          const match = hay.includes(q);
          if(match){
            found++;
            if(lyr.getBounds && !firstBounds) firstBounds = lyr.getBounds();
            if(lyr.getLatLng && !firstBounds) firstBounds = L.latLngBounds([lyr.getLatLng(), lyr.getLatLng()]);
            // highlight
            if(lyr.setStyle) lyr.setStyle({ weight: 3, fillOpacity: 0.8 });
          } else {
            // dim
            if(lyr.setStyle) lyr.setStyle({ weight: 1, fillOpacity: 0.12 });
          }
        }
      });
    }
  }

  if(firstBounds){
    map.fitBounds(firstBounds.pad(0.6));
  }
  setStatus(found ? `Found: ${found}` : "No matches");
}

function clearSearchFilter(map){
  for(const key of Object.keys(window.LAYER_REGISTRY)){
    const { layer, meta } = window.LAYER_REGISTRY[key];
    // reset styles for geojson layers (not cluster)
    if(layer.eachLayer && meta.renderer && meta.renderer.kind === "polygon"){
      layer.setStyle({ weight: meta.renderer.weight ?? 1, fillOpacity: meta.renderer.fillOpacity ?? 0.12 });
    }
    if(layer.eachLayer && meta.renderer && meta.renderer.kind === "circle"){
      // circle markers are styles per marker
      layer.eachLayer((lyr)=>{
        if(lyr.setStyle) lyr.setStyle({ weight: 1, fillOpacity: meta.renderer.fillOpacity ?? 0.6 });
      });
    }
  }
}

window.renderLayerPanel = renderLayerPanel;
window.renderLegend = renderLegend;
window.bindSidebarControls = bindSidebarControls;
window.bindLayerToggles = bindLayerToggles;
