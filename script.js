/* =====================================================
   Portfolio – Faizan Khan
   Edit CONFIG below to change contact details & links.
   ===================================================== */
const CONFIG = {
  phoneIntl: "919671636548",              // country code + number, no "+" or spaces
  email: "mrfaizan023@gmail.com",
  linkedin: "https://www.linkedin.com/in/faizan05/",
  // Optional overrides. Leave "" to keep the defaults already in index.html.
  // Add a "live" URL and the Live demo button appears on that project card.
  projects: {
    sql:      { code: "", live: "" },
    travel:   { code: "", live: "" },
    goyatrik: { code: "", live: "" },
    chat:     { code: "", live: "" }
  }
};

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------- WhatsApp links (prefilled message) ---------- */
$$("[data-wa]").forEach(a => {
  a.href = `https://wa.me/${CONFIG.phoneIntl}?text=${encodeURIComponent(a.dataset.wa)}`;
});

/* ---------- Project links from CONFIG ---------- */
$$("[data-proj]").forEach(a => {
  const url = (CONFIG.projects[a.dataset.proj] || {})[a.dataset.kind];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
});

/* ---------- Year ---------- */
$("#year").textContent = new Date().getFullYear();

/* ---------- Theme ---------- */
const themeBtn = $("#themeBtn");
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.innerHTML = t === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  store.set("theme", t);
  if (window.__flowColors) window.__flowColors();
}
setTheme(store.get("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

/* ---------- Mobile menu ---------- */
const burger = $("#burger"), links = $("#links");
function toggleMenu(open) {
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
}
burger.addEventListener("click", () => toggleMenu(!links.classList.contains("open")));
links.addEventListener("click", e => { if (e.target.closest("a")) toggleMenu(false); });

/* ---------- Scroll: progress bar, nav shadow ---------- */
const bar = $("#progress"), nav = $("#nav");
function onScroll() {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  nav.classList.toggle("scrolled", h.scrollTop > 10);
}
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- Scroll spy ---------- */
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$(".links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- Reveal on scroll ---------- */
const rev = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); }
}), { threshold: .12 });
$$(".reveal").forEach(el => rev.observe(el));

/* ---------- KPI count-up ---------- */
const countObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, to = +el.dataset.count, dur = 1400, t0 = performance.now();
  countObs.unobserve(el);
  if (reduceMotion) { el.textContent = to; return; }
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: .6 });
$$("[data-count]").forEach(el => countObs.observe(el));

/* ---------- Hero SQL console (typing + result) ---------- */
(function sqlConsole() {
  const code = $("#code"), result = $("#result"), run = $("#runBtn");
  const parts = [
    ["# Who should build your next AI agent?\n", "c"],
    ["agent", ""], [" = "], ["RAGAgent", "f"], ["(\n"],
    ["    llm="], ['"OpenAI API"', "s"], [",\n"],
    ["    vector_db="], ['"Pinecone"', "s"], [",\n"],
    ["    automation="], ['"n8n"', "s"], ["\n)\n"],
    ["agent", ""], [".ask("], ['"Who should we hire?"', "s"], [")"]
  ];
  const chars = parts.flatMap(([t, c]) => [...t].map(ch => [ch, c || ""]));
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function render(n, caret) {
    let html = "", cls = null, buf = "";
    const flush = () => { if (buf) html += cls ? `<span class="${cls}">${esc(buf)}</span>` : esc(buf); buf = ""; };
    for (let i = 0; i < n; i++) { const [ch, c] = chars[i]; if (c !== cls) { flush(); cls = c; } buf += ch; }
    flush();
    code.innerHTML = html + (caret ? '<span class="caret"></span>' : "");
  }
  let timer, busy = false;
  function play() {
    if (busy) return; busy = true; result.hidden = true; clearInterval(timer);
    if (reduceMotion) { render(chars.length); result.hidden = false; busy = false; return; }
    let i = 0;
    timer = setInterval(() => {
      i++; render(i, true);
      if (i >= chars.length) { clearInterval(timer); render(i, false); setTimeout(() => { result.hidden = false; busy = false; }, 350); }
    }, 18);
  }
  run.addEventListener("click", play);
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setTimeout(play, 500); o.disconnect(); } }, { threshold: .3 }).observe($("#console"));
})();

/* ---------- Hero flowing data lines (canvas) ---------- */
(function flow() {
  const cv = $("#flow"), ctx = cv.getContext("2d");
  let w, h, dpr, strands = [], running = true, mx = 0, colors = ["#2557e8", "#0f9d9d", "#f2b134"];
  window.__flowColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = [s.getPropertyValue("--blue").trim(), s.getPropertyValue("--teal").trim(), s.getPropertyValue("--amber").trim()];
  };
  window.__flowColors();
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect(); w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = w < 600 ? 12 : 26;
    strands = Array.from({ length: n }, (_, i) => ({
      y: .08 + (i / n) * .84, amp: 14 + Math.random() * 46, f: .003 + Math.random() * .004,
      ph: Math.random() * 6.28, sp: .25 + Math.random() * .5, col: i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      dot: Math.random(), dv: .0009 + Math.random() * .0016
    }));
  }
  const yAt = (s, x, t) => s.y * h + Math.sin(x * s.f + t * s.sp + s.ph) * s.amp + Math.sin(x * s.f * 2.3 - t * .4) * s.amp * .35 + mx * (s.y - .5) * 24;
  function frame(ms) {
    if (!running) return;
    const t = ms / 1000; ctx.clearRect(0, 0, w, h);
    for (const s of strands) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) { const y = yAt(s, x, t); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = colors[s.col]; ctx.globalAlpha = .16; ctx.lineWidth = 1.2; ctx.stroke();
      s.dot = (s.dot + s.dv) % 1; const dx = s.dot * w;
      ctx.globalAlpha = .75; ctx.fillStyle = colors[s.col]; ctx.beginPath(); ctx.arc(dx, yAt(s, dx, t), 2.6, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  size(); addEventListener("resize", size);
  addEventListener("mousemove", e => { mx = e.clientX / innerWidth - .5; }, { passive: true });
  new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    if (vis && !running) { running = true; requestAnimationFrame(frame); } else if (!vis) running = false;
  }).observe(cv);
  requestAnimationFrame(frame);
})();

