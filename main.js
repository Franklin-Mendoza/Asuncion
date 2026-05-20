/* ================================================================
   LA GRAN ASUNCIÓN — main.js  (Spotify-style player + expanded videos)
   ================================================================ */

/* ── Tracks ── */
const tracks = [
  { name: "Cumbia Boliviana",    artist: "La Gran Asunción", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", icon: "fa-drum",      dur: "3:24" },
  { name: "Fuego Dorado",        artist: "La Gran Asunción", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", icon: "fa-fire",      dur: "4:01" },
  { name: "Noche Boliviana",     artist: "La Gran Asunción", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", icon: "fa-moon",      dur: "3:47" },
  { name: "Amor de Carnaval",    artist: "La Gran Asunción", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", icon: "fa-star",      dur: "3:55" },
  { name: "Bolivia en el Alma",  artist: "La Gran Asunción", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", icon: "fa-heart",     dur: "4:12" },
];

/* ── Conciertos ── */
const concertsData = {
  bolivia: [
    { day:"15", month:"JUN", city:"La Paz, Bolivia",     venue:"Teatro Municipal",       tag:"Confirmado" },
    { day:"28", month:"JUN", city:"Cochabamba, Bolivia", venue:"Plaza Principal",         tag:"Entradas disponibles" },
    { day:"12", month:"JUL", city:"Santa Cruz, Bolivia", venue:"Estadio Ramón Tahuichi", tag:"Últimas entradas" }
  ],
  paraguay: [
    { day:"20", month:"JUN", city:"Asunción, Paraguay",  venue:"Teatro del Lago",        tag:"Confirmado" },
    { day:"05", month:"JUL", city:"Ciudad del Este",     venue:"Centro de Convenciones", tag:"Entradas disponibles" },
    { day:"18", month:"JUL", city:"Encarnación",         venue:"Anfiteatro Municipal",   tag:"Próximamente" }
  ]
};

/* ── Estado ── */
let currentTrack   = 0;
let currentCountry = "bolivia";
let isPlaying      = false;
let isShuffle      = false;
let isRepeat       = false;
let isLiked        = false;

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  initHeroParticles();
  initSpotifyPlayer();
  buildSpotifyPlaylist();
  buildConcerts("bolivia");
  initCountrySwitch();
  initVideoCards();
  initContactForm();
  initSmoothScroll();
  initScrollReveal();
  initMobileMenu();
});

/* ================================================================
   PARTÍCULAS DEL HERO
================================================================ */
function initHeroParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const span = document.createElement("span");
    span.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-delay:${Math.random()*4}s;
      animation-duration:${2+Math.random()*3}s;
      opacity:${0.3+Math.random()*0.7};
      width:${2+Math.random()*3}px;
      height:${2+Math.random()*3}px;
    `;
    container.appendChild(span);
  }
}

/* ================================================================
   REPRODUCTOR SPOTIFY
================================================================ */
function initSpotifyPlayer() {
  const audio        = document.getElementById("audioPlayer");
  const playBtn      = document.getElementById("spPlay");
  const playIcon     = document.getElementById("spPlayIcon");
  const prevBtn      = document.getElementById("spPrev");
  const nextBtn      = document.getElementById("spNext");
  const shuffleBtn   = document.getElementById("spShuffle");
  const repeatBtn    = document.getElementById("spRepeat");
  const heartBtn     = document.getElementById("spHeart");
  const volSlider    = document.getElementById("spVolSlider");
  const volBtn       = document.getElementById("spVolBtn");
  const bar          = document.getElementById("spBar");
  const fill         = document.getElementById("spFill");
  const currentEl   = document.getElementById("spCurrentTime");
  const durEl        = document.getElementById("spDuration");
  const nameEl       = document.getElementById("spTrackName");
  const artistEl     = document.getElementById("spTrackArtist");
  const cover        = document.getElementById("spCover");
  const coverIcon    = document.getElementById("spCoverIcon");

  audio.volume = 0.7;
  loadTrack(currentTrack);

  function loadTrack(idx) {
    const t = tracks[idx];
    audio.src = t.url;
    nameEl.textContent   = t.name;
    artistEl.textContent = t.artist;
    coverIcon.className  = `fas ${t.icon}`;
    audio.load();
    fill.style.width  = "0%";
    currentEl.textContent = "0:00";
    durEl.textContent     = t.dur || "0:00";
    cover.classList.remove("spinning");
    updatePlaylistActive(idx);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => showToast("Haz clic de nuevo para reproducir"));
      playIcon.className = "fas fa-pause";
      cover.classList.add("spinning");
      isPlaying = true;
    } else {
      audio.pause();
      playIcon.className = "fas fa-play";
      cover.classList.remove("spinning");
      isPlaying = false;
    }
  }

  function fmtTime(s) {
    if (isNaN(s)) return "0:00";
    return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  }

  function goNext() {
    const wasPlaying = isPlaying;
    currentTrack = isShuffle
      ? Math.floor(Math.random() * tracks.length)
      : (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    if (wasPlaying) {
      audio.play().catch(()=>{});
      playIcon.className = "fas fa-pause";
      cover.classList.add("spinning");
    }
  }

  function goPrev() {
    const wasPlaying = isPlaying;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    if (wasPlaying) {
      audio.play().catch(()=>{});
      playIcon.className = "fas fa-pause";
      cover.classList.add("spinning");
    }
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
    currentEl.textContent = fmtTime(audio.currentTime);
    durEl.textContent     = fmtTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) { audio.currentTime = 0; audio.play(); return; }
    goNext();
    if (!isPlaying) return;
    audio.play().catch(()=>{});
    playIcon.className = "fas fa-pause";
    cover.classList.add("spinning");
  });

  bar.addEventListener("click", e => {
    const rect = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", goNext);
  prevBtn.addEventListener("click", goPrev);

  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "var(--spotify-green)" : "";
  });
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? "var(--spotify-green)" : "";
  });
  heartBtn.addEventListener("click", () => {
    isLiked = !isLiked;
    heartBtn.querySelector("i").className = isLiked ? "fas fa-heart" : "far fa-heart";
    heartBtn.style.color = isLiked ? "var(--spotify-green)" : "";
    showToast(isLiked ? "❤️ Añadido a tus Me gusta" : "💔 Eliminado de tus Me gusta");
  });

  volSlider.addEventListener("input", e => {
    audio.volume = e.target.value;
    volBtn.innerHTML = audio.volume == 0
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  });
  volBtn.addEventListener("click", () => {
    if (audio.volume > 0) { audio.volume=0; volSlider.value=0; volBtn.innerHTML='<i class="fas fa-volume-mute"></i>'; }
    else { audio.volume=0.7; volSlider.value=0.7; volBtn.innerHTML='<i class="fas fa-volume-up"></i>'; }
  });

  /* Exponer para playlist */
  window._spLoadTrack = (idx) => {
    const wasPlaying = isPlaying;
    currentTrack = idx;
    loadTrack(idx);
    if (wasPlaying) { audio.play().catch(()=>{}); playIcon.className="fas fa-pause"; cover.classList.add("spinning"); }
    else { togglePlay(); }
  };
}

/* ── Playlist Spotify ── */
function buildSpotifyPlaylist() {
  const container = document.getElementById("spTracks");
  if (!container) return;
  tracks.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "sp-track-row" + (i===0?" active":"");
    row.innerHTML = `
      <span class="sp-track-num">${i+1}</span>
      <div class="sp-track-eq"><span></span><span></span><span></span></div>
      <div class="sp-track-row-info">
        <div class="sp-track-row-name">${t.name}</div>
        <div class="sp-track-row-artist">${t.artist}</div>
      </div>
      <span class="sp-track-dur">${t.dur}</span>
    `;
    row.addEventListener("click", () => window._spLoadTrack(i));
    container.appendChild(row);
  });
}

function updatePlaylistActive(idx) {
  document.querySelectorAll(".sp-track-row").forEach((row, i) => {
    row.classList.toggle("active", i === idx);
  });
}

/* ================================================================
   CONCIERTOS
================================================================ */
function buildConcerts(country) {
  const grid = document.getElementById("concertsGrid");
  grid.innerHTML = concertsData[country].map(c => `
    <div class="concert-card reveal">
      <div class="concert-date-block">
        <div class="concert-day">${c.day}</div>
        <div class="concert-month">${c.month}</div>
      </div>
      <div class="concert-info">
        <h4>${c.city}</h4>
        <p>${c.venue}</p>
        <span class="concert-tag">${c.tag}</span>
      </div>
    </div>
  `).join("");
  observeReveal(grid.querySelectorAll(".reveal"));
}

/* ================================================================
   SELECTOR DE PAÍS
================================================================ */
function initCountrySwitch() {
  const heroSubtitle = document.getElementById("heroSubtitle");
  const heroDesc     = document.getElementById("heroDesc");
  const locationText = document.getElementById("locationText");

  const content = {
    bolivia: {
      subtitle: "Grupo Musical Boliviano",
      desc: "Desde Bolivia para el mundo — la fusión perfecta de cumbia y folklore boliviano con energía única que electriza cada escenario.",
      location: "La Paz / Cochabamba · Bolivia"
    },
    paraguay: {
      subtitle: "Gira Paraguay 2025",
      desc: "La Gran Asunción llega a Paraguay con todo su fuego y energía. Gira 2025 — noches que no olvidarás.",
      location: "Asunción, Paraguay · Gira 2025"
    }
  };

  document.querySelectorAll(".country-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = btn.dataset.country;
      if (c === currentCountry) return;
      currentCountry = c;
      document.querySelectorAll(".country-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const d = content[c];
      if (heroSubtitle) heroSubtitle.textContent = d.subtitle;
      if (heroDesc)     heroDesc.textContent     = d.desc;
      if (locationText) locationText.textContent  = d.location;
      buildConcerts(c);
      showToast(`${c==="bolivia"?"🇧🇴":"🇵🇾"} Vista cambiada a ${c==="bolivia"?"Bolivia":"Paraguay"}`);
    });
  });
}

/* ================================================================
   VIDEOS — Lazy embed con thumbnail
================================================================ */
function initVideoCards() {
  document.querySelectorAll("[data-vid]").forEach(card => {
    const vid   = card.dataset.vid;
    const thumb = card.querySelector(".video-thumb-wrap");
    const iframe= card.querySelector(".video-iframe-wrap");
    if (!thumb || !iframe) return;

    const img = thumb.querySelector("img");
    if (img) img.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

    thumb.addEventListener("click", () => {
      /* Detener otros videos */
      document.querySelectorAll(".video-iframe-wrap.active").forEach(el => {
        el.classList.remove("active");
        el.innerHTML = "";
        el.previousElementSibling.classList.remove("hidden");
      });
      thumb.classList.add("hidden");
      iframe.classList.add("active");
      iframe.innerHTML = `
        <iframe
          src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1"
          title="Video La Gran Asunción"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>`;
    });
  });
}

/* ================================================================
   CONTACTO
================================================================ */
function initContactForm() {
  const btn      = document.getElementById("sendMsgBtn");
  const feedback = document.getElementById("formFeedback");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const name  = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const msg   = document.getElementById("contactMsg").value.trim();
    if (!name || !email) {
      feedback.textContent = "Por favor completa nombre y correo electrónico.";
      feedback.style.color = "#E8A020";
      clearFeedback(feedback); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.textContent = "Ingresa un correo electrónico válido.";
      feedback.style.color = "#E8A020";
      clearFeedback(feedback); return;
    }
    feedback.textContent = `✓ ¡Gracias ${name}! Nos pondremos en contacto pronto.`;
    feedback.style.color = "#6FD96F";
    showToast(`Mensaje recibido de ${name} ✓`);
    document.getElementById("contactName").value  = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactMsg").value   = "";
    clearFeedback(feedback, 5000);
  });
}
function clearFeedback(el, delay=3500) { setTimeout(()=>{ el.textContent=""; },delay); }

/* ================================================================
   SMOOTH SCROLL
================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior:"smooth" });
    });
  });
}

/* ================================================================
   SCROLL REVEAL
================================================================ */
function observeReveal(elements) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.1 });
  elements.forEach(el => io.observe(el));
}

function initScrollReveal() {
  observeReveal(document.querySelectorAll(".reveal"));
}

/* ================================================================
   MENÚ MÓVIL
================================================================ */
function initMobileMenu() {
  const btn    = document.getElementById("menuBtn");
  const drawer = document.getElementById("mobileNav");
  if (!btn || !drawer) return;
  btn.addEventListener("click", () => {
    drawer.classList.toggle("open");
    btn.innerHTML = drawer.classList.contains("open")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });
  drawer.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      drawer.classList.remove("open");
      btn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

/* ================================================================
   TOAST
================================================================ */
function showToast(msg) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}
