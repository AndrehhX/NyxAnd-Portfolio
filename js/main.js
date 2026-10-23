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
      // Horario local en Guatemala (UTC-6)
      const gtDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
      const day = gtDate.getDay();
      const hour = gtDate.getHours();
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

    const cacheKey = 'nyxand_github_commit_cache';
    const applyCommitData = latest => {
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
    };

    // Render from cache first if available
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) applyCommitData(JSON.parse(cached));
    } catch (_) {}

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
        applyCommitData(latest);
        if (latest) {
          try { localStorage.setItem(cacheKey, JSON.stringify(latest)); } catch (_) {}
        }
      })
      .catch(() => {
        try {
          if (localStorage.getItem(cacheKey)) return;
        } catch (_) {}
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
      'help': () => 'Commands: about · projects · stack · status · vectors · contact · clear',
      'about': () => 'Andreh Callejas / Computer Science student at UVG / software, automation and clear interfaces.',
      'projects': () => { scrollToSection('projects'); return 'Opening selected work.'; },
      'stack': () => 'Java · JavaScript · TypeScript · React · Git · HTML/CSS · automation',
      'status': () => { scrollToSection('live-status'); return 'Opening live signal.'; },
      'vectors': () => { scrollToSection('vector-studio'); return 'Opening 3D vector studio.'; },
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

  // ── 3D VECTOR STUDIO (ISOMETRIC & PERSPECTIVE ENGINE) ──
  function initVectorStudio() {
    const stage = document.getElementById('vStage');
    const svg = document.getElementById('vSvg');
    const rotDeg = document.getElementById('vRotDeg');
    const rotMeta = document.getElementById('vRotMeta');
    const shadow = document.getElementById('vShadow');
    if (!stage || !svg || !rotDeg) return;

    const formBtns = document.querySelectorAll('.v-form-btn');
    const toolBtns = document.querySelectorAll('.v-tool-btn');
    const lightCards = document.querySelectorAll('.v-light-card');
    const projBtns = document.querySelectorAll('.v-proj-btn');
    const matrixGrid = document.getElementById('vMatrixGrid');
    const matrixDet = document.getElementById('vMatrixDet');
    const dotBadge = document.getElementById('vDotBadge');
    const brightnessInput = document.getElementById('vBrightnessInput');
    const brightnessFill = document.getElementById('vBrightnessFill');
    const brightnessVal = document.getElementById('vBrightnessVal');
    const shadowInput = document.getElementById('vShadowInput');
    const shadowFill = document.getElementById('vShadowFill');
    const shadowVal = document.getElementById('vShadowVal');
    const exportBtn = document.getElementById('vExportBtn');
    const exportBtnLabel = document.getElementById('vExportBtnLabel');
    const vertexHud = document.getElementById('vVertexHud');
    const hudId = document.getElementById('vHudId');
    const hudCoords = document.getElementById('vHudCoords');
    const hudMag = document.getElementById('vHudMag');
    const minBtn = document.getElementById('vMinBtn');
    const resetBtn = document.getElementById('vResetBtn');
    const axisSvg = document.querySelector('.v-axis-svg');
    const vectorWindow = document.getElementById('vectorWindow');

    let currentForm = 'cube';
    let currentTool = 'rotation';
    let currentLight = 'spot';
    let projectionMode = 'iso'; // 'iso' | 'persp'

    // Angles: yaw (horizontal) and pitch (vertical)
    let yaw = 35 * (Math.PI / 180);
    let pitch = 28 * (Math.PI / 180);

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startYaw = yaw;
    let startPitch = pitch;
    let hoveredVertexIdx = -1;

    // Light Vectors in World Space
    const lightVectors = {
      spot: normalizeVector([0.35, 0.85, 0.38]),
      area: normalizeVector([0.00, 1.00, 0.20]),
      target: normalizeVector([-0.60, 0.60, 0.52]),
      sun: normalizeVector([0.70, 0.55, 0.45])
    };

    function normalizeVector([x, y, z]) {
      const mag = Math.hypot(x, y, z) || 1;
      return [x / mag, y / mag, z / mag];
    }

    function dotProduct(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function crossProduct(a, b) {
      return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
      ];
    }

    // Geometries (parametric vectors)
    function getCube() {
      const s = 65;
      const vertices = [
        [-s, -s, -s], // 0
        [ s, -s, -s], // 1
        [ s,  s, -s], // 2
        [-s,  s, -s], // 3
        [-s, -s,  s], // 4
        [ s, -s,  s], // 5
        [ s,  s,  s], // 6
        [-s,  s,  s]  // 7
      ];
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];
      const faces = [
        { v: [0, 1, 2, 3], normal: [0, 0, -1] }, // back (-z)
        { v: [5, 4, 7, 6], normal: [0, 0,  1] }, // front (+z)
        { v: [4, 0, 3, 7], normal: [-1, 0, 0] }, // left (-x)
        { v: [1, 5, 6, 2], normal: [ 1, 0, 0] }, // right (+x)
        { v: [3, 2, 6, 7], normal: [0,  1, 0] }, // top (+y)
        { v: [4, 5, 1, 0], normal: [0, -1, 0] }  // bottom (-y)
      ];
      return { vertices, edges, faces };
    }

    function getPyramid() {
      const b = 68;
      const h = 85;
      const vertices = [
        [-b, -h / 2, -b], // 0
        [ b, -h / 2, -b], // 1
        [ b, -h / 2,  b], // 2
        [-b, -h / 2,  b], // 3
        [ 0,  h / 2,  0]  // 4 (apex)
      ];
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4]
      ];
      const faces = [
        { v: [0, 3, 2, 1], normal: [0, -1, 0] },
        { v: [0, 1, 4], normal: normalizeVector([0, b, -h]) },
        { v: [1, 2, 4], normal: normalizeVector([h, b, 0]) },
        { v: [2, 3, 4], normal: normalizeVector([0, b, h]) },
        { v: [3, 0, 4], normal: normalizeVector([-h, b, 0]) }
      ];
      return { vertices, edges, faces };
    }

    function getCylinder() {
      const r = 58;
      const h2 = 45;
      const segs = 16;
      const vertices = [];
      const edges = [];
      const faces = [];
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        vertices.push([Math.cos(a) * r, -h2, Math.sin(a) * r]); // 2*i: bottom
        vertices.push([Math.cos(a) * r,  h2, Math.sin(a) * r]); // 2*i+1: top
      }
      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        edges.push([i * 2, next * 2]);
        edges.push([i * 2 + 1, next * 2 + 1]);
        if (i % 4 === 0) {
          edges.push([i * 2, i * 2 + 1]);
        }
      }
      // Top cap and bottom cap faces
      const topIndices = [];
      const btmIndices = [];
      for (let i = 0; i < segs; i++) {
        topIndices.push(i * 2 + 1);
        btmIndices.unshift(i * 2);
      }
      faces.push({ v: topIndices, normal: [0, 1, 0] });
      faces.push({ v: btmIndices, normal: [0, -1, 0] });
      return { vertices, edges, faces };
    }

    function getSphere() {
      const r = 66;
      const segs = 24;
      const vertices = [];
      const edges = [];
      const configs = [
        { axis: 'xz', r: r, y: 0 },
        { axis: 'xz', r: r * 0.84, y: r * 0.48 },
        { axis: 'xz', r: r * 0.84, y: -r * 0.48 },
        { axis: 'xy', r: r, z: 0 },
        { axis: 'yz', r: r, x: 0 }
      ];
      configs.forEach(cfg => {
        const start = vertices.length;
        for (let i = 0; i < segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          let pt;
          if (cfg.axis === 'xz') {
            pt = [Math.cos(a) * cfg.r, cfg.y, Math.sin(a) * cfg.r];
          } else if (cfg.axis === 'xy') {
            pt = [Math.cos(a) * cfg.r, Math.sin(a) * cfg.r, cfg.z];
          } else {
            pt = [cfg.x, Math.sin(a) * cfg.r, Math.cos(a) * cfg.r];
          }
          vertices.push(pt);
          if (i > 0) edges.push([start + i - 1, start + i]);
        }
        edges.push([start + segs - 1, start]);
      });
      return { vertices, edges, faces: [] };
    }

    function getPoints() {
      const span = 56;
      const vertices = [];
      const steps = [-span, 0, span];
      for (const x of steps) {
        for (const y of steps) {
          for (const z of steps) {
            vertices.push([x, y, z]);
          }
        }
      }
      return { vertices, edges: [], faces: [] };
    }

    function getModel() {
      switch (currentForm) {
        case 'sphere': return getSphere();
        case 'pyramid': return getPyramid();
        case 'cylinder': return getCylinder();
        case 'points': return getPoints();
        default: return getCube();
      }
    }

    // 3D Rotation Matrix R = Rx(pitch) * Ry(yaw)
    function computeRotationMatrix(yawAngle, pitchAngle) {
      const cy = Math.cos(yawAngle);
      const sy = Math.sin(yawAngle);
      const cx = Math.cos(pitchAngle);
      const sx = Math.sin(pitchAngle);

      return [
        [ cy,          0,   sy          ],
        [ sx * sy,     cx, -sx * cy     ],
        [-cx * sy,     sx,  cx * cy     ]
      ];
    }

    function multiplyMatrixVector(m, [x, y, z]) {
      return [
        m[0][0] * x + m[0][1] * y + m[0][2] * z,
        m[1][0] * x + m[1][1] * y + m[1][2] * z,
        m[2][0] * x + m[2][1] * y + m[2][2] * z
      ];
    }

    // Project 3D vector to 2D screen coordinates
    function projectPoint(vec, rotM, cx = 170, cy = 150) {
      const [xr, yr, zr] = multiplyMatrixVector(rotM, vec);

      if (projectionMode === 'persp') {
        const d = 420;
        const scale = d / Math.max(120, d - zr);
        return {
          x: cx + xr * scale,
          y: cy - yr * scale,
          z: zr,
          scale,
          world: vec
        };
      } else {
        return {
          x: cx + xr,
          y: cy - yr,
          z: zr,
          scale: 1,
          world: vec
        };
      }
    }

    // Update Tripod Coordinates Widget
    function updateTripod(rotM) {
      if (!axisSvg) return;
      const lines = axisSvg.querySelectorAll('line');
      const texts = axisSvg.querySelectorAll('text');
      if (lines.length >= 3 && texts.length >= 3) {
        const pY = projectPoint([0, 16, 0], rotM, 25, 25);
        const pX = projectPoint([16, 0, 0], rotM, 25, 25);
        const pZ = projectPoint([0, 0, 16], rotM, 25, 25);

        lines[0].setAttribute('x2', pY.x.toFixed(1));
        lines[0].setAttribute('y2', pY.y.toFixed(1));
        texts[0].setAttribute('x', pY.x.toFixed(1));
        texts[0].setAttribute('y', (pY.y - 2).toFixed(1));

        lines[1].setAttribute('x2', pX.x.toFixed(1));
        lines[1].setAttribute('y2', pX.y.toFixed(1));
        texts[1].setAttribute('x', (pX.x - 3).toFixed(1));
        texts[1].setAttribute('y', (pX.y + 4).toFixed(1));

        lines[2].setAttribute('x2', pZ.x.toFixed(1));
        lines[2].setAttribute('y2', pZ.y.toFixed(1));
        texts[2].setAttribute('x', (pZ.x + 3).toFixed(1));
        texts[2].setAttribute('y', (pZ.y + 4).toFixed(1));
      }
    }

    function updateMatrixHUD(rotM) {
      if (!matrixGrid) return;
      const cells = matrixGrid.querySelectorAll('span');
      if (cells.length === 9) {
        let idx = 0;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const val = rotM[r][c];
            const sign = val >= 0 ? '+' : '';
            cells[idx].textContent = `${sign}${val.toFixed(3)}`;
            idx++;
          }
        }
      }
    }

    function render() {
      const rotM = computeRotationMatrix(yaw, pitch);

      // Degrees
      let degYaw = Math.round((yaw * 180 / Math.PI) % 360);
      if (degYaw < 0) degYaw += 360;
      let degPitch = Math.round(pitch * 180 / Math.PI);

      rotDeg.textContent = `${degYaw}°`;
      if (rotMeta) rotMeta.textContent = `θ: ${degYaw.toFixed(1)}° · φ: ${degPitch.toFixed(1)}°`;

      updateTripod(rotM);
      updateMatrixHUD(rotM);

      const model = getModel();
      const cx = 170;
      const cy = 146;

      // Project vertices
      const projected = model.vertices.map(v => projectPoint(v, rotM, cx, cy));

      // Calculate face normals and lighting dot product
      const lightVec = lightVectors[currentLight] || lightVectors.spot;
      let maxDot = 0;
      let activeFrontNormal = [0, 0, 1];

      const faceData = (model.faces || []).map(face => {
        const pts = face.v.map(idx => projected[idx]);
        // 2D signed area for front-facing check
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          area += (p1.x * p2.y - p2.x * p1.y);
        }
        const isFront = area > 0;

        // Normal rotated
        let normal = face.normal;
        if (!normal && face.v.length >= 3) {
          const v0 = model.vertices[face.v[0]];
          const v1 = model.vertices[face.v[1]];
          const v2 = model.vertices[face.v[2]];
          const edge1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
          const edge2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
          normal = normalizeVector(crossProduct(edge1, edge2));
        }

        const dot = normal ? Math.max(0, dotProduct(normal, lightVec)) : 0.5;
        if (isFront && dot > maxDot) {
          maxDot = dot;
          if (normal) activeFrontNormal = normal;
        }

        return { isFront, pts, normal, dot, vIndices: face.v };
      });

      // Update Dot Product Badge
      if (dotBadge) {
        dotBadge.textContent = `N̂·L̂: ${maxDot.toFixed(2)} (${Math.round(maxDot * 100)}%)`;
      }

      // Edge classifications
      const edgeFaceMap = new Map();
      faceData.forEach(fd => {
        for (let i = 0; i < fd.vIndices.length; i++) {
          const a = fd.vIndices[i];
          const b = fd.vIndices[(i + 1) % fd.vIndices.length];
          const key = Math.min(a, b) + '_' + Math.max(a, b);
          if (!edgeFaceMap.has(key)) edgeFaceMap.set(key, []);
          edgeFaceMap.get(key).push(fd.isFront);
        }
      });

      let svgContent = '';

      // ── 3D Ground Floor Ring & Projection ──
      const floorY = -68;
      const ringRadius = 120;
      const ringSegments = 36;
      const floorRingPoints = [];
      for (let i = 0; i <= ringSegments; i++) {
        const a = (i / ringSegments) * Math.PI * 2;
        floorRingPoints.push(projectPoint([Math.cos(a) * ringRadius, floorY, Math.sin(a) * ringRadius], rotM, cx, cy));
      }
      const ringPtsStr = floorRingPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      svgContent += `<polyline points="${ringPtsStr}" fill="none" stroke="rgba(10, 10, 10, 0.16)" stroke-width="1.2" stroke-dasharray="3 3" />`;

      // Active arc on the 3D ground plane tracking yaw angle
      const arcSegments = 16;
      const halfArc = 0.48; // radians
      const arcPoints = [];
      for (let i = 0; i <= arcSegments; i++) {
        const a = (yaw - halfArc) + (i / arcSegments) * (halfArc * 2);
        arcPoints.push(projectPoint([Math.sin(a) * ringRadius, floorY, Math.cos(a) * ringRadius], rotM, cx, cy));
      }
      const arcPtsStr = arcPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      svgContent += `<polyline points="${arcPtsStr}" fill="none" stroke="#0a0a0a" stroke-width="3.5" stroke-linecap="round" />`;

      // ── Shaded or Polygons Faces ──
      if (['shading', 'polygons'].includes(currentTool) && faceData.length) {
        faceData.forEach(fd => {
          if (!fd.isFront) return;
          const ptsStr = fd.pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          let fillStyle = 'rgba(255, 255, 255, 0.6)';
          if (currentTool === 'shading') {
            const shade = Math.round(230 * fd.dot + 25);
            fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.85)`;
          } else if (currentTool === 'polygons') {
            fillStyle = 'rgba(0, 0, 0, 0.05)';
          }
          svgContent += `<polygon points="${ptsStr}" fill="${fillStyle}" stroke="none" />`;
        });
      }

      // ── Model Edges ──
      model.edges.forEach(([a, b]) => {
        const p1 = projected[a];
        const p2 = projected[b];
        const key = Math.min(a, b) + '_' + Math.max(a, b);
        const faceInfo = edgeFaceMap.get(key);

        let stroke = '#0a0a0a';
        let strokeWidth = '2.4';
        let strokeDash = '';
        let strokeOpacity = '1';

        if (faceInfo && faceInfo.length) {
          const frontCount = faceInfo.filter(Boolean).length;
          if (frontCount === 0) {
            // Hidden back-edge
            stroke = '#4a505b';
            strokeWidth = '1.2';
            strokeDash = 'stroke-dasharray="3.5 3"';
            strokeOpacity = '0.35';
          } else if (frontCount === 1) {
            // Silhouette outer boundary
            stroke = '#0a0a0a';
            strokeWidth = '2.4';
          } else {
            // Internal crease
            stroke = '#0a0a0a';
            strokeWidth = '1.8';
          }
        } else {
          // Curvature rings (Sphere/Cylinder)
          const avgZ = (p1.z + p2.z) / 2;
          stroke = '#0a0a0a';
          strokeWidth = avgZ > 0 ? '1.8' : '1.1';
          strokeOpacity = avgZ > 0 ? '0.9' : '0.32';
        }

        svgContent += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${strokeOpacity}" stroke-linecap="round" stroke-linejoin="round" ${strokeDash} />`;
      });

      // ── Normal Vectors Overlay (Tool: Normals) ──
      if (currentTool === 'normals' && faceData.length) {
        faceData.forEach(fd => {
          if (!fd.isFront || !fd.normal) return;
          // Compute center of face in 3D
          const vList = fd.vIndices.map(i => model.vertices[i]);
          const center3D = [0, 0, 0];
          vList.forEach(v => {
            center3D[0] += v[0] / vList.length;
            center3D[1] += v[1] / vList.length;
            center3D[2] += v[2] / vList.length;
          });
          const tip3D = [
            center3D[0] + fd.normal[0] * 34,
            center3D[1] + fd.normal[1] * 34,
            center3D[2] + fd.normal[2] * 34
          ];
          const pCenter = projectPoint(center3D, rotM, cx, cy);
          const pTip = projectPoint(tip3D, rotM, cx, cy);

          // Arrow line
          svgContent += `<line x1="${pCenter.x.toFixed(1)}" y1="${pCenter.y.toFixed(1)}" x2="${pTip.x.toFixed(1)}" y2="${pTip.y.toFixed(1)}" stroke="#477952" stroke-width="2.2" stroke-linecap="round" />`;
          // Arrow tip circle / dot
          svgContent += `<circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="3" fill="#477952" />`;
          svgContent += `<text x="${(pTip.x + 5).toFixed(1)}" y="${(pTip.y - 3).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#477952">n̂</text>`;
        });
      }

      // ── Vertices / Points & Inspector ──
      projected.forEach((p, idx) => {
        const isHovered = (idx === hoveredVertexIdx);
        const isPointsMode = (currentForm === 'points' || currentTool === 'inspector');

        if (isPointsMode || isHovered) {
          const r = isHovered ? 4.5 : Math.max(1.8, Math.min(3.6, 2.6 + p.z * 0.015));
          const fill = isHovered ? '#477952' : '#0a0a0a';
          svgContent += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${fill}" />`;
          if (isHovered) {
            svgContent += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" fill="none" stroke="#477952" stroke-width="1.5" />`;
          }
        }
      });

      svg.innerHTML = svgContent;
    }

    // Interactive Dragging on Stage
    stage.addEventListener('pointerdown', e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startYaw = yaw;
      startPitch = pitch;
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    });

    stage.addEventListener('pointermove', e => {
      // Check vertex hover for Inspector
      const rect = stage.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rotM = computeRotationMatrix(yaw, pitch);
      const model = getModel();
      const cx = 170;
      const cy = 146;

      let foundIdx = -1;
      let minDist = 18;

      model.vertices.forEach((v, idx) => {
        const p = projectPoint(v, rotM, cx, cy);
        const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (dist < minDist) {
          minDist = dist;
          foundIdx = idx;
        }
      });

      if (foundIdx !== hoveredVertexIdx) {
        hoveredVertexIdx = foundIdx;
        if (hoveredVertexIdx >= 0 && vertexHud) {
          const v = model.vertices[hoveredVertexIdx];
          const p = projectPoint(v, rotM, cx, cy);
          vertexHud.hidden = false;
          vertexHud.style.left = `${p.x}px`;
          vertexHud.style.top = `${p.y}px`;
          if (hudId) hudId.textContent = `v${hoveredVertexIdx}`;
          if (hudCoords) hudCoords.textContent = `[${v[0].toFixed(0)}, ${v[1].toFixed(0)}, ${v[2].toFixed(0)}]`;
          if (hudMag) hudMag.textContent = `|v|=${Math.hypot(...v).toFixed(1)}`;
        } else if (vertexHud) {
          vertexHud.hidden = true;
        }
        if (!isDragging) render();
      }

      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      yaw = startYaw + dx * 0.012;
      pitch = Math.max(0.10, Math.min(1.35, startPitch - dy * 0.008));
      render();
    });

    const stopDrag = e => {
      if (!isDragging) return;
      isDragging = false;
      try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);
    stage.addEventListener('pointerleave', () => {
      hoveredVertexIdx = -1;
      if (vertexHud) vertexHud.hidden = true;
      if (!isDragging) render();
    });

    // Keyboard rotation
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        yaw -= 5 * (Math.PI / 180);
        render();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        yaw += 5 * (Math.PI / 180);
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        pitch = Math.min(1.35, pitch + 0.05);
        render();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        pitch = Math.max(0.10, pitch - 0.05);
        render();
      }
    });

    // Forms Switcher
    formBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        formBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentForm = btn.dataset.form || 'cube';
        hoveredVertexIdx = -1;
        if (vertexHud) vertexHud.hidden = true;
        render();
      });
    });

    // Tools Switcher
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentTool = btn.dataset.tool || 'rotation';
        render();
      });
    });

    // Projection Mode Switcher
    projBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        projBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        projectionMode = btn.dataset.proj || 'iso';
        render();
      });
    });

    // Lighting Switcher
    const applyLighting = lightType => {
      currentLight = lightType;
      if (!shadow) return;
      if (lightType === 'spot') {
        shadow.style.filter = 'blur(12px)';
        shadow.style.transform = 'scaleY(0.5) scaleX(1)';
      } else if (lightType === 'area') {
        shadow.style.filter = 'blur(20px)';
        shadow.style.transform = 'scaleY(0.5) scaleX(1.3)';
      } else if (lightType === 'target') {
        shadow.style.filter = 'blur(10px)';
        shadow.style.transform = 'translate(-18px, 4px) scaleY(0.5) scaleX(1.1)';
      } else if (lightType === 'sun') {
        shadow.style.filter = 'blur(7px)';
        shadow.style.transform = 'translate(14px, 2px) scaleY(0.48) scaleX(1.05)';
      }
      render();
    };

    lightCards.forEach(card => {
      card.addEventListener('click', () => {
        lightCards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
        applyLighting(card.dataset.light || 'spot');
      });
    });

    // Sliders
    if (brightnessInput && brightnessFill) {
      brightnessInput.addEventListener('input', e => {
        const val = Number(e.target.value);
        brightnessFill.style.width = `${val}%`;
        if (brightnessVal) brightnessVal.textContent = `${val}%`;
        const stageEl = document.getElementById('vStage');
        if (stageEl) stageEl.style.filter = `brightness(${(val / 72).toFixed(2)})`;
      });
    }

    if (shadowInput && shadowFill) {
      shadowInput.addEventListener('input', e => {
        const val = Number(e.target.value);
        shadowFill.style.width = `${val}%`;
        if (shadowVal) shadowVal.textContent = `${val}%`;
        if (shadow) shadow.style.opacity = `${(val / 100) * 0.85}`;
      });
    }

    // Copy Vectors (JSON Export for University Assignments)
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        const rotM = computeRotationMatrix(yaw, pitch);
        const model = getModel();
        const exportData = {
          course: 'UVG · Computación Gráfica / Álgebra Lineal',
          form: currentForm,
          projection: projectionMode,
          euler_angles_deg: {
            yaw: Math.round((yaw * 180 / Math.PI) % 360),
            pitch: Math.round(pitch * 180 / Math.PI)
          },
          so3_rotation_matrix: rotM.map(row => row.map(v => Number(v.toFixed(4)))),
          light_vector: lightVectors[currentLight],
          vertices: model.vertices,
          edges: model.edges
        };

        const jsonStr = JSON.stringify(exportData, null, 2);
        try {
          await navigator.clipboard.writeText(jsonStr);
          exportBtn.classList.add('is-copied');
          if (exportBtnLabel) exportBtnLabel.textContent = 'COPIED TO CLIPBOARD!';
          setTimeout(() => {
            exportBtn.classList.remove('is-copied');
            if (exportBtnLabel) exportBtnLabel.textContent = 'COPY VECTORS (JSON)';
          }, 2000);
        } catch (_) {
          if (exportBtnLabel) exportBtnLabel.textContent = 'READY TO COPY';
        }
      });
    }

    // Minimize & Reset Controls
    if (minBtn && vectorWindow) {
      minBtn.addEventListener('click', () => {
        vectorWindow.classList.toggle('is-minimized');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        yaw = 35 * (Math.PI / 180);
        pitch = 28 * (Math.PI / 180);
        currentForm = 'cube';
        currentTool = 'rotation';
        currentLight = 'spot';
        projectionMode = 'iso';

        formBtns.forEach(b => b.classList.toggle('is-active', b.dataset.form === 'cube'));
        toolBtns.forEach(b => b.classList.toggle('is-active', b.dataset.tool === 'rotation'));
        lightCards.forEach(c => c.classList.toggle('is-active', c.dataset.light === 'spot'));
        projBtns.forEach(p => p.classList.toggle('is-active', p.dataset.proj === 'iso'));

        applyLighting('spot');
        if (brightnessInput && brightnessFill) {
          brightnessInput.value = '72';
          brightnessFill.style.width = '72%';
          if (brightnessVal) brightnessVal.textContent = '72%';
          const stageEl = document.getElementById('vStage');
          if (stageEl) stageEl.style.filter = '';
        }
        if (shadowInput && shadowFill) {
          shadowInput.value = '65';
          shadowFill.style.width = '65%';
          if (shadowVal) shadowVal.textContent = '65%';
          if (shadow) shadow.style.opacity = '';
        }
        render();
      });
    }

    // Initial render
    render();
  }

  initVectorStudio();

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
      !href.startsWith('tel') &&
      !link.hasAttribute('download') &&
      link.getAttribute('target') !== '_blank'
    ) {
      link.addEventListener('click', e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
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


  // ── CLEAN URL (Remove index.html and sanitize address bar) ──
  if (window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('index.html')) {
    const cleanPath = window.location.pathname.replace(/\/index\.html$/, '/') || '/';
    const cleanUrl = cleanPath + window.location.search + window.location.hash;
    try {
      window.history.replaceState(null, '', cleanUrl);
    } catch (_) {}
  }

  // ── SMOOTH ANCHOR SCROLL ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
      }
    });
  });

  // If page loaded with hash, scroll smoothly and keep address bar clean
  if (window.location.hash) {
    const initialTarget = document.querySelector(window.location.hash);
    if (initialTarget) {
      setTimeout(() => {
        const offset = 70;
        const top = initialTarget.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (_) {}
      }, 350);
    }
  }


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



});
