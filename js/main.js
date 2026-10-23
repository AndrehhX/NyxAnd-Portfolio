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
    const dayNameEl = document.getElementById('vDayName');
    const dateStrEl = document.getElementById('vDateStr');
    const yearDisplayEl = document.getElementById('vYearDisplay');

    // Real-time dynamic date & year header
    function updateRealTimeHeaderDate() {
      const now = new Date();
      if (dayNameEl) {
        dayNameEl.textContent = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(now);
      }
      if (dateStrEl) {
        const day = now.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
        dateStrEl.textContent = `${day} ${month}`;
      }
      if (yearDisplayEl) {
        yearDisplayEl.textContent = String(now.getFullYear());
      }
    }
    updateRealTimeHeaderDate();
    window.setInterval(updateRealTimeHeaderDate, 60000);

    let currentForm = 'cube';
    let currentTool = 'rotation';
    let currentLight = 'spot';
    let projectionMode = 'iso'; // 'iso' | 'persp'
    let activeVMode = '3d-mesh'; // '3d-mesh' | 'line-slope' | 'vector-ops'
    let lineSubMode = 'points';  // 'points' | 'slope'

    // Mode tabs & panes
    const modeTabs = document.querySelectorAll('.v-mode-tab');
    const paneMesh = document.getElementById('vPaneMesh');
    const paneLine = document.getElementById('vPaneLine');
    const paneVecs = document.getElementById('vPaneVecs');
    const rightMesh = document.getElementById('vRightMesh');
    const rightLine = document.getElementById('vRightLine');
    const rightVecs = document.getElementById('vRightVecs');
    const viewBar = document.getElementById('vViewBar');
    const snapBtns = document.querySelectorAll('.v-snap-btn');

    // Line / Point-Slope Elements
    const subModePointsBtn = document.getElementById('subModePointsBtn');
    const subModeSlopeBtn = document.getElementById('subModeSlopeBtn');
    const p1X = document.getElementById('p1X');
    const p1Y = document.getElementById('p1Y');
    const p1Z = document.getElementById('p1Z');
    const p1ZWrap = document.getElementById('p1ZWrap');
    const p2X = document.getElementById('p2X');
    const p2Y = document.getElementById('p2Y');
    const p2Z = document.getElementById('p2Z');
    const p2ZWrap = document.getElementById('p2ZWrap');
    const p2Group = document.getElementById('p2Group');
    const slopeInput = document.getElementById('slopeInput');
    const slopeGroup = document.getElementById('slopeGroup');

    const calcLineVec = document.getElementById('calcLineVec');
    const calcLineMag = document.getElementById('calcLineMag');
    const calcLineUnit = document.getElementById('calcLineUnit');
    const calcLineSlope = document.getElementById('calcLineSlope');
    const calcEqPointSlope = document.getElementById('calcEqPointSlope');
    const calcEqGeneral = document.getElementById('calcEqGeneral');
    const calcEqVectorial = document.getElementById('calcEqVectorial');
    const calcEqParam = document.getElementById('calcEqParam');
    const calcEqSym = document.getElementById('calcEqSym');
    const vCopyLineBtn = document.getElementById('vCopyLineBtn');
    const vCopyLineLabel = document.getElementById('vCopyLineLabel');

    // Vector Ops Elements
    const vAx = document.getElementById('vAx');
    const vAy = document.getElementById('vAy');
    const vAz = document.getElementById('vAz');
    const vBx = document.getElementById('vBx');
    const vBy = document.getElementById('vBy');
    const vBz = document.getElementById('vBz');

    const calcVecNorms = document.getElementById('calcVecNorms');
    const calcVecDot = document.getElementById('calcVecDot');
    const calcVecAngle = document.getElementById('calcVecAngle');
    const calcVecRelBadge = document.getElementById('calcVecRelBadge');
    const calcVecCross = document.getElementById('calcVecCross');
    const calcVecArea = document.getElementById('calcVecArea');
    const calcVecTriArea = document.getElementById('calcVecTriArea');
    const calcVecProj = document.getElementById('calcVecProj');
    const vCopyVecBtn = document.getElementById('vCopyVecBtn');
    const vCopyVecLabel = document.getElementById('vCopyVecLabel');

    // Mathematical utility formatters
    function parseSlope(str) {
      if (!str) return 0;
      str = String(str).trim();
      if (str.includes('/')) {
        const parts = str.split('/');
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (den !== 0 && !isNaN(num) && !isNaN(den)) return num / den;
      }
      const val = parseFloat(str);
      return isNaN(val) ? 0 : val;
    }

    function toFraction(val, tolerance = 1e-4) {
      if (!isFinite(val)) return 'Indefinida (∞)';
      if (Math.abs(val - Math.round(val)) < tolerance) return String(Math.round(val));
      const sign = val < 0 ? '-' : '';
      val = Math.abs(val);
      let bestNum = 1, bestDen = 1, minErr = Math.abs(val - 1);
      for (let den = 1; den <= 64; den++) {
        const num = Math.round(val * den);
        const err = Math.abs(val - num / den);
        if (err < minErr) {
          minErr = err;
          bestNum = num;
          bestDen = den;
          if (err < tolerance) break;
        }
      }
      return `${sign}${bestNum}/${bestDen}`;
    }

    function formatNumber(num, decimals = 3) {
      if (!isFinite(num)) return '0';
      const fixed = num.toFixed(decimals);
      return parseFloat(fixed).toString();
    }

    // Compute Line & Point-Slope Data
    function computeLineData() {
      const x1 = parseFloat(p1X?.value || 0);
      const y1 = parseFloat(p1Y?.value || 0);
      const isSlopeMode = (lineSubMode === 'slope');
      const z1 = isSlopeMode ? 0 : parseFloat(p1Z?.value || 0);

      let x2, y2, z2, slopeVal;
      if (isSlopeMode) {
        slopeVal = parseSlope(slopeInput?.value || '-0.75');
        const dx = 4;
        const dy = dx * slopeVal;
        x2 = x1 + dx;
        y2 = y1 + dy;
        z2 = 0;
      } else {
        x2 = parseFloat(p2X?.value || 0);
        y2 = parseFloat(p2Y?.value || 0);
        z2 = parseFloat(p2Z?.value || 0);
        slopeVal = (x2 - x1 !== 0) ? (y2 - y1) / (x2 - x1) : Infinity;
      }

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const mag = Math.hypot(dx, dy, dz);
      const unit = mag > 0 ? [dx / mag, dy / mag, dz / mag] : [0, 0, 0];

      const angleRad = Math.atan2(dy, dx);
      let angleDeg = angleRad * (180 / Math.PI);
      if (angleDeg < 0) angleDeg += 180;

      const slopeFrac = toFraction(slopeVal);
      const bVal = isFinite(slopeVal) ? y1 - slopeVal * x1 : 0;

      // Equations
      const signY1 = y1 >= 0 ? `- ${formatNumber(y1)}` : `+ ${formatNumber(Math.abs(y1))}`;
      const signX1 = x1 >= 0 ? `- ${formatNumber(x1)}` : `+ ${formatNumber(Math.abs(x1))}`;
      const eqPointSlope = isFinite(slopeVal)
        ? `y ${signY1} = ${slopeFrac}(x ${signX1})`
        : `x = ${formatNumber(x1)} (Recta vertical)`;

      let eqGeneral;
      if (!isFinite(slopeVal)) {
        eqGeneral = `x - ${formatNumber(x1)} = 0`;
      } else {
        const A = dy;
        const B = -dx;
        const C = dx * y1 - dy * x1;
        eqGeneral = `${formatNumber(A)}x ${B >= 0 ? '+ ' + formatNumber(B) : '- ' + formatNumber(Math.abs(B))}y ${C >= 0 ? '+ ' + formatNumber(C) : '- ' + formatNumber(Math.abs(C))} = 0`;
      }

      const eqVectorial = `r⃗(t) = ⟨${formatNumber(x1)}, ${formatNumber(y1)}, ${formatNumber(z1)}⟩ + t⟨${formatNumber(dx)}, ${formatNumber(dy)}, ${formatNumber(dz)}⟩`;
      const signDx = dx >= 0 ? `+ ${formatNumber(dx)}t` : `- ${formatNumber(Math.abs(dx))}t`;
      const signDy = dy >= 0 ? `+ ${formatNumber(dy)}t` : `- ${formatNumber(Math.abs(dy))}t`;
      const signDz = dz >= 0 ? `+ ${formatNumber(dz)}t` : `- ${formatNumber(Math.abs(dz))}t`;
      const eqParam = `x = ${formatNumber(x1)} ${signDx}<br>y = ${formatNumber(y1)} ${signDy}<br>z = ${formatNumber(z1)} ${signDz}`;

      const eqSym = (dx !== 0 && dy !== 0 && dz !== 0)
        ? `(x ${signX1}) / ${formatNumber(dx)} = (y ${signY1}) / ${formatNumber(dy)} = (z ${z1 >= 0 ? '- ' + formatNumber(z1) : '+ ' + formatNumber(Math.abs(z1))}) / ${formatNumber(dz)}`
        : (isSlopeMode || dz === 0)
          ? `(x ${signX1}) / ${formatNumber(dx)} = (y ${signY1}) / ${formatNumber(dy)}, z = ${formatNumber(z1)}`
          : `Ecuación paramétrica requerida`;

      if (calcLineVec) calcLineVec.textContent = `⟨${formatNumber(dx)}, ${formatNumber(dy)}, ${formatNumber(dz)}⟩`;
      if (calcLineMag) calcLineMag.textContent = `${formatNumber(mag, 3)} u`;
      if (calcLineUnit) calcLineUnit.textContent = `⟨${formatNumber(unit[0], 3)}, ${formatNumber(unit[1], 3)}, ${formatNumber(unit[2], 3)}⟩`;
      if (calcLineSlope) calcLineSlope.textContent = isFinite(slopeVal) ? `m = ${slopeFrac} (${formatNumber(slopeVal, 3)}) · θ ≈ ${formatNumber(angleDeg, 1)}°` : 'm = Indefinida (90°)';
      if (calcEqPointSlope) calcEqPointSlope.textContent = eqPointSlope;
      if (calcEqGeneral) calcEqGeneral.textContent = eqGeneral;
      if (calcEqVectorial) calcEqVectorial.textContent = eqVectorial;
      if (calcEqParam) calcEqParam.innerHTML = eqParam;
      if (calcEqSym) calcEqSym.textContent = eqSym;

      return {
        p1: [x1, y1, z1],
        p2: [x2, y2, z2],
        dir: [dx, dy, dz],
        mag,
        unit,
        slope: slopeVal,
        slopeFrac,
        angleDeg,
        bVal,
        eqPointSlope,
        eqGeneral,
        eqVectorial,
        eqParam,
        eqSym,
        isSlopeMode
      };
    }

    // Compute Vector Operations Data (A & B)
    function computeVectorsData() {
      const ax = parseFloat(vAx?.value || 0);
      const ay = parseFloat(vAy?.value || 0);
      const az = parseFloat(vAz?.value || 0);
      const bx = parseFloat(vBx?.value || 0);
      const by = parseFloat(vBy?.value || 0);
      const bz = parseFloat(vBz?.value || 0);

      const a = [ax, ay, az];
      const b = [bx, by, bz];

      const normA = Math.hypot(...a);
      const normB = Math.hypot(...b);

      const dot = dotProduct(a, b);
      const cross = crossProduct(a, b);
      const normCross = Math.hypot(...cross);

      let angleDeg = 0;
      if (normA > 0 && normB > 0) {
        const cosTheta = Math.max(-1, Math.min(1, dot / (normA * normB)));
        angleDeg = Math.acos(cosTheta) * (180 / Math.PI);
      }

      let proj = [0, 0, 0];
      if (normB > 0) {
        const factor = dot / (normB * normB);
        proj = [b[0] * factor, b[1] * factor, b[2] * factor];
      }

      if (calcVecNorms) calcVecNorms.textContent = `‖A⃗‖ = ${formatNumber(normA, 3)} · ‖B⃗‖ = ${formatNumber(normB, 3)}`;
      if (calcVecDot) calcVecDot.textContent = `A⃗ · B⃗ = ${dot >= 0 ? '+' : ''}${formatNumber(dot, 3)}`;
      if (calcVecAngle) calcVecAngle.textContent = `θ = ${formatNumber(angleDeg, 2)}° (${formatNumber(angleDeg * Math.PI / 180, 3)} rad)`;

      if (calcVecRelBadge) {
        if (Math.abs(dot) < 0.001 && normA > 0 && normB > 0) {
          calcVecRelBadge.textContent = 'ORTOGONALES (A ⊥ B)';
          calcVecRelBadge.className = 'v-status-badge v-status-ortho';
        } else if ((angleDeg < 0.2 || Math.abs(angleDeg - 180) < 0.2) && normA > 0 && normB > 0) {
          calcVecRelBadge.textContent = 'PARALELOS (A ∥ B)';
          calcVecRelBadge.className = 'v-status-badge v-status-parallel';
        } else if (dot > 0) {
          calcVecRelBadge.textContent = 'ÁNGULO AGUDO';
          calcVecRelBadge.className = 'v-status-badge v-status-neutral';
        } else {
          calcVecRelBadge.textContent = 'ÁNGULO OBTUSO';
          calcVecRelBadge.className = 'v-status-badge v-status-neutral';
        }
      }

      if (calcVecCross) calcVecCross.textContent = `⟨${formatNumber(cross[0])}, ${formatNumber(cross[1])}, ${formatNumber(cross[2])}⟩`;
      if (calcVecArea) calcVecArea.textContent = `Área = ${formatNumber(normCross, 3)} u²`;
      if (calcVecTriArea) calcVecTriArea.textContent = `Área = ${formatNumber(normCross * 0.5, 3)} u²`;
      if (calcVecProj) calcVecProj.textContent = `⟨${formatNumber(proj[0], 3)}, ${formatNumber(proj[1], 3)}, ${formatNumber(proj[2], 3)}⟩`;

      return {
        a, b, normA, normB, dot, cross, normCross, angleDeg, proj
      };
    }

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

      // ── ANALYTICAL MODES RENDERING (LINE-SLOPE & VECTOR-OPS) ──
      if (activeVMode === 'line-slope') {
        const line = computeLineData();
        const cx = 170;
        const cy = 146;

        // Auto-scale to fit comfortably in viewport
        const maxCoord = Math.max(4, Math.abs(line.p1[0]), Math.abs(line.p1[1]), Math.abs(line.p1[2]), Math.abs(line.p2[0]), Math.abs(line.p2[1]), Math.abs(line.p2[2]));
        const scale = Math.min(26, 115 / maxCoord);

        // Project coordinate axes (-L to +L)
        const L = Math.ceil(maxCoord * 1.35);
        const o2d = projectPoint([0, 0, 0], rotM, cx, cy);
        const xPos2d = projectPoint([L * scale, 0, 0], rotM, cx, cy);
        const xNeg2d = projectPoint([-L * scale, 0, 0], rotM, cx, cy);
        const yPos2d = projectPoint([0, L * scale, 0], rotM, cx, cy);
        const yNeg2d = projectPoint([0, -L * scale, 0], rotM, cx, cy);
        const zPos2d = projectPoint([0, 0, L * scale], rotM, cx, cy);
        const zNeg2d = projectPoint([0, 0, -L * scale], rotM, cx, cy);

        let svgContent = '';

        // Axes grid lines
        svgContent += `<line x1="${xNeg2d.x.toFixed(1)}" y1="${xNeg2d.y.toFixed(1)}" x2="${xPos2d.x.toFixed(1)}" y2="${xPos2d.y.toFixed(1)}" stroke="#c2410c" stroke-width="1.6" stroke-opacity="0.85" />`;
        svgContent += `<text x="${(xPos2d.x + 6).toFixed(1)}" y="${(xPos2d.y + 3).toFixed(1)}" font-family="'Space Mono', monospace" font-size="10" font-weight="700" fill="#c2410c">+X</text>`;

        svgContent += `<line x1="${yNeg2d.x.toFixed(1)}" y1="${yNeg2d.y.toFixed(1)}" x2="${yPos2d.x.toFixed(1)}" y2="${yPos2d.y.toFixed(1)}" stroke="#15803d" stroke-width="1.6" stroke-opacity="0.85" />`;
        svgContent += `<text x="${(yPos2d.x - 3).toFixed(1)}" y="${(yPos2d.y - 6).toFixed(1)}" font-family="'Space Mono', monospace" font-size="10" font-weight="700" fill="#15803d">+Y</text>`;

        if (Math.abs(yaw) > 0.05 || Math.abs(pitch) > 0.05) {
          svgContent += `<line x1="${zNeg2d.x.toFixed(1)}" y1="${zNeg2d.y.toFixed(1)}" x2="${zPos2d.x.toFixed(1)}" y2="${zPos2d.y.toFixed(1)}" stroke="#1d4ed8" stroke-width="1.6" stroke-opacity="0.85" />`;
          svgContent += `<text x="${(zPos2d.x + 6).toFixed(1)}" y="${(zPos2d.y + 4).toFixed(1)}" font-family="'Space Mono', monospace" font-size="10" font-weight="700" fill="#1d4ed8">+Z</text>`;
        }

        // Infinite dashed line
        const tRange = 4.0;
        const lineStart3D = [
          (line.p1[0] - line.dir[0] * tRange) * scale,
          (line.p1[1] - line.dir[1] * tRange) * scale,
          (line.p1[2] - line.dir[2] * tRange) * scale
        ];
        const lineEnd3D = [
          (line.p1[0] + line.dir[0] * tRange) * scale,
          (line.p1[1] + line.dir[1] * tRange) * scale,
          (line.p1[2] + line.dir[2] * tRange) * scale
        ];
        const pInf1 = projectPoint(lineStart3D, rotM, cx, cy);
        const pInf2 = projectPoint(lineEnd3D, rotM, cx, cy);
        svgContent += `<line x1="${pInf1.x.toFixed(1)}" y1="${pInf1.y.toFixed(1)}" x2="${pInf2.x.toFixed(1)}" y2="${pInf2.y.toFixed(1)}" stroke="#9ca3af" stroke-width="1.2" stroke-dasharray="4 4" />`;

        // Points P1 and P2
        const pt1 = projectPoint([line.p1[0] * scale, line.p1[1] * scale, line.p1[2] * scale], rotM, cx, cy);
        const pt2 = projectPoint([line.p2[0] * scale, line.p2[1] * scale, line.p2[2] * scale], rotM, cx, cy);

        // Run & rise slope triangle
        if (line.isSlopeMode || (line.p1[2] === 0 && line.p2[2] === 0)) {
          const corner3D = [line.p2[0] * scale, line.p1[1] * scale, 0];
          const ptCorner = projectPoint(corner3D, rotM, cx, cy);
          svgContent += `<line x1="${pt1.x.toFixed(1)}" y1="${pt1.y.toFixed(1)}" x2="${ptCorner.x.toFixed(1)}" y2="${ptCorner.y.toFixed(1)}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="2.5 2.5" />`;
          svgContent += `<line x1="${ptCorner.x.toFixed(1)}" y1="${ptCorner.y.toFixed(1)}" x2="${pt2.x.toFixed(1)}" y2="${pt2.y.toFixed(1)}" stroke="#64748b" stroke-width="1.2" stroke-dasharray="2.5 2.5" />`;
          const midX = (pt1.x + pt2.x) / 2;
          const midY = (pt1.y + pt2.y) / 2;
          svgContent += `<text x="${(midX + 8).toFixed(1)}" y="${(midY - 4).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#2563eb">m=${line.slopeFrac}</text>`;
        }

        // Directed Vector line P1 -> P2
        svgContent += `<line x1="${pt1.x.toFixed(1)}" y1="${pt1.y.toFixed(1)}" x2="${pt2.x.toFixed(1)}" y2="${pt2.y.toFixed(1)}" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" />`;

        // Arrow head at P2
        const vDx = pt2.x - pt1.x;
        const vDy = pt2.y - pt1.y;
        const vLen = Math.hypot(vDx, vDy) || 1;
        const ux = vDx / vLen;
        const uy = vDy / vLen;
        const arrowLen = 10;
        const arrowWidth = 5;
        const a1x = pt2.x - ux * arrowLen - uy * arrowWidth;
        const a1y = pt2.y - uy * arrowLen + ux * arrowWidth;
        const a2x = pt2.x - ux * arrowLen + uy * arrowWidth;
        const a2y = pt2.y - uy * arrowLen - ux * arrowWidth;
        svgContent += `<polygon points="${pt2.x.toFixed(1)},${pt2.y.toFixed(1)} ${a1x.toFixed(1)},${a1y.toFixed(1)} ${a2x.toFixed(1)},${a2y.toFixed(1)}" fill="#2563eb" />`;

        // Draw Point P1
        svgContent += `<circle cx="${pt1.x.toFixed(1)}" cy="${pt1.y.toFixed(1)}" r="4.5" fill="#ffffff" stroke="#2563eb" stroke-width="2" />`;
        svgContent += `<text x="${(pt1.x + 6).toFixed(1)}" y="${(pt1.y - 6).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#0a0a0a">P₁(${formatNumber(line.p1[0])}, ${formatNumber(line.p1[1])}${line.p1[2] ? ', ' + formatNumber(line.p1[2]) : ''})</text>`;

        // Draw Point P2
        svgContent += `<circle cx="${pt2.x.toFixed(1)}" cy="${pt2.y.toFixed(1)}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" />`;
        svgContent += `<text x="${(pt2.x + 6).toFixed(1)}" y="${(pt2.y + 12).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#2563eb">P₂(${formatNumber(line.p2[0])}, ${formatNumber(line.p2[1])}${line.p2[2] ? ', ' + formatNumber(line.p2[2]) : ''})</text>`;

        // Origin
        svgContent += `<circle cx="${o2d.x.toFixed(1)}" cy="${o2d.y.toFixed(1)}" r="3" fill="#0a0a0a" />`;
        svgContent += `<text x="${(o2d.x - 12).toFixed(1)}" y="${(o2d.y - 5).toFixed(1)}" font-family="'Space Mono', monospace" font-size="8" font-weight="700" fill="#6b7280">(0,0)</text>`;

        svg.innerHTML = svgContent;
        return;
      }

      if (activeVMode === 'vector-ops') {
        const vData = computeVectorsData();
        const cx = 170;
        const cy = 146;

        const maxCoord = Math.max(4, Math.abs(vData.a[0]), Math.abs(vData.a[1]), Math.abs(vData.a[2]), Math.abs(vData.b[0]), Math.abs(vData.b[1]), Math.abs(vData.b[2]), Math.abs(vData.cross[0]), Math.abs(vData.cross[1]), Math.abs(vData.cross[2]));
        const scale = Math.min(28, 115 / maxCoord);

        const o2d = projectPoint([0, 0, 0], rotM, cx, cy);
        const ptA = projectPoint([vData.a[0] * scale, vData.a[1] * scale, vData.a[2] * scale], rotM, cx, cy);
        const ptB = projectPoint([vData.b[0] * scale, vData.b[1] * scale, vData.b[2] * scale], rotM, cx, cy);
        const ptSum = projectPoint([(vData.a[0] + vData.b[0]) * scale, (vData.a[1] + vData.b[1]) * scale, (vData.a[2] + vData.b[2]) * scale], rotM, cx, cy);
        const ptCross = projectPoint([vData.cross[0] * scale, vData.cross[1] * scale, vData.cross[2] * scale], rotM, cx, cy);
        const ptProj = projectPoint([vData.proj[0] * scale, vData.proj[1] * scale, vData.proj[2] * scale], rotM, cx, cy);

        let svgContent = '';

        // Axes
        const L = Math.ceil(maxCoord * 1.25);
        const xPos2d = projectPoint([L * scale, 0, 0], rotM, cx, cy);
        const xNeg2d = projectPoint([-L * scale, 0, 0], rotM, cx, cy);
        const yPos2d = projectPoint([0, L * scale, 0], rotM, cx, cy);
        const yNeg2d = projectPoint([0, -L * scale, 0], rotM, cx, cy);
        const zPos2d = projectPoint([0, 0, L * scale], rotM, cx, cy);
        const zNeg2d = projectPoint([0, 0, -L * scale], rotM, cx, cy);

        svgContent += `<line x1="${xNeg2d.x.toFixed(1)}" y1="${xNeg2d.y.toFixed(1)}" x2="${xPos2d.x.toFixed(1)}" y2="${xPos2d.y.toFixed(1)}" stroke="#c2410c" stroke-width="1.4" stroke-opacity="0.8" />`;
        svgContent += `<text x="${(xPos2d.x + 5).toFixed(1)}" y="${(xPos2d.y + 3).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#c2410c">+X</text>`;

        svgContent += `<line x1="${yNeg2d.x.toFixed(1)}" y1="${yNeg2d.y.toFixed(1)}" x2="${yPos2d.x.toFixed(1)}" y2="${yPos2d.y.toFixed(1)}" stroke="#15803d" stroke-width="1.4" stroke-opacity="0.8" />`;
        svgContent += `<text x="${(yPos2d.x - 3).toFixed(1)}" y="${(yPos2d.y - 5).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#15803d">+Y</text>`;

        if (Math.abs(yaw) > 0.05 || Math.abs(pitch) > 0.05) {
          svgContent += `<line x1="${zNeg2d.x.toFixed(1)}" y1="${zNeg2d.y.toFixed(1)}" x2="${zPos2d.x.toFixed(1)}" y2="${zPos2d.y.toFixed(1)}" stroke="#1d4ed8" stroke-width="1.4" stroke-opacity="0.8" />`;
          svgContent += `<text x="${(zPos2d.x + 5).toFixed(1)}" y="${(zPos2d.y + 4).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9" font-weight="700" fill="#1d4ed8">+Z</text>`;
        }

        // Parallelogram spanned by A and B
        svgContent += `<polygon points="${o2d.x.toFixed(1)},${o2d.y.toFixed(1)} ${ptA.x.toFixed(1)},${ptA.y.toFixed(1)} ${ptSum.x.toFixed(1)},${ptSum.y.toFixed(1)} ${ptB.x.toFixed(1)},${ptB.y.toFixed(1)}" fill="rgba(37, 99, 235, 0.08)" stroke="#93c5fd" stroke-width="1.2" stroke-dasharray="3 3" />`;

        // Arrow drawing helper
        function drawVectorArrow(pStart, pEnd, color, label, width = 2.4) {
          const dx = pEnd.x - pStart.x;
          const dy = pEnd.y - pStart.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const aLen = 9;
          const aW = 4.5;
          const a1x = pEnd.x - ux * aLen - uy * aW;
          const a1y = pEnd.y - uy * aLen + ux * aW;
          const a2x = pEnd.x - ux * aLen + uy * aW;
          const a2y = pEnd.y - uy * aLen - ux * aW;

          return `<line x1="${pStart.x.toFixed(1)}" y1="${pStart.y.toFixed(1)}" x2="${pEnd.x.toFixed(1)}" y2="${pEnd.y.toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" />
            <polygon points="${pEnd.x.toFixed(1)},${pEnd.y.toFixed(1)} ${a1x.toFixed(1)},${a1y.toFixed(1)} ${a2x.toFixed(1)},${a2y.toFixed(1)}" fill="${color}" />
            <text x="${(pEnd.x + ux * 6).toFixed(1)}" y="${(pEnd.y + uy * 6 + 3).toFixed(1)}" font-family="'Space Mono', monospace" font-size="9.5" font-weight="700" fill="${color}">${label}</text>`;
        }

        // Vector A (Blue)
        svgContent += drawVectorArrow(o2d, ptA, '#2563eb', 'A⃗', 2.8);

        // Vector B (Amber)
        svgContent += drawVectorArrow(o2d, ptB, '#d97706', 'B⃗', 2.8);

        // Cross Product Vector A x B (Green)
        if (vData.normCross > 0.01) {
          svgContent += drawVectorArrow(o2d, ptCross, '#16a34a', 'A⃗×B⃗', 2.2);
        }

        // Projection of A onto B
        svgContent += `<line x1="${ptA.x.toFixed(1)}" y1="${ptA.y.toFixed(1)}" x2="${ptProj.x.toFixed(1)}" y2="${ptProj.y.toFixed(1)}" stroke="#6b7280" stroke-width="1.2" stroke-dasharray="2 2" />`;
        svgContent += `<circle cx="${ptProj.x.toFixed(1)}" cy="${ptProj.y.toFixed(1)}" r="3" fill="#d97706" />`;

        // Origin
        svgContent += `<circle cx="${o2d.x.toFixed(1)}" cy="${o2d.y.toFixed(1)}" r="3.5" fill="#0a0a0a" />`;

        svg.innerHTML = svgContent;
        return;
      }

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
      pitch = Math.max(0, Math.min(1.45, startPitch - dy * 0.008));
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
        pitch = Math.min(1.45, pitch + 0.05);
        render();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        pitch = Math.max(0, pitch - 0.05);
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

    // Robust clipboard copy fallback helper
    async function copyTextToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (_) {}
      }
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        return Boolean(success);
      } catch (_) {
        return false;
      }
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
        const copied = await copyTextToClipboard(jsonStr);
        if (copied) {
          exportBtn.classList.add('is-copied');
          if (exportBtnLabel) exportBtnLabel.textContent = 'COPIED TO CLIPBOARD!';
          setTimeout(() => {
            exportBtn.classList.remove('is-copied');
            if (exportBtnLabel) exportBtnLabel.textContent = 'COPY VECTORS (JSON)';
          }, 2000);
        } else {
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

    // ── Analytical Modes: Switcher Tabs ──
    function switchMode(targetMode) {
      if (!targetMode) return;
      activeVMode = targetMode;

      modeTabs.forEach(t => {
        const m = t.dataset.mode || t.dataset.vmode;
        const isMatch = (m === activeVMode);
        t.classList.toggle('is-active', isMatch);
        t.setAttribute('aria-selected', String(isMatch));
      });

      if (paneMesh) {
        paneMesh.hidden = (activeVMode !== '3d-mesh');
        paneMesh.style.display = (activeVMode === '3d-mesh') ? 'flex' : 'none';
      }
      if (paneLine) {
        paneLine.hidden = (activeVMode !== 'line-slope');
        paneLine.style.display = (activeVMode === 'line-slope') ? 'flex' : 'none';
      }
      if (paneVecs) {
        paneVecs.hidden = (activeVMode !== 'vector-ops');
        paneVecs.style.display = (activeVMode === 'vector-ops') ? 'flex' : 'none';
      }

      if (rightMesh) {
        rightMesh.hidden = (activeVMode !== '3d-mesh');
        rightMesh.style.display = (activeVMode === '3d-mesh') ? 'flex' : 'none';
      }
      if (rightLine) {
        rightLine.hidden = (activeVMode !== 'line-slope');
        rightLine.style.display = (activeVMode === 'line-slope') ? 'flex' : 'none';
      }
      if (rightVecs) {
        rightVecs.hidden = (activeVMode !== 'vector-ops');
        rightVecs.style.display = (activeVMode === 'vector-ops') ? 'flex' : 'none';
      }

      if (viewBar) {
        const showViewBar = (activeVMode !== '3d-mesh');
        viewBar.hidden = !showViewBar;
        viewBar.style.display = showViewBar ? 'flex' : 'none';
      }

      // Camera default angles per mode
      if (activeVMode === 'line-slope') {
        if (lineSubMode === 'slope') {
          yaw = 0;
          pitch = 0;
          snapBtns.forEach(b => b.classList.toggle('is-active', b.dataset.snap === 'xy'));
        } else {
          yaw = 30 * (Math.PI / 180);
          pitch = 24 * (Math.PI / 180);
          snapBtns.forEach(b => b.classList.toggle('is-active', b.dataset.snap === '3d'));
        }
      } else if (activeVMode === 'vector-ops') {
        yaw = 38 * (Math.PI / 180);
        pitch = 26 * (Math.PI / 180);
        snapBtns.forEach(b => b.classList.toggle('is-active', b.dataset.snap === '3d'));
      } else {
        yaw = 35 * (Math.PI / 180);
        pitch = 28 * (Math.PI / 180);
      }

      render();
    }

    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetMode = tab.dataset.mode || tab.dataset.vmode;
        switchMode(targetMode);
      });
    });

    // ── Line Submode Toggles (2 Points vs Point-Slope) ──
    if (subModePointsBtn && subModeSlopeBtn) {
      subModePointsBtn.addEventListener('click', () => {
        lineSubMode = 'points';
        subModePointsBtn.classList.add('is-active');
        subModeSlopeBtn.classList.remove('is-active');
        if (p1ZWrap) {
          p1ZWrap.hidden = false;
          p1ZWrap.style.display = '';
        }
        if (p2Group) {
          p2Group.hidden = false;
          p2Group.style.display = '';
        }
        if (slopeGroup) {
          slopeGroup.hidden = true;
          slopeGroup.style.display = 'none';
        }
        render();
      });

      subModeSlopeBtn.addEventListener('click', () => {
        lineSubMode = 'slope';
        subModeSlopeBtn.classList.add('is-active');
        subModePointsBtn.classList.remove('is-active');
        if (p1ZWrap) {
          p1ZWrap.hidden = true;
          p1ZWrap.style.display = 'none';
        }
        if (p2Group) {
          p2Group.hidden = true;
          p2Group.style.display = 'none';
        }
        if (slopeGroup) {
          slopeGroup.hidden = false;
          slopeGroup.style.display = '';
        }
        // Orthogonal 2D projection on XY plane
        yaw = 0;
        pitch = 0;
        snapBtns.forEach(b => b.classList.toggle('is-active', b.dataset.snap === 'xy'));
        render();
      });
    }

    // ── Quick Camera Snap Views (3D Orbit, Plano 2D XY, Plano XZ, Reset) ──
    snapBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const snap = btn.dataset.snap;
        snapBtns.forEach(b => b.classList.toggle('is-active', b === btn));
        if (snap === '3d') {
          yaw = 35 * (Math.PI / 180);
          pitch = 26 * (Math.PI / 180);
        } else if (snap === 'xy') {
          yaw = 0;
          pitch = 0;
        } else if (snap === 'xz') {
          yaw = 0;
          pitch = 89.9 * (Math.PI / 180);
        } else if (snap === 'reset') {
          yaw = 35 * (Math.PI / 180);
          pitch = 28 * (Math.PI / 180);
        }
        render();
      });
    });

    // ── Live Calculation Triggers on Input ──
    const lineInputs = [p1X, p1Y, p1Z, p2X, p2Y, p2Z, slopeInput];
    lineInputs.forEach(inp => {
      if (inp) inp.addEventListener('input', () => render());
    });

    const vecInputs = [vAx, vAy, vAz, vBx, vBy, vBz];
    vecInputs.forEach(inp => {
      if (inp) inp.addEventListener('input', () => render());
    });

    // ── Exercise Presets: Line & Point-Slope ──
    const linePresetBtns = document.querySelectorAll('[data-linepreset]');
    linePresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.linepreset;
        if (preset === '1') {
          if (subModePointsBtn) subModePointsBtn.click();
          if (p1X) p1X.value = 2;
          if (p1Y) p1Y.value = -1;
          if (p1Z) p1Z.value = 3;
          if (p2X) p2X.value = 5;
          if (p2Y) p2Y.value = 4;
          if (p2Z) p2Z.value = 1;
        } else if (preset === '2') {
          if (subModeSlopeBtn) subModeSlopeBtn.click();
          if (p1X) p1X.value = 3;
          if (p1Y) p1Y.value = 4;
          if (slopeInput) slopeInput.value = '-3/4';
        } else if (preset === '3') {
          if (subModeSlopeBtn) subModeSlopeBtn.click();
          if (p1X) p1X.value = 0;
          if (p1Y) p1Y.value = 3;
          if (slopeInput) slopeInput.value = '1.5';
        } else if (preset === '4') {
          if (subModePointsBtn) subModePointsBtn.click();
          if (p1X) p1X.value = -3;
          if (p1Y) p1Y.value = 2;
          if (p1Z) p1Z.value = 0;
          if (p2X) p2X.value = 3;
          if (p2Y) p2Y.value = -2;
          if (p2Z) p2Z.value = 0;
        }
        render();
      });
    });

    // ── Exercise Presets: Vector Algebra ──
    const vecPresetBtns = document.querySelectorAll('[data-vecpreset]');
    vecPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.vecpreset;
        if (preset === 'ortho') {
          if (vAx) vAx.value = 3;
          if (vAy) vAy.value = -2;
          if (vAz) vAz.value = 2;
          if (vBx) vBx.value = 2;
          if (vBy) vBy.value = 1;
          if (vBz) vBz.value = -2;
        } else if (preset === 'cross') {
          if (vAx) vAx.value = 3;
          if (vAy) vAy.value = 0;
          if (vAz) vAz.value = 0;
          if (vBx) vBx.value = 0;
          if (vBy) vBy.value = 4;
          if (vBz) vBz.value = 0;
        } else if (preset === 'angle') {
          if (vAx) vAx.value = 2;
          if (vAy) vAy.value = 2;
          if (vAz) vAz.value = 0;
          if (vBx) vBx.value = 4;
          if (vBy) vBy.value = 0;
          if (vBz) vBz.value = 0;
        } else if (preset === 'parallel') {
          if (vAx) vAx.value = 2;
          if (vAy) vAy.value = -3;
          if (vAz) vAz.value = 4;
          if (vBx) vBx.value = 4;
          if (vBy) vBy.value = -6;
          if (vBz) vBz.value = 8;
        }
        render();
      });
    });

    // ── Copy Line Procedure to Clipboard ──
    if (vCopyLineBtn) {
      vCopyLineBtn.addEventListener('click', async () => {
        const line = computeLineData();
        const textReport = [
          '==================================================',
          'RESOLUCIÓN ANALÍTICA DE RECTA Y PUNTO-PENDIENTE',
          'Curso: Álgebra Lineal y Geometría Analítica (UVG)',
          '==================================================',
          '',
          '1. DATOS INICIALES:',
          `   Punto P₁: (${line.p1[0]}, ${line.p1[1]}${line.p1[2] ? ', ' + line.p1[2] : ''})`,
          line.isSlopeMode
            ? `   Pendiente dada: m = ${line.slopeFrac} (${formatNumber(line.slope, 4)})`
            : `   Punto P₂: (${line.p2[0]}, ${line.p2[1]}${line.p2[2] ? ', ' + line.p2[2] : ''})`,
          '',
          '2. VECTOR DIRECTOR (v⃗ = P₂ - P₁):',
          `   v⃗ = ⟨${formatNumber(line.dir[0])}, ${formatNumber(line.dir[1])}, ${formatNumber(line.dir[2])}⟩`,
          '',
          '3. DISTANCIA / NORMA EUCLIDIANA:',
          `   ‖v⃗‖ = √(${formatNumber(line.dir[0])}² + ${formatNumber(line.dir[1])}² + ${formatNumber(line.dir[2])}²) = ${formatNumber(line.mag, 4)} u`,
          '',
          '4. VECTOR UNITARIO DIRECCIONAL:',
          `   û = v⃗ / ‖v⃗‖ = ⟨${formatNumber(line.unit[0], 4)}, ${formatNumber(line.unit[1], 4)}, ${formatNumber(line.unit[2], 4)}⟩`,
          '',
          '5. PENDIENTE 2D E INCLINACIÓN:',
          `   m = Δy / Δx = ${line.slopeFrac} (${formatNumber(line.slope, 4)})`,
          `   Ángulo de inclinación: θ = arctan(m) = ${formatNumber(line.angleDeg, 2)}°`,
          '',
          '6. FORMA PUNTO-PENDIENTE (2D):',
          `   ${line.eqPointSlope}`,
          '',
          '7. FORMA GENERAL DE LA RECTA (Ax + By + C = 0):',
          `   ${line.eqGeneral}`,
          '',
          '8. ECUACIÓN VECTORIAL DE LA RECTA (3D):',
          `   ${line.eqVectorial}`,
          '',
          '9. ECUACIONES PARAMÉTRICAS (3D):',
          `   ${line.eqParam.replace(/<br>/g, '\n   ')}`,
          '',
          '10. ECUACIONES SIMÉTRICAS (3D):',
          `   ${line.eqSym}`,
          '==================================================',
          'Generado con NyxAnd Vector Studio · Verificación Universitaria'
        ].join('\n');

        const copied = await copyTextToClipboard(textReport);
        if (copied) {
          vCopyLineBtn.classList.add('is-copied');
          if (vCopyLineLabel) vCopyLineLabel.textContent = '¡COPIADO AL PORTAPAPELES!';
          setTimeout(() => {
            vCopyLineBtn.classList.remove('is-copied');
            if (vCopyLineLabel) vCopyLineLabel.textContent = 'COPIAR PROCEDIMIENTO';
          }, 2000);
        } else {
          if (vCopyLineLabel) vCopyLineLabel.textContent = 'ERROR AL COPIAR';
        }
      });
    }

    // ── Copy Vector Ops Procedure to Clipboard ──
    if (vCopyVecBtn) {
      vCopyVecBtn.addEventListener('click', async () => {
        const vData = computeVectorsData();
        const textReport = [
          '==================================================',
          'VERIFICACIÓN DE ÁLGEBRA VECTORIAL Y OPERACIONES',
          'Curso: Álgebra Lineal y Geometría Analítica (UVG)',
          '==================================================',
          '',
          '1. VECTORES DADOS:',
          `   A⃗ = ⟨${vData.a.join(', ')}⟩`,
          `   B⃗ = ⟨${vData.b.join(', ')}⟩`,
          '',
          '2. NORMAS (MAGNITUDES):',
          `   ‖A⃗‖ = √(${vData.a[0]}² + ${vData.a[1]}² + ${vData.a[2]}²) = ${formatNumber(vData.normA, 4)} u`,
          `   ‖B⃗‖ = √(${vData.b[0]}² + ${vData.b[1]}² + ${vData.b[2]}²) = ${formatNumber(vData.normB, 4)} u`,
          '',
          '3. PRODUCTO ESCALAR (DOT PRODUCT):',
          `   A⃗ · B⃗ = (${vData.a[0]})(${vData.b[0]}) + (${vData.a[1]})(${vData.b[1]}) + (${vData.a[2]})(${vData.b[2]}) = ${formatNumber(vData.dot, 4)}`,
          '',
          '4. ÁNGULO ENTRE VECTORES:',
          `   cos(θ) = (A⃗ · B⃗) / (‖A⃗‖ · ‖B⃗‖) = ${formatNumber(vData.normA * vData.normB > 0 ? vData.dot / (vData.normA * vData.normB) : 0, 4)}`,
          `   θ = ${formatNumber(vData.angleDeg, 2)}° (${formatNumber(vData.angleDeg * Math.PI / 180, 4)} rad)`,
          `   Diagnóstico: ${calcVecRelBadge?.textContent || ''}`,
          '',
          '5. PRODUCTO VECTORIAL (CROSS PRODUCT / VECTOR NORMAL):',
          `   A⃗ × B⃗ = |  i   j   k  |`,
          `            | ${vData.a[0]}  ${vData.a[1]}  ${vData.a[2]} |`,
          `            | ${vData.b[0]}  ${vData.b[1]}  ${vData.b[2]} |`,
          `   A⃗ × B⃗ = ⟨${vData.cross[0]}, ${vData.cross[1]}, ${vData.cross[2]}⟩`,
          '',
          '6. ÁREAS GEOMÉTRICAS:',
          `   Área del Paralelogramo = ‖A⃗ × B⃗‖ = ${formatNumber(vData.normCross, 4)} u²`,
          `   Área del Triángulo = ½ ‖A⃗ × B⃗‖ = ${formatNumber(vData.normCross * 0.5, 4)} u²`,
          '',
          '7. PROYECCIÓN ORTOGONAL DE A⃗ SOBRE B⃗:',
          `   proy_B(A) = [(A⃗ · B⃗) / ‖B⃗‖²] · B⃗`,
          `   proy_B(A) = ⟨${formatNumber(vData.proj[0], 4)}, ${formatNumber(vData.proj[1], 4)}, ${formatNumber(vData.proj[2], 4)}⟩`,
          '==================================================',
          'Generado con NyxAnd Vector Studio · Verificación Universitaria'
        ].join('\n');

        const copied = await copyTextToClipboard(textReport);
        if (copied) {
          vCopyVecBtn.classList.add('is-copied');
          if (vCopyVecLabel) vCopyVecLabel.textContent = '¡COPIADO AL PORTAPAPELES!';
          setTimeout(() => {
            vCopyVecBtn.classList.remove('is-copied');
            if (vCopyVecLabel) vCopyVecLabel.textContent = 'COPIAR PROCEDIMIENTO';
          }, 2000);
        } else {
          if (vCopyVecLabel) vCopyVecLabel.textContent = 'ERROR AL COPIAR';
        }
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
