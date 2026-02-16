async function loadData() {
  const r = await fetch(window.DATA_FILE, { cache: "no-store" });
  if (!r.ok) throw new Error("No se pudo cargar el JSON: " + window.DATA_FILE);
  return r.json();
}

function safe(v, fallback = "") {
  return v === undefined || v === null ? fallback : v;
}

function formatMoney(amount, currency) {
  const a = safe(amount, "");
  const c = safe(currency, "");
  if (a === "") return "";
  return `${c} ${a}`;
}

/* ========= OFFER HTML ========= */
function renderOfferHTML(data) {
  const o = data.offer || {};
  const buy = safe(data?.links?.buy, "#");

  const downloads = safe(o.downloadsText, "");
  const title = safe(o.title, "");
  const subtitle = safe(o.subtitle, "");

  const oldPrice = formatMoney(o.priceOld, o.currency);
  const newPrice = formatMoney(o.priceNew, o.currency);

  const badge = safe(o.badgeText, "");
  const urgency = safe(o.urgencyText, "");
  const viewing = safe(o.viewingText, "");

  const heroImg = safe(o.heroImage, "");

  const timerEnabled = !!o.timer?.enabled;
  const timerMinutes = Number(safe(o.timer?.minutes, 15));

  // Estructura del panel (similar a la referencia)
  return `
    <section class="offer-wrap">
      <div class="offer-grid">

        <div class="offer-left">
          ${heroImg ? `<img src="${heroImg}" alt="Producto">` : ""}
        </div>

        <div class="offer-right">
          ${downloads ? `<div class="small-muted">${downloads}</div>` : ""}

          ${title ? `<h1 class="offer-title">${title}</h1>` : ""}
          ${subtitle ? `<p class="offer-subtitle">${subtitle}</p>` : ""}

          <div class="price-row">
            ${oldPrice ? `<div class="price-old">${oldPrice}</div>` : ""}
            ${newPrice ? `<div class="price-new">${newPrice}</div>` : ""}
          </div>

          ${badge ? `<div class="badge">${badge}</div>` : ""}
          ${urgency ? `<div class="urgency">${urgency}</div>` : ""}

          <a class="add-cart" href="${buy}" target="_blank">COMPRA AHORA</a>

          ${viewing ? `<div class="viewing">👁️ ${viewing}</div>` : ""}

          ${timerEnabled ? renderTimerHTML(o, buy) : ""}

          ${(o.guarantee?.title || o.guarantee?.text) ? `
            <div class="guarantee">
              ${o.guarantee?.title ? `<p class="guarantee-title">${o.guarantee.title}</p>` : ""}
              ${o.guarantee?.text ? `<p class="guarantee-text">${o.guarantee.text}</p>` : ""}
            </div>
          ` : ""}

        </div>
      </div>
    </section>
  `;
}

function renderTimerHTML(o, buy) {
  return `
    <div class="timer-box" id="timerBox">
      <p class="timer-title">${safe(o.timer?.title, "OFERTA SOLO POR HOY")}</p>
      <p class="timer-sub">${safe(o.timer?.subtitle, "Tu lugar estará reservado por 15 minutos")}</p>

      <div class="timer-row">
        <div class="time-pill">
          <div class="time-num" id="tMin">15</div>
          <div class="time-label">minutos</div>
        </div>
        <div class="time-pill">
          <div class="time-num" id="tSec">00</div>
          <div class="time-label">segundos</div>
        </div>
      </div>

      <a class="timer-cta" href="${buy}" target="_blank">
        ${safe(o.timer?.ctaText, "Aprovechar oferta")}
      </a>
    </div>
  `;
}

/* ========= COUNTDOWN ========= */
function getCountdownEnd(key, minutes) {
  const storageKey = `cd_${key}`;
  const existing = localStorage.getItem(storageKey);
  const now = Date.now();

  if (existing) {
    const end = parseInt(existing, 10);
    if (!Number.isNaN(end) && end > now) return end;
  }

  const end = now + minutes * 60 * 1000;
  localStorage.setItem(storageKey, String(end));
  return end;
}

