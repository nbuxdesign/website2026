// Persistent nav shrink behavior
(function () {
  const nav = document.querySelector('.nav, .cs-nav');
  if (!nav) return;

  let ticking = false;
  const shrinkPoint = () => {
    if (nav.classList.contains('cs-nav')) return 24;
    return 32;
  };

  const updateNav = () => {
    nav.classList.toggle('shrink', window.scrollY > shrinkPoint());
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    window.requestAnimationFrame(updateNav);
    ticking = true;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();
})();

// Hero video sound toggle + reduced motion. The current design is silent by default;
// this safely supports a future #soundToggle without requiring it in the markup.
(function () {
  const video = document.getElementById('heroVideo');
  const btn = document.getElementById('soundToggle');
  if (!video) return;

  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) video.pause();
  } catch (e) {}

  if (!btn) return;

  const enableSound = async () => {
    try {
      video.muted = false;
      await video.play();
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'Sound on';
    } catch (e) {
      video.muted = true;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'Tap to enable sound';
    }
  };

  btn.addEventListener('click', enableSound);
})();
