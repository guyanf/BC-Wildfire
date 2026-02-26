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

function showMonthlyChart(feature, leafletLayer){
  const p = feature.properties || {};
  const name = escapeHTML(p.name ?? "Fire Area");
  const code = escapeHTML(p.code ?? "");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data = monthlyDataFromFeature(feature);

  const canvasId = "chart_" + Math.random().toString(16).slice(2);
  const html = `
    <div style="min-width:260px">
      <div style="font-weight:800;margin-bottom:6px">${name}</div>
      <div style="opacity:.7;margin-bottom:10px">Code: <b>${code}</b></div>
      <canvas id="${canvasId}" height="160"></canvas>
      <div style="opacity:.7;font-size:12px;margin-top:8px">Monthly fire counts (demo or your real stats).</div>
    </div>
  `;

  // Put into sidebar info
  setInfo(html);

  // Also open popup on map
  leafletLayer.bindPopup(html).openPopup();

  // Render chart after DOM update
  setTimeout(()=>{
    const el = document.getElementById(canvasId);
    if(!el) return;
    const ctx = el.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Fires",
          data
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }, 60);
}

window.showMonthlyChart = showMonthlyChart;
