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

  function initHeroDepth(reducedMotion) {
    const hero = document.getElementById('hero');
    const monitor = hero?.querySelector('.monitor-wrapper');
    if (!hero || !monitor || reducedMotion) return;

    let frame = 0;
    let shiftX = 0;
    let shiftY = 0;

    const render = () => {
      frame = 0;
      monitor.style.setProperty('--hero-shift-x', `${shiftX.toFixed(2)}px`);
      monitor.style.setProperty('--hero-shift-y', `${shiftY.toFixed(2)}px`);
    };

    const scheduleRender = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    hero.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;

      const bounds = hero.getBoundingClientRect();
      const normalizedX = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
      const normalizedY = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;
      shiftX = Math.max(-1, Math.min(1, normalizedX)) * 8;
      shiftY = Math.max(-1, Math.min(1, normalizedY)) * 4;
      scheduleRender();
    });

    hero.addEventListener('pointerleave', () => {
      shiftX = 0;
      shiftY = 0;
      scheduleRender();
    });
  }

  initHeroDepth(prefersReducedMotion);

  function initHeroSignal(reducedMotion) {
    const signal = document.getElementById('heroSignal');
    const label = signal?.querySelector('[data-signal-label]');
    if (!signal || !label) return;

    const setState = state => {
      signal.dataset.state = state.toLowerCase();
      label.textContent = state;
    };

    if (reducedMotion) {
      setState('READY');
      return;
    }

    setState('BUILDING');
    window.setTimeout(() => setState('TESTING'), 780);
    window.setTimeout(() => setState('READY'), 1660);
  }

  initHeroSignal(prefersReducedMotion);

  function initMonitorInteraction(reducedMotion) {
    const monitor = document.getElementById('heroMonitor');
    if (!monitor) return;

    let reassembleTimer;

    const openMonitor = () => {
      window.clearTimeout(reassembleTimer);
      monitor.classList.remove('is-reassembling');
      monitor.classList.add('is-disassembled');
      monitor.setAttribute('aria-expanded', 'true');
    };

    const closeMonitor = () => {
      if (!monitor.classList.contains('is-disassembled')) return;

      monitor.classList.add('is-reassembling');
      monitor.classList.remove('is-disassembled');
      monitor.setAttribute('aria-expanded', 'false');
      reassembleTimer = window.setTimeout(() => monitor.classList.remove('is-reassembling'), 820);
    };

    monitor.addEventListener('click', openMonitor);
    monitor.addEventListener('pointerleave', closeMonitor);
    monitor.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMonitor();
      }
    });

    if (reducedMotion) monitor.dataset.reducedMotion = 'true';
  }

  initMonitorInteraction(prefersReducedMotion);

  function initLiveStatus() {
    const section = document.getElementById('live-status');
    if (!section) return;

    const localTime = document.getElementById('localTime');
    const pageTime = document.getElementById('pageTime');
    const githubActivity = document.getElementById('githubActivity');
    const githubEventTime = document.getElementById('githubEventTime');
    const githubEventMessage = document.getElementById('githubEventMessage');
    const availabilityStatus = document.getElementById('availabilityStatus');
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

    const getAvailability = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const isWeekend = day === 0 || day === 6;
      const isSleeping = !isWeekend && (hour >= 21 || hour < 4);

      if (isSleeping) {
        return { state: 'sleeping', label: 'Dormido', message: 'Vuelvo a las 04:00.' };
      }
      if (isWeekend) {
        return { state: 'available', label: 'Activo 24/7', message: 'Activo todo el fin de semana.' };
      }
      return { state: 'available', label: 'Disponible', message: 'Disponible hoy hasta las 21:00.' };
    };

    const updateAvailability = () => {
      const availability = getAvailability();
      section.dataset.state = availability.state;
      if (statusLabel) statusLabel.textContent = availability.label;
      if (availabilityStatus) availabilityStatus.textContent = `Horario: ${availability.message}`;
    };

    const formatGithubDate = value => {
      if (!value) return 'Fecha no disponible';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
      return new Intl.DateTimeFormat('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    };

    const getCommitMessage = (event, commit) => {
      const message = commit?.commit?.message || event?.payload?.commits?.[0]?.message;
      return typeof message === 'string' && message.trim()
        ? message.split(/\r?\n/, 1)[0].trim()
        : 'Sin mensaje de commit disponible';
    };

    const updateClocks = () => {
      if (localTime) localTime.textContent = formatClock();
      if (pageTime) pageTime.textContent = formatElapsed();
    };

    updateClocks();
    updateAvailability();
    window.setInterval(updateClocks, 1000);
    window.setInterval(updateAvailability, 60000);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    fetch('https://api.github.com/repos/AndrehhX/NyxAnd-Portfolio/commits?per_page=1', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
        return response.json();
      })
      .then(commits => {
        const latest = Array.isArray(commits) ? commits[0] : null;
        if (!githubActivity) return;
        if (!latest) {
          githubActivity.textContent = 'Sin actividad pública reciente.';
          if (githubEventTime) githubEventTime.textContent = 'Fecha: no hay un evento reciente';
          if (githubEventMessage) githubEventMessage.textContent = 'Commit: no disponible';
          return;
        }

        githubActivity.textContent = 'Último push · AndrehhX/NyxAnd-Portfolio';
        const commitDate = latest.commit?.author?.date || latest.commit?.committer?.date;
        if (githubEventTime) githubEventTime.textContent = `Fecha: ${formatGithubDate(commitDate)}`;
        if (githubEventMessage) githubEventMessage.textContent = `Commit: ${getCommitMessage(null, latest)}`;
      })
      .catch(() => {
        if (githubActivity) githubActivity.textContent = 'Actividad pública no disponible ahora.';
        if (githubEventTime) githubEventTime.textContent = 'Fecha: pendiente de respuesta';
        if (githubEventMessage) githubEventMessage.textContent = 'Commit: pendiente de respuesta';
      })
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

  function initLaboratory() {
    const editor = document.getElementById('labEditor');
    const preview = document.getElementById('labPreview');
    const run = document.getElementById('labRun');
    const reset = document.getElementById('labReset');
    const tabs = document.querySelectorAll('.lab-tab');
    if (!editor || !preview || !run || !reset || !tabs.length) return;

    const starters = {
      card: `<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4efe6;color:#111;font:14px Arial,sans-serif}
.card{width:min(280px,80vw);padding:24px;border:2px solid #111;box-shadow:8px 8px 0 #111;background:#fff}
.card small{letter-spacing:.14em;text-transform:uppercase}.card h1{font-size:38px;margin:28px 0 8px}.card p{margin:0;color:#4b4b45}
</style><article class="card"><small>NYXAND / ID-01</small><h1>Andreh</h1><p>Java / React / Automation</p></article>`,
      badge: `<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111;color:#f4efe6;font:14px Arial,sans-serif}
.badge{padding:18px 22px;border:1px solid #f4efe6;display:flex;gap:14px;align-items:center}.dot{width:10px;height:10px;background:#9ee37d;border-radius:50%;box-shadow:0 0 16px #9ee37d}.badge span{letter-spacing:.12em;text-transform:uppercase}
</style><div class="badge"><i class="dot"></i><span>building in public</span></div>`,
      grid: `<style>
body{margin:0;min-height:100vh;padding:24px;box-sizing:border-box;background:#f4efe6;color:#111;font:14px Arial,sans-serif}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:360px;margin:auto}.tile{min-height:100px;border:1px solid #111;padding:14px;display:flex;align-items:end;background:#fff}.tile:nth-child(2){background:#9ee37d}.tile:nth-child(3){background:#111;color:#f4efe6}.tile b{font-size:20px}
</style><div class="grid"><div class="tile"><b>01 / motion</b></div><div class="tile"><b>02 / systems</b></div><div class="tile"><b>03 / ideas</b></div><div class="tile"><b>04 / craft</b></div></div>`,
      motion: `<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:24px;display:grid;place-items:center;background:#f4efe6;color:#111;font:13px Arial,sans-serif}.motion-lab{width:min(410px,100%);padding:20px;border:1px solid #111;background:#fff;box-shadow:8px 8px 0 #b9b3aa;overflow:hidden}.motion-topline,.motion-footer{display:flex;justify-content:space-between;gap:12px;font-size:10px;letter-spacing:.12em;text-transform:uppercase}.motion-topline{color:#4b4b45}.motion-status{display:flex;align-items:center;gap:6px}.motion-status i{width:7px;height:7px;border-radius:50%;background:#588b60;animation:motionPulse 2s ease-in-out infinite}.motion-stage{position:relative;min-height:190px;margin-top:18px;overflow:hidden;border:1px solid #d8d0c4;background:linear-gradient(135deg,#fbf8f2,#eee7dc)}.motion-stage::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 42px,rgba(17,17,17,.05) 43px 44px);opacity:.6}.motion-orbit{position:absolute;top:30px;right:26px;width:118px;height:56px;border:1px solid #111;border-radius:50%;transform:rotate(-22deg);animation:motionOrbit 6s linear infinite}.motion-orbit::after{content:'';position:absolute;top:-5px;left:20px;width:9px;height:9px;border-radius:50%;background:#588b60;box-shadow:0 0 0 5px rgba(88,139,96,.14)}.motion-card-wrap{position:absolute;left:22px;bottom:22px;width:220px;animation:motionReveal .9s cubic-bezier(.22,1,.36,1) both}.motion-card{position:relative;width:100%;padding:16px;background:#111;color:#f4efe6;box-shadow:6px 6px 0 #9c978e;animation:motionDrift 5s ease-in-out 1s infinite}.motion-card small,.motion-card span{display:block;color:#a6a198;font-size:10px;letter-spacing:.12em;text-transform:uppercase}.motion-card b{display:block;margin:22px 0 4px;font-size:22px;font-weight:400;letter-spacing:-.03em}.motion-card span{color:#9ee37d}.motion-chip{position:absolute;right:22px;bottom:23px;padding:7px 9px;border:1px solid #111;background:#9ee37d;font-size:10px;letter-spacing:.12em;animation:motionReveal .9s .18s cubic-bezier(.22,1,.36,1) both}.motion-footer{margin-top:15px;color:#777}.motion-footer span:last-child{color:#477952}@keyframes motionReveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes motionDrift{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes motionOrbit{to{transform:rotate(338deg)}}@keyframes motionPulse{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important}}
</style><main class="motion-lab"><header class="motion-topline"><span>NYXAND / MOTION</span><span class="motion-status"><i></i>LIVE CSS</span></header><section class="motion-stage"><span class="motion-orbit" aria-hidden="true"></span><div class="motion-card-wrap"><article class="motion-card"><small>01 / reveal</small><b>Move with intent.</b><span>stagger + easing</span></article></div><span class="motion-chip">FLOAT</span></section><footer class="motion-footer"><span>CSS ONLY</span><span>EDIT / RUN / REPEAT</span></footer></main>`
    };

    let currentStarter = 'card';

    const renderPreview = () => {
      preview.srcdoc = editor.value;
    };

    const loadStarter = name => {
      currentStarter = starters[name] ? name : 'card';
      editor.value = starters[currentStarter];
      tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.starter === currentStarter));
      renderPreview();
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => loadStarter(tab.dataset.starter));
    });
    run.addEventListener('click', renderPreview);
    reset.addEventListener('click', () => loadStarter(currentStarter));
    loadStarter(currentStarter);
  }

  initLaboratory();

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
      setTimeout(() => siteLoader.remove(), 900);
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
