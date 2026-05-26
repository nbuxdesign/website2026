// Lightweight portfolio gate for static hosting. This keeps casual visitors out,
// but does not replace real server-side authentication for highly sensitive work.
(function () {
  const ACCESS_KEY = 'nb-portfolio-access';
  const ACCESS_VALUE = 'granted-v1';
  const PASSWORD_HASH = '3bef4a8675a87b0f7cedac4320edfdf3be34e585666bee2b59312932d3c86d79';

  const isHomePage = () => Boolean(document.querySelector('.nav'));

  const resetHomeScroll = () => {
    if (!isHomePage()) return;

    const scrollElement = document.scrollingElement || document.documentElement;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    scrollElement.scrollTop = 0;
    scrollElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  };

  const settleHomeAtTop = () => {
    resetHomeScroll();
    window.requestAnimationFrame(resetHomeScroll);
    window.setTimeout(resetHomeScroll, 120);
    window.setTimeout(resetHomeScroll, 360);
  };

  if (isHomePage() && 'scrollRestoration' in window.history) {
    try {
      window.history.scrollRestoration = 'manual';
    } catch (e) {}
  }

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.documentElement.classList.remove('auth-lock');
    document.querySelector('.password-gate')?.remove();
    settleHomeAtTop();
  };

  const toHex = (buffer) => Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const hashPassword = async (password) => {
    const encoded = new TextEncoder().encode(password.toLowerCase());
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
  };

  if (hasAccess()) {
    document.documentElement.classList.remove('auth-lock');
    settleHomeAtTop();
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
      <p>My portfolio includes client projects and process details, so access is intentionally limited to private conversation. My bad. If you're looking to get in touch you can <a href="https://ca.linkedin.com/in/nickbrunt" target="_blank" rel="noopener">always find me here.</a></p>
      <form class="password-gate-form">
        <p class="password-gate-prompt">Enter the shared password to continue.</p>
        <label class="visually-hidden" for="portfolioPassword">Password</label>
        <input id="portfolioPassword" name="portfolioPassword" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" placeholder="Enter Password..." required />
        <button class="nb-button" type="submit">Continue <img src="./imgs/arrows_forward_dark.svg" height="10" alt="" aria-hidden="true" /></button>
        <p class="password-gate-message" role="status" aria-live="polite"></p>
      </form>
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
  const homeMobileQuery = window.matchMedia('(max-width: 834px)');
  const shrinkPoint = () => {
    if (nav.classList.contains('cs-nav')) return 24;
    return homeMobileQuery.matches ? 110 : 190;
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

// Case-study mobile nav
(function () {
  const nav = document.querySelector('.cs-nav');
  const toggle = nav?.querySelector('.cs-menu-toggle');
  if (!nav || !toggle) return;

  const mobileQuery = window.matchMedia('(max-width: 900px)');
  const setOpen = (open) => {
    nav.classList.toggle('mobile-open', open);
    document.body.classList.toggle('cs-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} case study navigation`);
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('mobile-open'));
  });

  nav.querySelectorAll('.cs-btn').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  const closeWhenDesktop = () => {
    if (!mobileQuery.matches) setOpen(false);
  };

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', closeWhenDesktop);
  } else {
    mobileQuery.addListener(closeWhenDesktop);
  }
})();

// Keep motion-sensitive browsers from playing the decorative hero video.
(function () {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) video.pause();
  } catch (e) {}
})();
