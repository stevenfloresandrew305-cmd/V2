/* Pag nag-refresh: laging bumalik sa pinakataas (Home / video), hindi sa dating scroll position */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();

  /* 1. Mobile menu */
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');
  const setMenu = open => {
    nav.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('active')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* 2. Highlight current section in nav */
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.setAttribute('aria-current', a.hash === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

  /* 3. 3D photo ring: always spinning; drag or arrow keys to turn it */
  const ring = document.getElementById('ring');
  const inner = document.getElementById('ringInner');
  let angle = 0, velocity = 0.3, dragging = false, lastX = 0;
  const render = () => { inner.style.transform = `rotateX(-10deg) rotateY(${angle}deg)`; };
  const tick = () => {
    if (!dragging) angle += velocity;
    render();
    requestAnimationFrame(tick);
  };
  ring.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; ring.setPointerCapture(e.pointerId); ring.classList.add('dragging'); });
  ring.addEventListener('pointermove', e => { if (dragging) { angle += (e.clientX - lastX) * 0.5; lastX = e.clientX; } });
  const end = () => { dragging = false; ring.classList.remove('dragging'); };
  ring.addEventListener('pointerup', end);
  ring.addEventListener('pointercancel', end);
  ring.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') angle -= 20;
    if (e.key === 'ArrowRight') angle += 20;
  });
  requestAnimationFrame(tick);

  /* 4. Infinite carousels */
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('p');
  const open = card => {
    const img = card.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = card.querySelector('figcaption')?.textContent || '';
    lightbox.showModal();
  };

  document.querySelectorAll('.track').forEach(track => {
    [...track.children].forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(i => i.alt = '');
      track.appendChild(clone);
    });
    if (track.id === 'memoriesTrack') {
      [...track.children].forEach(card => {
        if (card.getAttribute('aria-hidden') !== 'true') { card.tabIndex = 0; card.setAttribute('role', 'button'); }
      });
      track.addEventListener('click', e => { const c = e.target.closest('.card-item'); if (c) open(c); });
      track.addEventListener('keydown', e => {
        const c = e.target.closest('.card-item');
        if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c); }
      });
    }
  });

  document.querySelectorAll('[data-pause]').forEach(btn => {
    const track = document.getElementById(btn.dataset.pause);
    btn.addEventListener('click', () => {
      const paused = track.classList.toggle('paused');
      btn.setAttribute('aria-pressed', paused);
      btn.textContent = paused ? 'Play' : 'Pause';
    });
  });

  /* 5. Lightbox close */
  document.getElementById('lbClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  /* 6. Copy email */
  const copyBtn = document.getElementById('copyEmail');
  copyBtn.addEventListener('click', async () => {
    const label = copyBtn.querySelector('span');
    try { await navigator.clipboard.writeText('hello@emerald.blog'); label.textContent = 'Copied'; }
    catch { label.textContent = 'hello@emerald.blog'; }
    setTimeout(() => label.textContent = 'Copy email', 2000);
  });

  /* 7. Graceful fallback for missing images */
  const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#131c3a"/><circle cx="200" cy="150" r="40" fill="none" stroke="#3b82f6" stroke-width="4"/></svg>');
  document.addEventListener('error', e => {
    if (e.target.tagName === 'IMG' && e.target.src !== fallback) e.target.src = fallback;
  }, true);
});

/* ROS HIGHLIGHTS video ring (About section) */
document.addEventListener('DOMContentLoaded', () => {
  const ring = document.getElementById('videoRing');
  const inner = document.getElementById('vrInner');
  if (!ring || !inner) return;

  const vids = [...ring.querySelectorAll('video')];
  let angle = 0, dragging = false, lastX = 0, visible = true;
  const SPEED = 0.3; // higher = faster spin
  const TILT = 22;   // how much the ring leans toward the viewer
  const title = document.getElementById('vrTitle');

  vids.forEach(v => { v.muted = true; v.play().catch(() => {}); });

  // Only play and spin while the ring is on screen
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    vids.forEach(v => visible ? v.play().catch(() => {}) : v.pause());
  }).observe(ring);

  const tick = () => {
    if (visible && !dragging) angle += SPEED;
    inner.style.transform = `rotateX(${-TILT}deg) rotateY(${angle}deg)`;
    // keep the title facing the viewer while the ring turns around it
    if (title) title.style.transform = `translate(-50%, -50%) rotateY(${-angle}deg) rotateX(${TILT}deg)`;
    requestAnimationFrame(tick);
  };
  tick();

  ring.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; ring.setPointerCapture(e.pointerId); ring.classList.add('dragging'); });
  ring.addEventListener('pointermove', e => { if (dragging) { angle += (e.clientX - lastX) * 0.5; lastX = e.clientX; } });
  const end = () => { dragging = false; ring.classList.remove('dragging'); };
  ring.addEventListener('pointerup', end);
  ring.addEventListener('pointercancel', end);
});

/* HOME background video: v1 -> (5s) reveal navbar/text -> (13s) v2 loops forever */
document.addEventListener('DOMContentLoaded', () => {
  const v1 = document.getElementById('bgV1');
  const v2 = document.getElementById('bgV2');
  if (!v1 || !v2) { document.body.classList.remove('is-intro'); return; }

  let revealed = false, switched = false;

  const reveal = () => {
    if (revealed) return;
    revealed = true;
    document.body.classList.remove('is-intro');
  };

  const switchToV2 = () => {
    if (switched) return;
    switched = true;
    reveal();
    v2.currentTime = 0;
    v2.play().catch(() => {});
    v2.classList.add('active');
    v1.classList.add('hide');
    setTimeout(() => v1.pause(), 1000);
  };

  v1.addEventListener('timeupdate', () => {
    if (v1.currentTime >= 4.5) reveal();
    if (v1.currentTime >= 10) switchToV2();
  });
  v1.addEventListener('ended', switchToV2);   // kung mas maikli ang v1 sa 13s
  v1.addEventListener('error', reveal);       // kung hindi ma-load ang v1 (mali ang file name/path)
  v1.play().catch(reveal);                    // kung na-block ang autoplay
});