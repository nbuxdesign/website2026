// Shrink logo on scroll
(function(){
  const nav = document.querySelector('.nav, .cs-nav');
  const onScroll = () => {
    if (window.scrollY > 200) nav.classList.add('shrink');
    else nav.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll(); // initial check
})();

// Hero video sound toggle + reduced motion
(function(){
  const video = document.getElementById('heroVideo');
  const btn = document.getElementById('soundToggle');
  if (!video || !btn) return;

  // Respect reduced motion
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) video.pause();
  } catch(e){}

  const enableSound = async () => {
    try {
      video.muted = false;
      await video.play();
      btn.setAttribute('aria-pressed','true');
      btn.textContent = 'Sound on';
    } catch(e){
      video.muted = true;
      btn.setAttribute('aria-pressed','false');
      btn.textContent = 'Tap to enable sound';
    }
  };
  btn.addEventListener('click', enableSound);
})();

