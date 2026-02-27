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

function showMonthlyChart(feature, leafletLayer){
  const p = feature.properties || {};
  const name = escapeHTML(p.name ?? "Fire Area");
  const code = escapeHTML(p.code ?? "");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = monthlyDataFromFeature(feature);

  const canvasId = "chart_" + Math.random().toString(16).slice(2);
  const html = `
    <div style="min-width:260px;">
      <div style="font-weight:800;margin-bottom:6px">${name}</div>
      <div style="opacity:.7;margin-bottom:10px">Code: <b>${code}</b></div>
      <!-- give the canvas a fixed height so the parent container can
           compute a stable size; prevents a resize loop that was
           stretching the y-axis indefinitely -->
      <canvas id="${canvasId}" style="width:100%;height:160px"></canvas>
      <div style="opacity:.7;font-size:12px;margin-top:8px">Monthly fire counts (demo or your real stats).</div>
    </div>
  `;

  // Put into sidebar info
  setInfo(html);

  // Also open popup on map
  leafletLayer.bindPopup(html).openPopup();

  // render chart after DOM update; first clean up any previous one
  setTimeout(()=>{
    const el = document.getElementById(canvasId);
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
        // don't let Chart.js try to resize the canvas – we keep the
        // canvas dimensions fixed via style attributes above
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }, 60);
}

window.showMonthlyChart = showMonthlyChart;