function startCountdown(endMs, onTick) {
  const tick = () => {
    const left = Math.max(0, endMs - Date.now());
    const totalSec = Math.floor(left / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    onTick(min, sec, left);
    if (left <= 0) clearInterval(int);
  };

  tick();
  const int = setInterval(tick, 250);
  return int;
}

/* ========= RENDER IMAGES + INSERT OFFER BETWEEN 3 AND 4 ========= */
function renderImagesWithOffer(images, offerHTML, extraImages){
  const container = document.getElementById("images");
  container.innerHTML = "";

  (images || []).forEach((src, i) => {

    // imagen normal
    const img = document.createElement("img");
    img.src = src;
    container.appendChild(img);

    // 🔥 insertar OFFER después de la 3ra
    if(i === 2){
      const temp = document.createElement("div");
      temp.innerHTML = offerHTML.trim();
      container.appendChild(temp.firstElementChild);
    }
  });

  // 🔥 NUEVAS imágenes extra antes del FAQ
  (extraImages || []).forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    container.appendChild(img);
  });
}

/* ========= FAQ ACCORDION ========= */
function renderFAQ(faqs){
  const faq = document.getElementById("faq");
  if(!faq) return;

  faq.innerHTML = `
    <div class="faq-wrap">
      <h2>PREGUNTAS FRECUENTES</h2>
      <div class="faq-list" id="faqList"></div>
    </div>
  `;

  const list = document.getElementById("faqList");

  const iconSVG = `
    <svg fill="none" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
      <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5"/>
    </svg>
  `;

  (faqs || []).forEach((f)=>{
    const row = document.createElement("div");
    row.className = "faq-row";

    row.innerHTML = `
      <button class="faq-btn" type="button">
        <div class="faq-icon">${iconSVG}</div>
        <div class="faq-q">${f.q || ""}</div>
        <div class="faq-arrow">▾</div>
      </button>
      <div class="faq-a">${f.a || ""}</div>
    `;

    row.querySelector(".faq-btn").onclick = ()=>{
      row.classList.toggle("open");
    };

    list.appendChild(row);
  });
}


function renderBonuses(bonuses){
  const mount = document.getElementById("bonuses");
  if(!mount || !bonuses || !bonuses.length) return;

  mount.innerHTML = `
    <section class="bonuses-wrap">
      <div class="bonuses-grid" id="bonusesGrid"></div>
    </section>
  `;

  const grid = document.getElementById("bonusesGrid");

  bonuses.forEach((b)=>{
    const card = document.createElement("article");
    card.className = "bonusV";
    card.innerHTML = `
      <div class="bonusV-media">
        <img src="${b.image}" alt="">
        <div class="bonusV-tag">${b.tag || ""}</div>
        <div class="bonusV-overlay">
          <div class="bonusV-desc">${b.desc || ""}</div>
        </div>
      </div>
      <div class="bonusV-footer">${b.subtitle || ""}</div>
    `;

    // Soporte móvil: tap para toggle descripción
    card.addEventListener("click", ()=>{
      card.classList.toggle("isOpen");
      const overlay = card.querySelector(".bonusV-overlay");
      if(overlay){
        overlay.style.opacity = card.classList.contains("isOpen") ? "1" : "0";
      }
      const img = card.querySelector("img");
      if(img){
        img.style.filter = card.classList.contains("isOpen") ? "brightness(.82)" : "";
      }
    });

    grid.appendChild(card);
  });
}
function renderExtras(extraImages){
  const container = document.getElementById("extras");
  if(!container || !extraImages) return;

  container.innerHTML = "";

  extraImages.forEach(src=>{
    const img = document.createElement("img");
    img.src = src;
    container.appendChild(img);
  });
}

