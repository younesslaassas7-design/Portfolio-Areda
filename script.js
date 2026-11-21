// ===============================
// 1. MEDIA CATALOG DATA
// ===============================

const officialAudios = [
  {
    title: "CHITANA (Official Audio)",
    subtitle: "Arida • Official Release",
    src: "assets/audio/Arida - CHITANA (Official Audio).mp3"
  },
  {
    title: "SEKRAN (Prod. By toumibeats)",
    subtitle: "Arida • Official Release",
    src: "assets/audio/ARIDA- SEKRAN (Official Music Video)  Prod.By toumibeats.mp3"
  }
];

const unreleasedTracks = [
  { title: "Shishan", src: "assets/unreleased/Arida - shishan.mp3" },
  { title: "9anass 2", src: "assets/unreleased/arida-9anass_2.mp3" },
  { title: "Gha Dikor", src: "assets/unreleased/gha dikor.mp3" },
  { title: "Gambri", src: "assets/unreleased/arida gambri.mp3" },
  { title: "Chaba", src: "assets/unreleased/chaba.mp3" },
  { title: "Arida ft. Floki ft. Dmox", src: "assets/unreleased/arida ft floki ft dmox.mp3" },
  { title: "Tla3 Liya Dam", src: "assets/unreleased/arida-tla3 liya dam.mp3" },
  { title: "La Guerre", src: "assets/unreleased/arida-la guerre.mp3" },
  { title: "Sosta", src: "assets/unreleased/sosta.mp3" },
  { title: "Ijram", src: "assets/unreleased/arida-ijram.mp3" },
  { title: "Ola La La", src: "assets/unreleased/ola la la.mp3" },
  { title: "Drari Mosiba", src: "assets/unreleased/arida-drari mosiba.mp3" },
  { title: "Macha Allah", src: "assets/unreleased/macha allah.mp3" }
];

const beatsTracks = [
  {
    title: "Arida Beat 109 (v2)",
    subtitle: "109 BPM • Free MP3 Download",
    src: "assets/beats/arida beat 109 2.mp3"
  },
  {
    title: "MPB 108 — D# Minor",
    subtitle: "108 BPM • Key: D# Minor • MP3 Download",
    src: "assets/beats/MPB 108 D shap minor.mp3"
  }
];

// ===============================
// 2. AUDIO ENGINE & PLAYER RENDERER
// ===============================

