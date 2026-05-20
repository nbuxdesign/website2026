// Lightweight portfolio gate for static hosting. This keeps casual visitors out,
// but does not replace real server-side authentication for highly sensitive work.
(function () {
  const ACCESS_KEY = 'nb-portfolio-access';
  const ACCESS_VALUE = 'granted-v1';
  const PASSWORD_HASH = '3bef4a8675a87b0f7cedac4320edfdf3be34e585666bee2b59312932d3c86d79';

  const hasAccess = () => {
    try {
      return sessionStorage.getItem(ACCESS_KEY) === ACCESS_VALUE;
    } catch (e) {
      return false;
    }
  };

  const grantAccess = () => {
    try {
      sessionStorage.setItem(ACCESS_KEY, ACCESS_VALUE);
    } catch (e) {}
    document.documentElement.classList.remove('auth-lock');
    document.querySelector('.password-gate')?.remove();
  };

  const toHex = (buffer) => Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const hashPassword = async (password) => {
    const encoded = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
  };

  if (hasAccess()) {
    document.documentElement.classList.remove('auth-lock');
    return;
  }

  document.documentElement.classList.add('auth-lock');

  const gate = document.createElement('main');
  gate.className = 'password-gate';
  gate.setAttribute('aria-labelledby', 'passwordGateTitle');
  gate.innerHTML = `
    <img class="password-gate-logo" src="./logos/nb_logo.svg" alt="Nick Brunt" />
    <section class="password-gate-card">
      <h1 id="passwordGateTitle">Wait, we should talk about this first...</h1>
      <p>My work includes client projects and process details, so access is intentionally limited. Sorry.</p>
      <form class="password-gate-form">
        <p class="password-gate-prompt">Enter the shared password to continue.</p>
        <label class="visually-hidden" for="portfolioPassword">Password</label>
        <input id="portfolioPassword" name="portfolioPassword" type="password" autocomplete="current-password" placeholder="Enter Password..." required />
        <button type="submit">Continue</button>
        <p class="password-gate-message" role="status" aria-live="polite"></p>
      </form>
      <p class="password-gate-contact">If you are working on something cool and would like to chat then let’s <a href="https://ca.linkedin.com/in/nickbrunt" target="_blank" rel="noopener">get in touch!</a></p>
    </section>
  `;

  document.body.prepend(gate);

  const form = gate.querySelector('.password-gate-form');
  const input = gate.querySelector('#portfolioPassword');
  const message = gate.querySelector('.password-gate-message');
  const button = gate.querySelector('button');

  window.requestAnimationFrame(() => input.focus());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    button.disabled = true;

    try {
      const hash = await hashPassword(input.value);
      if (hash === PASSWORD_HASH) {
        grantAccess();
        return;
      }

      message.textContent = 'That password did not work. Try again or ask Nick for the current one.';
      input.value = '';
      input.focus();
    } catch (e) {
      message.textContent = 'This browser could not verify the password. Please try a current browser.';
    } finally {
      button.disabled = false;
    }
  });
})();

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
