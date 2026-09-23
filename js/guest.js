console.log("%c✧ ¡Bienvenidx a mi Guestbook! ✧", "color: #ff66aa; font-weight: bold; font-size: 20px;");

/* ========== AUDIO PLAYER ========== */
const audio = document.getElementById('bg-audio');
const btn = document.getElementById('play-pause-btn');
const likeBtn = document.getElementById('like-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volSlider = document.getElementById('volume-slider');
const progressFill = document.querySelector('.progress-fill');
const closeBtn = document.getElementById('close-btn');
const restoreBtn = document.getElementById('restore-btn');
const player = document.getElementById('draggable-player');
const playerHeader = document.getElementById('player-header');

if (audio) {
  audio.volume = 0.5;
  audio.preload = "auto";
}

if (audio && progressFill) {
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      progressFill.style.width = (audio.currentTime / audio.duration * 100) + "%";
    }
  });
}

if (btn && audio) {
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play()
        .then(() => btn.textContent = "❚❚")
        .catch(err => console.log("Play error:", err));
    } else {
      audio.pause();
      btn.textContent = "▶";
    }
  });
}

if (likeBtn) {
  likeBtn.addEventListener('click', () => {
    likeBtn.classList.toggle('liked');
    likeBtn.textContent = likeBtn.classList.contains('liked') ? "♥" : "♡";
  });
}

if (volSlider && audio) {
  volSlider.addEventListener('input', e => {
    audio.volume = e.target.value;
  });
}

if (closeBtn && player && restoreBtn) {
  closeBtn.addEventListener('click', () => {
    player.style.display = 'none';
    restoreBtn.style.display = 'flex';
  });
}

if (restoreBtn && player) {
  restoreBtn.addEventListener('click', () => {
    player.style.display = 'block';
    restoreBtn.style.display = 'none';
    translateX = 0;
    translateY = 0;
    player.style.transform = 'translate(0px, 0px)';
  });
}

/* ========== DRAG (transform-based → se queda fijo a la pantalla) ========== */
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

if (player && playerHeader) {
  playerHeader.style.cursor = "grab";

  playerHeader.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", dragMove);
  document.addEventListener("mouseup", dragEnd);

  playerHeader.addEventListener("touchstart", dragStart, { passive: false });
  document.addEventListener("touchmove", dragMove, { passive: false });
  document.addEventListener("touchend", dragEnd);

  function dragStart(e) {
    if (e.target.id === "close-btn" || e.target.closest("#close-btn")) return;

    isDragging = true;
    playerHeader.style.cursor = "grabbing";

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

    startX = clientX - translateX;
    startY = clientY - translateY;

    e.preventDefault();
  }

  function dragMove(e) {
    if (!isDragging) return;
    if (e.type === "touchmove") e.preventDefault();

    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;

    translateX = clientX - startX;
    translateY = clientY - startY;

    player.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    playerHeader.style.cursor = "grab";
  }
}

/* ========== GUESTBOOK — JSONP ========== */
const API = "https://script.google.com/macros/s/AKfycbwNMCVShoJcYUH36yjeCTfnqJqpp1ZSFUs2nPS0Me_msbwKLRKO5X_p7AIY-SedgQo/exec";
const PAGE = "guestbook";

function escapeHTML(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return "https://" + url;
}

function loadGuest() {
  const oldScript = document.getElementById("guest-loader");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.id = "guest-loader";
  script.src = API + "?page=" + PAGE + "&callback=showGuest";
  document.body.appendChild(script);
}

function showGuest(comments) {
  const box = document.getElementById("guest-list");
  const counter = document.getElementById("guest-count");

  if (counter) counter.textContent = comments.length;

  if (!comments.length) {
    box.innerHTML = `<p class="empty-msg">No messages yet ♡ be the first!</p>`;
    return;
  }

  box.innerHTML = "";

  [...comments].reverse().forEach(item => {
    const initial = (item.name || "?").trim().charAt(0).toUpperCase();
    const dateText = item.fecha ? new Date(item.fecha).toLocaleDateString() : "";

    const nameHTML = item.website
      ? `<a href="${escapeHTML(normalizeUrl(item.website))}" target="_blank" rel="noopener">${escapeHTML(item.name)}</a>`
      : escapeHTML(item.name);

    let tagsHTML = "";
    if (item.literaria) {
      tagsHTML += `<span class="g-tag">📖 ${escapeHTML(item.literaria)}</span>`;
    }
    if (item.musical) {
      tagsHTML += `<span class="g-tag">🎵 ${escapeHTML(item.musical)}</span>`;
    }

    const replyHTML = item.respuesta
      ? `
        <div class="guest-reply">
          <div class="guest-reply-header">
            <span class="id-icon">💌</span>
            <strong>Nanni's Reply</strong>
          </div>
          <div class="guest-reply-body">
            ${escapeHTML(item.respuesta)}
          </div>
          <div class="guest-reply-tag">✦ VERIFIED REPLY ✦</div>
        </div>
      `
      : "";

    box.innerHTML += `
      <div class="guest-card">
        <div class="guest-card-top">
          <div class="guest-avatar">${initial}</div>
          <div class="guest-user">
            <div class="guest-name">${nameHTML}</div>
            <span class="guest-date">${dateText}</span>
          </div>
        </div>
        ${tagsHTML ? `<div class="guest-tags">${tagsHTML}</div>` : ""}
        <p class="guest-message-text">${escapeHTML(item.mensaje)}</p>
        ${replyHTML}
      </div>
    `;
  });
}

function openPopup() {
  document.getElementById("guest-popup").classList.add("active");
}

function closePopup() {
  document.getElementById("guest-popup").classList.remove("active");
}

function sendGuest() {
  const name = document.getElementById("guest-name").value.trim();
  const website = document.getElementById("guest-website").value.trim();
  const literaria = document.getElementById("guest-literaria").value.trim();
  const musical = document.getElementById("guest-musical").value.trim();
  const mensaje = document.getElementById("guest-message").value.trim();

  if (!name || !mensaje) {
    alert("Please fill in your name and message ♡");
    return;
  }

  fetch(API, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
      page: PAGE,
      name: name,
      website: website,
      literaria: literaria,
      musical: musical,
      mensaje: mensaje
    })
  });

  document.getElementById("guest-name").value = "";
  document.getElementById("guest-website").value = "";
  document.getElementById("guest-literaria").value = "";
  document.getElementById("guest-musical").value = "";
  document.getElementById("guest-message").value = "";

  openPopup();
  setTimeout(loadGuest, 1500);
}

loadGuest();

/* ========== FORZAR PLAYER A LA ESQUINA DE LA PANTALLA (nunca al sitio) ========== */
function pinPlayerToViewport() {
  [player, restoreBtn].forEach(el => {
    if (!el) return;
    if (el.parentElement !== document.body) {
      document.body.appendChild(el);
    }
    el.style.position = "fixed";
    el.style.right = "25px";
    el.style.bottom = "25px";
    el.style.left = "auto";
    el.style.top = "auto";
  });
}

document.addEventListener('DOMContentLoaded', pinPlayerToViewport);
window.addEventListener('load', pinPlayerToViewport);