const globalAudio = document.getElementById("globalAudio");
const officialVideo = document.getElementById("officialVideo");
let activeCard = null;
let activeSrc = "";

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function createTrackCard(track, options = {}) {
  const { downloadable = true, isBeat = false, tagText = "Unreleased • Stream Only" } = options;

  const card = document.createElement("div");
  card.className = `track-card ${isBeat ? "beat-card" : ""}`;
  card.dataset.src = track.src;

  // Disable right-click on stream-only unreleased cards
  if (!downloadable) {
    card.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  const rightControl = downloadable
    ? `<a href="${encodeURI(track.src)}" download class="dl-btn"><i class="fa-solid fa-download"></i> MP3</a>`
    : `<span class="stream-badge"><i class="fa-solid fa-lock"></i> Stream Only</span>`;

  card.innerHTML = `
    <div class="track-top">
      <div class="track-left">
        <button class="play-btn" aria-label="Play ${track.title}">
          <i class="fa-solid fa-play"></i>
        </button>
        <div class="track-info">
          <div class="track-title" title="${track.title}">${track.title}</div>
          <div class="track-tag">${track.subtitle || tagText}</div>
        </div>
      </div>
      ${rightControl}
    </div>
    <div class="progress-wrap">
      <span class="time-label current-time">0:00</span>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <span class="time-label duration-time">--:--</span>
    </div>
  `;

  const playBtn = card.querySelector(".play-btn");
  const progressBar = card.querySelector(".progress-bar");

  playBtn.addEventListener("click", () => togglePlay(card, track.src));

  progressBar.addEventListener("click", (e) => {
    if (activeCard !== card || !globalAudio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    globalAudio.currentTime = ratio * globalAudio.duration;
  });

  return card;
}

function resetCardUI(card) {
  if (!card) return;
  card.classList.remove("playing");
  const icon = card.querySelector(".play-btn i");
  if (icon) icon.className = "fa-solid fa-play";
}

function togglePlay(card, src) {
  // Pause video if playing
  if (officialVideo && !officialVideo.paused) {
    officialVideo.pause();
  }

  const encodedSrc = encodeURI(src);

  if (activeCard === card && activeSrc === encodedSrc) {
    if (globalAudio.paused) {
      globalAudio.play();
      card.classList.add("playing");
      card.querySelector(".play-btn i").className = "fa-solid fa-pause";
    } else {
      globalAudio.pause();
      resetCardUI(card);
    }
    return;
  }

  // Switch to new track
  resetCardUI(activeCard);
  activeCard = card;
  activeSrc = encodedSrc;

  globalAudio.src = encodedSrc;
  globalAudio.play().catch((err) => {
    console.warn("Audio file not found yet:", src, err);
  });

  card.classList.add("playing");
  card.querySelector(".play-btn i").className = "fa-solid fa-pause";
}

globalAudio.addEventListener("timeupdate", () => {
  if (!activeCard || !globalAudio.duration) return;
  const pct = (globalAudio.currentTime / globalAudio.duration) * 100;
  activeCard.querySelector(".progress-fill").style.width = `${pct}%`;
  activeCard.querySelector(".current-time").textContent = formatTime(globalAudio.currentTime);
  activeCard.querySelector(".duration-time").textContent = formatTime(globalAudio.duration);
});

globalAudio.addEventListener("ended", () => {
  if (!activeCard) return;
  activeCard.querySelector(".progress-fill").style.width = "0%";
  activeCard.querySelector(".current-time").textContent = "0:00";
  resetCardUI(activeCard);
});

// Pause audio if user plays the music video
if (officialVideo) {
  officialVideo.addEventListener("play", () => {
    if (!globalAudio.paused) {
      globalAudio.pause();
      resetCardUI(activeCard);
    }
  });
}

// Render All Sections
const officialListEl = document.getElementById("officialAudioList");
officialAudios.forEach((t) =>
  officialListEl.appendChild(createTrackCard(t, { downloadable: true }))
);

const unreleasedListEl = document.getElementById("unreleasedList");
unreleasedTracks.forEach((t) =>
  unreleasedListEl.appendChild(
    createTrackCard(t, { downloadable: false, tagText: "Unreleased Vault • Exclusive" })
  )
);

const beatsListEl = document.getElementById("beatsList");
beatsTracks.forEach((t) =>
  beatsListEl.appendChild(createTrackCard(t, { downloadable: true, isBeat: true }))
);

// ===============================
// 3. WHATSAPP BOOKING FORM
// ===============================

const whatsappForm = document.getElementById("whatsappForm");
const ARIDA_WHATSAPP = "212784565123"; // 0784565123

whatsappForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("clientName").value.trim();
  const company = document.getElementById("clientCompany").value.trim() || "Individual / Independent";
  const contact = document.getElementById("clientPhone").value.trim();
  const service = document.getElementById("serviceType").value;
  const budget = document.getElementById("budgetRange").value;
  const deadline = document.getElementById("deadline").value.trim() || "Flexible";
  const details = document.getElementById("projectDetails").value.trim();

  const message =
    `🔥 *NEW BOOKING / COLLABORATION INQUIRY — ARIDA PORTFOLIO* 🔥\n\n` +
    `👤 *Client Name:* ${name}\n` +
    `🏢 *Brand / Company:* ${company}\n` +
    `📞 *Contact:* ${contact}\n` +
    `🎯 *Service Requested:* ${service}\n` +
    `💰 *Estimated Budget:* ${budget}\n` +
    `⏳ *Timeline:* ${deadline}\n\n` +
    `📝 *Project Details:*\n${details}`;

  const whatsappURL = `https://wa.me/${ARIDA_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank", "noopener");
});

// ===============================
// 4. MOBILE MENU & FOOTER YEAR
// ===============================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

document.getElementById("year").textContent = new Date().getFullYear();