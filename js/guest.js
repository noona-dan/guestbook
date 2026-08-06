// 1. Mensaje de bienvenida en consola
console.log("%c✧ ¡Bienvenidx a mi Guestbook! ✧", "color: #ff66aa; font-weight: bold; font-size: 20px;");

// 2. Selección de elementos (reproductor)
const audio = document.getElementById('bg-audio');
const btn = document.getElementById('play-pause-btn');
const likeBtn = document.getElementById('like-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volSlider = document.getElementById('volume-slider');
const progressFill = document.querySelector('.progress-fill');
const closeBtn = document.getElementById('close-btn');
const restoreBtn = document.getElementById('restore-btn');

const player = document.getElementById('draggable-player') || document.querySelector('.retro-player');
const playerHeader = document.getElementById('player-header') || document.querySelector('.player-drag');

// --- CONFIGURACIÓN DE AUDIO ---
if (audio) {
    audio.volume = 0.5;
    audio.preload = "auto";
}

// --- BARRA DE PROGRESO ---
if (audio && progressFill) {
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = pct + "%";
        }
    });
}

// --- LÓGICA PLAY/PAUSE (única forma de iniciar el audio) ---
if (btn && audio) {
    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                btn.textContent = "❚❚";
            }).catch(error => console.log("Error al reproducir: ", error));
        } else {
            audio.pause();
            btn.textContent = "▶";
        }
    });
}

// --- LIKE (cosmético) ---
if (likeBtn) {
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('liked');
        likeBtn.textContent = likeBtn.classList.contains('liked') ? "♥" : "♡";
    });
}

// --- PREVIOUS / NEXT (deshabilitados: solo una canción por ahora) ---
[prevBtn, nextBtn].forEach(b => {
    if (b) {
        b.addEventListener('click', () => {
            // reservado para cuando haya más de una canción
        });
    }
});

// --- Control de Volumen ---
if (volSlider && audio) {
    volSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// --- MINIMIZAR / RESTAURAR REPRODUCTOR ---
if (closeBtn && player && restoreBtn) {
    closeBtn.addEventListener('click', () => {
        player.style.display = 'none';
        restoreBtn.style.display = 'block';
    });
}

if (restoreBtn && player) {
    restoreBtn.addEventListener('click', () => {
        player.style.display = 'block';
        restoreBtn.style.display = 'none';

        const rect = player.getBoundingClientRect();
        if (rect.top < 0 || rect.left < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
            player.style.top = "auto";
            player.style.left = "auto";
            player.style.bottom = "20px";
            player.style.right = "20px";
        }
    });
}

// =========================================================================
// ARRASTRE PARA PC Y MÓVILES (DRAG & DROP)
// =========================================================================
if (player && playerHeader) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    playerHeader.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);

    playerHeader.addEventListener("touchstart", dragStart, { passive: false });
    document.addEventListener("touchmove", dragMove, { passive: false });
    document.addEventListener("touchend", dragEnd);

    function dragStart(e) {
        if (e.target.id === "close-btn") return;

        isDragging = true;

        const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        const rect = player.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        player.style.bottom = "auto";
        player.style.right = "auto";
        player.style.left = initialX + "px";
        player.style.top = initialY + "px";
    }

    function dragMove(e) {
        if (!isDragging) return;

        if (e.type === "touchmove") e.preventDefault();

        const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        player.style.left = (initialX + dx) + "px";
        player.style.top = (initialY + dy) + "px";
    }

    function dragEnd() {
        isDragging = false;
    }
}

// =========================================================================
// GUESTBOOK — JSONP (mismo patrón que tutoriales.html)
// =========================================================================

// ⚠️ Debe ser la MISMA URL de deployment que usas en tutoriales.html
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

// Agrega http:// si el usuario escribió solo "miweb.com"
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
            ? `<a href="${escapeHTML(normalizeUrl(item.website))}" target="_blank" rel="noopener">${escapeHTML(item.name)} 🔗</a>`
            : escapeHTML(item.name);

        let tagsHTML = "";
        if (item.literaria) {
            tagsHTML += `<span class="g-tag">📖 ${escapeHTML(item.literaria)}</span>`;
        }
        if (item.musical) {
            tagsHTML += `<span class="g-tag">🎵 ${escapeHTML(item.musical)}</span>`;
        }

        // Tarjeta de respuesta estilo "ID" (gafete)
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