/* ---------- About tabs ---------- */
(function aboutTabs() {
  const info = {
    rag:   ["RAG agents", "Production agents that retrieve answers from a vectorized knowledge base using Pinecone, OpenAI, LangChain and Azure AI Foundry."],
    auto:  ["Automation with n8n", "Web scraping, data extraction, embeddings, lead capture, Gmail notifications and webhook-driven workflows that run on their own."],
    llm:   ["LLM apps", "Chatbots and LLM applications with prompt engineering, plus natural-language tools like a Gemini-powered Text-to-SQL app."],
    web:   ["Full stack", "React.js, Next.js, Node.js, Express and MongoDB apps with REST APIs, JWT auth and real-time WebSocket messaging."],
    cloud: ["Cloud", "AutoAI pipelines and AI services on IBM Cloud, agents on Microsoft Azure AI Foundry, and deployments on Vercel and Supabase."]
  };
  const panel = $("#tabpanel"), tabs = $$("[data-tab]");
  function show(k) {
    tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === k));
    panel.innerHTML = `<b>${info[k][0]}</b><br><span>${info[k][1]}</span>`;
    panel.style.animation = "none"; panel.offsetHeight; panel.style.animation = "";
  }
  tabs.forEach(t => t.addEventListener("click", () => show(t.dataset.tab)));
  show("rag");
})();

/* ---------- Filters (skills & projects) ---------- */
function bindFilter(barSel, itemSel) {
  const buttons = $$(`${barSel} button`);
  buttons.forEach(b => b.addEventListener("click", () => {
    buttons.forEach(x => x.classList.toggle("on", x === b));
    $$(itemSel).forEach(it => {
      const show = b.dataset.f === "all" || it.dataset.g === b.dataset.f;
      it.classList.toggle("out", !show);
      if (show) { it.classList.remove("pop"); it.offsetWidth; it.classList.add("pop"); }
    });
  }));
}
bindFilter("#skillFilters", "#skillGrid .skill");
bindFilter("#projFilters", "#projGrid .proj");

/* ---------- Certifications ---------- */
const CERTS = [
  { icon: "fa-brain", title: "AI & Cloud Technologies", org: "IBM | Edunet Foundation" },
  { icon: "fa-code", title: "Front-End Web Development", org: "IBM | Edunet Foundation" },
  { icon: "fa-layer-group", title: "Full Stack Web Development (MERN & Next.js)", org: "Full stack program" },
  { icon: "fa-robot", title: "Generative AI with Python", org: "TudeDude" },
  { icon: "fa-microchip", title: "AI/ML Engineer Foundation", org: "Reliance Foundation" },
  { icon: "fa-cloud", title: "Oracle Cloud Database Services", org: "Oracle University" }
];
$("#certGrid").innerHTML = CERTS.map(c => `
  <article class="cert-card reveal"><i class="fa-solid ${c.icon}"></i><div><h3>${c.title}</h3><p>${c.org}</p></div></article>`).join("");
$$("#certGrid .reveal").forEach(el => rev.observe(el));

/* ---------- Portrait fallback (monogram if no photo yet) ---------- */
(function portrait() {
  const img = $("#portraitImg");
  const swap = () => { const d = document.createElement("div"); d.className = "avatar"; d.textContent = "FK"; d.setAttribute("role", "img"); d.setAttribute("aria-label", "Faizan Khan"); img.replaceWith(d); };
  if (img.complete && img.naturalWidth === 0) swap(); else img.addEventListener("error", swap);
})();

/* ---------- Contact: copy email + form ---------- */
$("#copyMail").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(CONFIG.email); toast("Email address copied"); }
  catch { toast(CONFIG.email); }
});

const form = $("#contactForm"), err = $("#formErr");
form.addEventListener("submit", e => {
  e.preventDefault();
  const f = { name: $("#fName"), email: $("#fEmail"), subject: $("#fSubject"), msg: $("#fMsg") };
  let bad = [];
  Object.values(f).forEach(i => i.classList.remove("bad"));
  if (!f.name.value.trim()) bad.push(f.name);
  if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) bad.push(f.email);
  if (!f.subject.value.trim()) bad.push(f.subject);
  if (!f.msg.value.trim()) bad.push(f.msg);
  if (bad.length) {
    bad.forEach(i => i.classList.add("bad")); bad[0].focus();
    err.textContent = "Please fill in every field and use a valid email address."; err.hidden = false; return;
  }
  err.hidden = true;
  const v = { n: f.name.value.trim(), e: f.email.value.trim(), s: f.subject.value.trim(), m: f.msg.value.trim() };
  if (e.submitter && e.submitter.dataset.via === "mail") {
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(v.s)}&body=${encodeURIComponent(`${v.m}\n\n– ${v.n} (${v.e})`)}`;
    toast("Opening your email app…");
  } else {
    const text = `Hello Faizan! 👋\n\n*Name:* ${v.n}\n*Email:* ${v.e}\n*Subject:* ${v.s}\n\n*Message:*\n${v.m}`;
    window.open(`https://wa.me/${CONFIG.phoneIntl}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    toast("Opening WhatsApp…");
  }
});
$$("#contactForm input, #contactForm textarea").forEach(i => i.addEventListener("input", () => i.classList.remove("bad")));
