function monthlyDataFromFeature(feature){
  // Expect properties.monthly_counts as array length 12, or fallback demo data
  const p = feature.properties || {};
  const arr = p.monthly_counts;
  if(Array.isArray(arr) && arr.length === 12) return arr.map(n=>Number(n)||0);

  // demo fallback
  const seed = (p.code || p.name || "x").toString().length;
  const out = [];
  for(let i=0;i<12;i++){
    out.push(Math.max(0, Math.round((Math.sin((i+1)*0.7 + seed)*6) + 7 + (i%3))));
  }
  return out;
}

// keep a reference to the last chart so we can destroy it before
// creating a new one.  failing to destroy Chart.js instances is the
// root cause of the runaway y‑axis / memory leak when the popup is
// opened repeatedly.
let _lastMonthlyChart = null;
let _lastPopupChart = null;

function showMonthlyChart(feature, leafletLayer){
  const p = feature.properties || {};
  const name = escapeHTML(p.name ?? "Fire Area");
  const code = escapeHTML(p.code ?? "");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = monthlyDataFromFeature(feature);

  // Create separate canvas IDs for sidebar and popup
  const sidebarCanvasId = "chart_sidebar_" + Math.random().toString(16).slice(2);
  const popupCanvasId = "chart_popup_" + Math.random().toString(16).slice(2);
  
  const sidebarHtml = `
    <div style="min-width:260px;">
      <div style="font-weight:800;margin-bottom:6px">${name}</div>
      <div style="opacity:.7;margin-bottom:10px">Code: <b>${code}</b></div>
      <canvas id="${sidebarCanvasId}" style="width:100%;height:160px"></canvas>
      <div style="opacity:.7;font-size:12px;margin-top:8px">Monthly fire counts (demo or your real stats2222).</div>
    </div>
  `;

  const popupHtml = `
    <div style="min-width:260px;">
      <div style="font-weight:800;margin-bottom:6px">${name}</div>
      <div style="opacity:.7;margin-bottom:10px">Code: <b>${code}</b></div>
      <canvas id="${popupCanvasId}" style="width:100%;height:160px"></canvas>
      <div style="opacity:.7;font-size:12px;margin-top:8px">Monthly fire counts (demo or your real stats).</div>
    </div>
  `;

  // Put into sidebar info
  setInfo(sidebarHtml);

  // Helper function to render chart for sidebar
  const renderSidebarChart = ()=> {
    const el = document.getElementById(sidebarCanvasId);
    if(!el) return;
    const ctx = el.getContext("2d");

    // destroy existing chart instance if present
    if(_lastMonthlyChart){
      try{ _lastMonthlyChart.destroy(); }catch(e){ /* ignore */ }
      _lastMonthlyChart = null;
    }

    // Ensure data is valid array with numbers
    const validData = Array.isArray(data) ? data.map(v => {
      const num = Number(v);
      return isFinite(num) ? num : 0;
    }) : [];

    _lastMonthlyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Fires",
          data: validData
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  };

  // Helper function to render chart for popup
  const renderPopupChart = ()=> {
    const el = document.getElementById(popupCanvasId);
    if(!el) return;
    const ctx = el.getContext("2d");

    // destroy existing popup chart instance if present
    if(_lastPopupChart){
      try{ _lastPopupChart.destroy(); }catch(e){ /* ignore */ }
      _lastPopupChart = null;
    }

    // Ensure data is valid array with numbers
    const validData = Array.isArray(data) ? data.map(v => {
      const num = Number(v);
      return isFinite(num) ? num : 0;
    }) : [];

    _lastPopupChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Fires",
          data: validData
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  };

  // Render chart in sidebar immediately
  setTimeout(renderSidebarChart, 60);

  // Also open popup on map and render chart when popup opens
  const popup = leafletLayer.bindPopup(popupHtml);
  
  // Listen to popupadd event which fires when popup is added to DOM
  popup.on('popupadd', ()=> {
    // Wait for popup DOM to fully render before drawing chart
    setTimeout(renderPopupChart, 150);
  });
  
  // Also try popupopen event as fallback
  popup.on('popupopen', ()=> {
    setTimeout(renderPopupChart, 150);
  });
  
  popup.openPopup();
}

window.showMonthlyChart = showMonthlyChart;
