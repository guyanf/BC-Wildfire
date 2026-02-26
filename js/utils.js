function $(id){return document.getElementById(id);}

function escapeHTML(s){
  return String(s ?? "").replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

function setStatus(msg){ const el=$("status"); if(el) el.textContent = msg; }

function setInfo(html){ const el=$("info"); if(el) el.innerHTML = html; }

async function fetchJSON(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to fetch: " + url);
  return await res.json();
}

function showLoading(on){
  const el = $("loading");
  if(!el) return;
  el.classList.toggle("hidden", !on);
}

function debounce(fn, ms=250){
  let t=null;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args), ms);
  };
}