function renderWhatsApp(cfg){
  if(!cfg?.number) return;

  const link = `https://wa.me/${cfg.number}?text=${encodeURIComponent(cfg.message || "")}`;

  const btn = document.createElement("a");
  btn.href = link;
  btn.target = "_blank";
  btn.className = "whatsapp-float";

  btn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M20.5 3.5A11.8 11.8 0 0012.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.6 4.1 1.7 5.9L0 24l6.4-1.9a11.9 11.9 0 005.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.2-3.5-8.2zM12.1 21.5c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-3.8 1.1 1.1-3.7-.2-.4a9.6 9.6 0 01-1.5-5.1C2 6.6 6.6 2 12.1 2s10.1 4.6 10.1 10.1-4.6 10.4-10.1 10.4zm5.6-7.7c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1s-.8.9-1 .9c-.2 0-.4 0-.7-.2s-1.2-.4-2.2-1.4c-.8-.7-1.4-1.6-1.5-1.8-.1-.2 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6 0-.1-.7-1.6-.9-2.2-.2-.5-.4-.4-.7-.4h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 3 .9 3.5 1 3.7c.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.1.1-1.3-.1-.2-.3-.2-.6-.3z"/>
    </svg>
  `;

  document.body.appendChild(btn);
}
function renderExtraButtons(buttons, buyLink){
  if(!buttons) return;

  buttons.forEach(btn=>{
    const wrap = document.createElement("div");
    wrap.className = "extra-btn-wrap";

    wrap.innerHTML = `
      <a href="${buyLink}" target="_blank" class="buy-animated">
        ${btn.text}
      </a>
    `;

    // 🔥 después de la primera imagen
    if(btn.position === "beforeOffer"){
      const imagesContainer = document.getElementById("images");
      const firstImg = imagesContainer.querySelector("img");
      if(firstImg) firstImg.after(wrap);
    }

    // 🔥 antes del FAQ
    if(btn.position === "beforeFAQ"){
      document.getElementById("faq").before(wrap);
    }
  });
}

/* ========= INIT ========= */
(async () => {
  const data = await loadData();

  document.title = data?.meta?.title || "El Club del Café";

  const offerHTML = renderOfferHTML(data);

  // principales + offer
  renderImagesWithOffer(data.images, offerHTML);

  // 🔥 extras después
  renderExtras(data.extraImages);

  // 3) Activar contador si está enabled
  const timerEnabled = !!data?.offer?.timer?.enabled;
  if (timerEnabled) {
    const key = safe(data?.offer?.timer?.key, "club-cafe");
    const minutes = Number(safe(data?.offer?.timer?.minutes, 15));
    const end = getCountdownEnd(key, minutes);

    startCountdown(end, (m, s) => {
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");

      const minEl = document.getElementById("tMin");
      const secEl = document.getElementById("tSec");

      if (minEl) minEl.textContent = mm;
      if (secEl) secEl.textContent = ss;
    });
  }

  // 4) FAQ
  renderFAQ(data.faq);
  renderBonuses(data.bonuses);
  renderExtraButtons(data.extraButtons, data.links.buy);
  renderWhatsApp(data.whatsapp);
})();

/* =========================
   FACEBOOK PIXEL - HOTMART CLICK
========================= */

let __fb_hotmart_lock = false;

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const url = link.getAttribute("href") || "";

  // detecta Hotmart (incluye pay.hotmart.com)
  if (!/hotmart\.com|pay\.hotmart\.com/i.test(url)) return;

  // anti doble-click
  if (__fb_hotmart_lock) return;
  __fb_hotmart_lock = true;
  setTimeout(() => { __fb_hotmart_lock = false; }, 1200);

  try {
    if (window.fbq) {
      fbq("track", "InitiateCheckout", {
        content_name: document.title || "Producto",
        source: "landing"
      });
    }
  } catch (err) {}
});
