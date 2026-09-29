// ============================================
//  PORTFOLIO — MAIN JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initHeroMotion(reducedMotion) {
    const hero = document.getElementById('hero');
    if (!hero) return;

    if (reducedMotion) {
      hero.classList.add('hero-motion-ready');
      return;
    }

    requestAnimationFrame(() => hero.classList.add('hero-motion-ready'));
  }

  initHeroMotion(prefersReducedMotion);

  function initLiveStatus() {
    const section = document.getElementById('live-status');
    if (!section) return;

    const localTime = document.getElementById('localTime');
    const pageTime = document.getElementById('pageTime');
    const githubActivity = document.getElementById('githubActivity');
    const statusLabel = section.querySelector('[data-status-label]');
    const startedAt = performance.now();

    const formatClock = () => new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());

    const formatElapsed = () => {
      const elapsed = Math.max(0, Math.floor((performance.now() - startedAt) / 1000));
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      return `${minutes}:${seconds}`;
    };

    const updateClocks = () => {
      if (localTime) localTime.textContent = formatClock();
      if (pageTime) pageTime.textContent = formatElapsed();
    };

    const setState = (state, label) => {
      section.dataset.state = state;
      if (statusLabel) statusLabel.textContent = label;
    };

    updateClocks();
    window.setInterval(updateClocks, 1000);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4500);

    fetch('https://api.github.com/users/AndrehhX/events?per_page=1', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
        return response.json();
      })
      .then(events => {
        const latest = Array.isArray(events) ? events[0] : null;
        if (!githubActivity) return;
        if (!latest) {
          githubActivity.textContent = 'No recent public activity.';
          setState('ready', 'Ready');
          return;
        }

        const eventName = String(latest.type || 'Activity').replace(/Event$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
        const repository = latest.repo?.name || 'public profile';
        githubActivity.textContent = `${eventName} · ${repository}`;
        setState('ready', 'Live');
      })
      .catch(() => setState('offline', 'Offline'))
      .finally(() => window.clearTimeout(timeout));
  }

  initLiveStatus();

  function initTerminal() {
    const form = document.getElementById('terminalForm');
    const input = document.getElementById('terminalInput');
    const output = document.getElementById('terminalOutput');
    if (!form || !input || !output) return;

    const scrollToSection = id => {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const commands = {
      'help': () => 'Commands: about · projects · stack · status · contact · clear',
      'about': () => 'Andreh Callejas / Computer Science student at UVG / software, automation and clear interfaces.',
      'projects': () => { scrollToSection('projects'); return 'Opening selected work.'; },
      'stack': () => 'Java · JavaScript · TypeScript · React · Git · HTML/CSS · automation',
      'status': () => { scrollToSection('live-status'); return 'Opening live signal.'; },
      'contact': () => { scrollToSection('contact'); return 'Opening contact channel.'; },
      'clear': () => { output.replaceChildren(); return ''; }
    };

    const addLine = (className, text) => {
      if (!text) return;
      const line = document.createElement('p');
      line.className = className;
      line.textContent = text;
      output.appendChild(line);
      while (output.children.length > 18) output.firstElementChild.remove();
      output.scrollTop = output.scrollHeight;
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      const rawCommand = input.value.trim().toLowerCase();
      if (!rawCommand) return;

      addLine('terminal-command', `guest@nyxand:~$ ${rawCommand}`);
      const command = rawCommand.split(/\s+/)[0];
      const handler = commands[command];
      const response = handler
        ? handler()
        : `Command not found: ${command}. Type help to see the available commands.`;
      addLine('terminal-response', response);
      input.value = '';
      input.focus();
    });
  }

  initTerminal();

  // SITE LOADER
  const siteLoader = document.getElementById('siteLoader');
  const loaderProgress = document.getElementById('loaderProgress');
  if (siteLoader) {
    const loaderStart = performance.now();
    let loaderFrame;

    const finishLoader = () => {
      if (loaderFrame) cancelAnimationFrame(loaderFrame);
      if (loaderProgress) loaderProgress.style.width = '100%';
      siteLoader.classList.add('is-ready');
      setTimeout(() => siteLoader.remove(), 700);
    };

    if (prefersReducedMotion) {
      finishLoader();
    } else {
      const tickLoader = now => {
        const progress = Math.min((now - loaderStart) / 900, 1);
        if (loaderProgress) loaderProgress.style.width = `${Math.round(progress * 100)}%`;
        if (progress < 1) {
          loaderFrame = requestAnimationFrame(tickLoader);
        } else {
          finishLoader();
        }
      };
      loaderFrame = requestAnimationFrame(tickLoader);
    }
  }

  // ── PAGE TRANSITION ──────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  // Animate in on load
  if (!prefersReducedMotion) {
    overlay.classList.add('leaving');
    setTimeout(() => overlay.classList.remove('leaving'), 500);
  }

  // Intercept internal link clicks
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel')
    ) {
      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('entering');
        setTimeout(() => { window.location.href = href; }, 400);
      });
    }
  });


  // ── CUSTOM CURSOR ────────────────────────
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    }
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (ring) {
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
    }
    rafId = requestAnimationFrame(animateRing);
  }
  if (ring && !prefersReducedMotion) animateRing();

  // Hover states
  const hoverEls = document.querySelectorAll('a, button, .ql-item, .skill-item, .project-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide on mobile
  if ('ontouchstart' in window || prefersReducedMotion) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }


  // ── NAVBAR SCROLL ────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    lastScroll = y;
  }, { passive: true });


  // ── HAMBURGER ────────────────────────────
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // ── SMOOTH ANCHOR SCROLL ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ── SCROLL REVEAL ────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-card').forEach(el => {
    revealObserver.observe(el);
  });


  // ── COUNTER ANIMATION ────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));


  // ── QUICK LINKS ACTIVE STATE ──────────────
  document.querySelectorAll('.ql-item').forEach(item => {
    item.addEventListener('mouseover', () => {
      item.querySelector('.ql-arrow').style.transition = 'transform 0.2s ease';
    });
  });


  // ── CARD TILT EFFECT ─────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    if (prefersReducedMotion) return;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) * 4;
      card.style.transform = `translate(-4px,-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = `4px 4px 0 var(--black)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });


  // ── STAGGERED NAV REVEAL ──────────────────
  document.querySelectorAll('.nav-link').forEach((link, i) => {
    link.style.opacity = '0';
    link.style.transform = 'translateY(-10px)';
    link.style.transition = `opacity 0.4s ease ${0.1 + i * 0.08}s, transform 0.4s ease ${0.1 + i * 0.08}s`;
    setTimeout(() => {
      link.style.opacity = '1';
      link.style.transform = 'translateY(0)';
    }, 50);
  });


  // ── BLOG STACK HOVER ─────────────────────
  const blogStack = document.querySelector('.blog-stack');
  if (blogStack) {
    blogStack.addEventListener('mouseenter', () => {
      const b2 = blogStack.querySelector('.bc-2');
      const b3 = blogStack.querySelector('.bc-3');
      if (b2) b2.style.transform = 'translate(24px, 24px) rotate(-2deg)';
      if (b3) b3.style.transform = 'translate(46px, 46px) rotate(3deg)';
    });
    blogStack.addEventListener('mouseleave', () => {
      const b2 = blogStack.querySelector('.bc-2');
      const b3 = blogStack.querySelector('.bc-3');
      if (b2) b2.style.transform = '';
      if (b3) b3.style.transform = '';
    });
    blogStack.querySelectorAll('.bc-2, .bc-3').forEach(el => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    });
  }


  // ── SECTION TITLE LETTER ANIMATE ─────────
  document.querySelectorAll('.section-title').forEach(title => {
    const text = title.textContent;
    title.innerHTML = text.split('').map(c =>
      c === ' '
        ? '<span style="display:inline-block;width:0.3em"></span>'
        : `<span style="display:inline-block;transition:transform 0.3s ease">${c}</span>`
    ).join('');
    title.addEventListener('mouseenter', () => {
      title.querySelectorAll('span').forEach((s, i) => {
        s.style.transitionDelay = `${i * 0.03}s`;
        s.style.transform = 'translateY(-4px)';
      });
    });
    title.addEventListener('mouseleave', () => {
      title.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.transitionDelay = '';
      });
    });
  });


  // ── GRAIN OVERLAY FOR CTA ─────────────────
  const cta = document.querySelector('.cta-section');
  if (cta) {
    cta.addEventListener('mousemove', e => {
      const rect = cta.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cta.style.setProperty('--mx', x + '%');
      cta.style.setProperty('--my', y + '%');
    });
  }

});
