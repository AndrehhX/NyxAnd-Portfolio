// ========================================================
//  ALPINE WEATHER ENGINE & 3D SIMULATION (THREE.JS)
// ========================================================

(function () {
  'use strict';

  // ── 1. PROCEDURAL NOISE ENGINE (SIMPLEX / FBM) ──────────
  // Fast 2D Simplex Noise implementation
  const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  const p = new Uint8Array(512);
  const perm = new Uint8Array(512);
  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  // Seed permutation table
  const basePerm = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  for (let i = 0; i < 256; i++) {
    p[i] = basePerm[i];
    p[256 + i] = basePerm[i];
  }

  function simplex2(xin, yin) {
    let n0 = 0, n1 = 0, n2 = 0;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = p[ii + p[jj]] % 12;
    const gi1 = p[ii + i1 + p[jj + j1]] % 12;
    const gi2 = p[ii + 1 + p[jj + 1]] % 12;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }

  // Fractal Brownian Motion for realistic mountain ridges
  function mountainFBM(x, y) {
    let elevation = 0;
    let amplitude = 1.0;
    let frequency = 0.025;

    // Octave 1: Main peak structure
    let n = simplex2(x * frequency, y * frequency);
    // Billowy / ridged transformation: sharp arêtes like the Matterhorn
    n = 1.0 - Math.abs(n);
    elevation += n * n * amplitude * 18.0;

    // Octave 2: Mid ridges
    amplitude *= 0.5;
    frequency *= 2.1;
    n = simplex2((x + 40) * frequency, (y + 40) * frequency);
    n = 1.0 - Math.abs(n);
    elevation += n * amplitude * 12.0;

    // Octave 3: Craggy rocky details
    amplitude *= 0.45;
    frequency *= 2.2;
    elevation += simplex2(x * frequency, y * frequency) * amplitude * 8.0;

    // Octave 4: Micro rocks
    amplitude *= 0.4;
    frequency *= 2.4;
    elevation += simplex2(x * frequency, y * frequency) * amplitude * 3.5;

    // Shift high peak towards the right like the reference image
    const biasX = (x + 10) * 0.035;
    const peakBias = Math.exp(-biasX * biasX) * 10.0;
    elevation += peakBias;

    return Math.max(0, elevation);
  }


  // ── 2. STATE & SIMULATION CONTROLS ─────────────────────
  const simState = {
    stormIntensity: 0.65, // 0 (calm) -> 1 (heavy storm)
    cameraOrbit: 0.45,    // Orbit angle around mountains
    cameraPitch: 0.35,    // Elevation
    windSpeed: 0.70,      // Fog & rain wind velocity
    fogDensity: 0.65,
    isAudioActive: false,
    lightningTimer: 0,
    fps: 60
  };


  // ── 3. THREE.JS SCENE SETUP ────────────────────────────
  const canvas = document.getElementById('alpineCanvas');
  const container = document.getElementById('canvasViewport');
  if (!canvas || !container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdde3ea);
  scene.fog = new THREE.FogExp2(0xdde3ea, 0.012);

  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.5, 400);
  camera.position.set(0, 18, 55);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;


  // ── 4. LIGHTING ────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xcfd7e3, 0.9);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff5ea, 1.35);
  sunLight.position.set(-35, 45, 30);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0xadc4db, 0.65);
  rimLight.position.set(40, 20, -30);
  scene.add(rimLight);


  // ── 5. 3D MOUNTAIN ASSET (REAL GLB MODEL + PROCEDURAL FALLBACK) ──
  const terrainGroup = new THREE.Group();
  scene.add(terrainGroup);

  // Procedural Fallback Mesh
  const gridW = 110;
  const gridD = 110;
  const segments = 140;

  const terrainGeom = new THREE.PlaneGeometry(gridW, gridD, segments, segments);
  terrainGeom.rotateX(-Math.PI * 0.5);

  const posAttr = terrainGeom.attributes.position;
  const colors = [];
  const colorSnow = new THREE.Color(0xf6f7f9);
  const colorRockDark = new THREE.Color(0x282b30);
  const colorRockLight = new THREE.Color(0x565c66);
  const colorForest = new THREE.Color(0xb2893d); // Golden amber alpine pines
  const colorForestDark = new THREE.Color(0x6e5628);
  const colorValley = new THREE.Color(0x6a707a);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = mountainFBM(x, z);
    posAttr.setY(i, y);
  }
  terrainGeom.computeVertexNormals();

  const normalAttr = terrainGeom.attributes.normal;
  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    const ny = normalAttr.getY(i);
    const slope = 1.0 - ny;

    const c = new THREE.Color();
    if (y > 22 && slope < 0.45) {
      c.copy(colorSnow);
      c.lerp(colorRockLight, slope * 0.8);
    } else if (slope > 0.48) {
      c.copy(colorRockDark);
      c.lerp(colorRockLight, Math.min(1, y / 28));
    } else if (y > 6 && y <= 22) {
      c.copy(colorForest);
      c.lerp(colorForestDark, slope);
    } else {
      c.copy(colorValley);
      c.lerp(colorForestDark, Math.min(1, y / 8));
    }
    colors.push(c.r, c.g, c.b);
  }

  terrainGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.05
  });

  const proceduralMesh = new THREE.Mesh(terrainGeom, terrainMat);
  proceduralMesh.position.set(0, -6, 0);
  terrainGroup.add(proceduralMesh);

  // Load Real 3D Photorealistic Mountain Asset (GLTF/GLB)
  let realMountainModel = null;
  if (typeof THREE.GLTFLoader !== 'undefined') {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(
      '../assets/models/mountain.glb',
      gltf => {
        realMountainModel = gltf.scene;

        // Auto-scale and orient to match reference image framing
        const box = new THREE.Box3().setFromObject(realMountainModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const targetWidth = 115;
        const scale = targetWidth / Math.max(size.x, size.z);
        realMountainModel.scale.setScalar(scale);

        // Center mountain peak
        realMountainModel.position.x = -center.x * scale + 6;
        realMountainModel.position.y = -center.y * scale - 7;
        realMountainModel.position.z = -center.z * scale - 10;
        realMountainModel.rotation.y = -0.55;

        realMountainModel.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.88;
              child.material.metalness = 0.06;
              if (child.material.map) {
                child.material.map.encoding = THREE.sRGBEncoding;
              }
            }
          }
        });

        // Swap procedural fallback with real 3D mountain model
        terrainGroup.clear();
        terrainGroup.add(realMountainModel);

        const statusLabel = document.querySelector('.sim-status-chip span:last-child');
        if (statusLabel) statusLabel.textContent = 'Photoreal 3D Mountain Active';
      },
      undefined,
      err => {
        console.warn('GLTFLoader loading error, keeping procedural mesh:', err);
      }
    );
  }


  // ── 6. VOLUMETRIC VALLEY MIST / FOG LAYERS ─────────────
  // Create 4 layered mist sheets that drift with wind
  const mistGroup = new THREE.Group();
  const mistCanvas = document.createElement('canvas');
  mistCanvas.width = 256;
  mistCanvas.height = 256;
  const mCtx = mistCanvas.getContext('2d');
  const mGrad = mCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
  mGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  mGrad.addColorStop(0.5, 'rgba(240, 245, 250, 0.2)');
  mGrad.addColorStop(1, 'rgba(240, 245, 250, 0)');
  mCtx.fillStyle = mGrad;
  mCtx.fillRect(0, 0, 256, 256);

  const mistTex = new THREE.CanvasTexture(mistCanvas);
  mistTex.wrapS = THREE.RepeatWrapping;
  mistTex.wrapT = THREE.RepeatWrapping;

  const mistPlanes = [];
  for (let i = 0; i < 6; i++) {
    const mistMat = new THREE.MeshBasicMaterial({
      map: mistTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const mistPlane = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), mistMat);
    mistPlane.rotation.x = -Math.PI * 0.42;
    mistPlane.position.set((i - 2.5) * 14, 2 + i * 1.8, 4 + i * 4);
    mistGroup.add(mistPlane);
    mistPlanes.push(mistPlane);
  }
  scene.add(mistGroup);


  // ── 7. GPU-INSTANCED RAIN PARTICLES ────────────────────
  const rainCount = 14000;
  const rainGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 3);
  const rainMat = new THREE.MeshBasicMaterial({
    color: 0x9fb3c8,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });

  const rainMesh = new THREE.InstancedMesh(rainGeom, rainMat, rainCount);
  const dummy = new THREE.Object3D();
  const rainVelocities = new Float32Array(rainCount);
  const rainOffsets = new Float32Array(rainCount * 3);

  for (let i = 0; i < rainCount; i++) {
    const rx = (Math.random() - 0.5) * 80;
    const ry = Math.random() * 40 + 5;
    const rz = (Math.random() - 0.5) * 80;

    rainOffsets[i * 3] = rx;
    rainOffsets[i * 3 + 1] = ry;
    rainOffsets[i * 3 + 2] = rz;
    rainVelocities[i] = 22 + Math.random() * 14;

    dummy.position.set(rx, ry, rz);
    dummy.updateMatrix();
    rainMesh.setMatrixAt(i, dummy.matrix);
  }
  scene.add(rainMesh);


  // ── 8. PROCEDURAL WEB AUDIO API (THUNDER & WIND) ───────
  let audioCtx = null;
  let windGain = null;
  let windFilter = null;
  let rainGain = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Wind Generator (Filtered White Noise)
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      windFilter = audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 260;
      windFilter.Q.value = 3.5;

      windGain = audioCtx.createGain();
      windGain.gain.value = 0.0;

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(audioCtx.destination);
      whiteNoise.start(0);

      // Rain Patter Generator
      const rainNoise = audioCtx.createBufferSource();
      rainNoise.buffer = noiseBuffer;
      rainNoise.loop = true;

      const rainFilter = audioCtx.createBiquadFilter();
      rainFilter.type = 'highpass';
      rainFilter.frequency.value = 1400;

      rainGain = audioCtx.createGain();
      rainGain.gain.value = 0.0;

      rainNoise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(audioCtx.destination);
      rainNoise.start(0);

      simState.isAudioActive = true;
    } catch (_) {}
  }

  // Synthesize realistic thunder crash with exponential decay
  function playProceduralThunder() {
    if (!audioCtx || !simState.isAudioActive) return;
    const now = audioCtx.currentTime;

    const thunderLen = audioCtx.sampleRate * 2.5;
    const tBuf = audioCtx.createBuffer(1, thunderLen, audioCtx.sampleRate);
    const data = tBuf.getChannelData(0);
    let lastOut = 0;
    // Brown noise for deep heavy bass
    for (let i = 0; i < thunderLen; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const tSource = audioCtx.createBufferSource();
    tSource.buffer = tBuf;

    const tFilter = audioCtx.createBiquadFilter();
    tFilter.type = 'lowpass';
    tFilter.frequency.setValueAtTime(140, now);
    tFilter.frequency.exponentialRampToValueAtTime(55, now + 2.2);

    const tGain = audioCtx.createGain();
    tGain.gain.setValueAtTime(0.01, now);
    tGain.gain.linearRampToValueAtTime(0.65, now + 0.08); // Sharp strike
    tGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4); // Long rolling decay

    tSource.connect(tFilter);
    tFilter.connect(tGain);
    tGain.connect(audioCtx.destination);
    tSource.start(now);
  }


  // ── 9. DYNAMIC LIGHTNING CONTROLLER ────────────────────
  const flashOverlay = document.getElementById('lightningFlash');

  function triggerLightning() {
    // Screen flash
    if (flashOverlay) {
      flashOverlay.style.opacity = '0.9';
      setTimeout(() => { flashOverlay.style.opacity = '0.2'; }, 60);
      setTimeout(() => { flashOverlay.style.opacity = '0.75'; }, 110);
      setTimeout(() => { flashOverlay.style.opacity = '0'; }, 220);
    }

    // Flash scene lighting
    const origSunColor = sunLight.color.getHex();
    const origSunIntensity = sunLight.intensity;
    const origAmbientIntensity = ambientLight.intensity;

    sunLight.color.setHex(0xe8f0ff);
    sunLight.intensity = 3.8;
    ambientLight.intensity = 2.0;

    setTimeout(() => {
      sunLight.color.setHex(origSunColor);
      sunLight.intensity = origSunIntensity;
      ambientLight.intensity = origAmbientIntensity;
    }, 220);

    // Audio thunder boom with physical acoustic delay
    setTimeout(playProceduralThunder, 180 + Math.random() * 300);
  }


  // ── 10. ROTARY DIAL INTERACTION ENGINE ─────────────────
  function setupRotaryDial(dialEl, onChange) {
    if (!dialEl) return;
    let isSpinning = false;
    let startY = 0;
    let currentAngle = 0;

    dialEl.addEventListener('pointerdown', e => {
      isSpinning = true;
      startY = e.clientY;
      dialEl.setPointerCapture(e.pointerId);
    });

    dialEl.addEventListener('pointermove', e => {
      if (!isSpinning) return;
      const dy = startY - e.clientY;
      startY = e.clientY;
      currentAngle += dy * 1.5;
      const disc = dialEl.querySelector('.sim-dial-sectors');
      if (disc) disc.style.transform = `rotate(${currentAngle}deg)`;
      onChange(currentAngle);
    });

    const stop = e => {
      if (!isSpinning) return;
      isSpinning = false;
      try { dialEl.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    dialEl.addEventListener('pointerup', stop);
    dialEl.addEventListener('pointercancel', stop);
  }

  // Dial 1: Orbit Camera Angle
  const dialCamera = document.getElementById('dialCamera');
  setupRotaryDial(dialCamera, angle => {
    simState.cameraOrbit = (angle * Math.PI) / 180;
  });

  // Dial 2: Storm Intensity
  const dialStorm = document.getElementById('dialStorm');
  const dialStormVal = document.getElementById('dialStormVal');
  const gaugeArc = document.getElementById('gaugeArc');
  const gaugeVal = document.getElementById('gaugeVal');

  setupRotaryDial(dialStorm, angle => {
    let normalized = Math.max(0, Math.min(100, (angle % 360 + 360) % 360 / 3.6));
    simState.stormIntensity = normalized / 100;

    if (dialStormVal) dialStormVal.textContent = Math.round(normalized);
    if (gaugeVal) gaugeVal.textContent = Math.round(normalized);
    if (gaugeArc) {
      // Circumference for r=30 is ~188.5
      const offset = 188.5 * (1 - simState.stormIntensity);
      gaugeArc.style.strokeDashoffset = offset.toFixed(1);
    }

    // Update level fills on left panel
    const stormFill = document.getElementById('levelStormFill');
    if (stormFill) stormFill.style.width = `${normalized}%`;
  });

  // Camera Drag in 3D Canvas
  let isCanvasDragging = false;
  let cStartX = 0, cStartY = 0;
  let cStartOrbit = simState.cameraOrbit;
  let cStartPitch = simState.cameraPitch;

  container.addEventListener('pointerdown', e => {
    isCanvasDragging = true;
    cStartX = e.clientX;
    cStartY = e.clientY;
    cStartOrbit = simState.cameraOrbit;
    cStartPitch = simState.cameraPitch;
    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', e => {
    if (!isCanvasDragging) return;
    const dx = e.clientX - cStartX;
    const dy = e.clientY - cStartY;
    simState.cameraOrbit = cStartOrbit - dx * 0.01;
    simState.cameraPitch = Math.max(0.12, Math.min(0.85, cStartPitch + dy * 0.008));
  });

  const stopCanvasDrag = e => {
    if (!isCanvasDragging) return;
    isCanvasDragging = false;
    try { container.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  container.addEventListener('pointerup', stopCanvasDrag);
  container.addEventListener('pointercancel', stopCanvasDrag);

  // Audio Toggle Button
  const audioBtn = document.getElementById('audioBtn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!audioCtx) initAudio();
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      simState.isAudioActive = !simState.isAudioActive;
      audioBtn.classList.toggle('is-active', simState.isAudioActive);
      const label = audioBtn.querySelector('span');
      if (label) label.textContent = simState.isAudioActive ? 'AUDIO ON' : 'AUDIO OFF';
    });
  }


  // ── 11. ANIMATION & SIMULATION TICK LOOP ────────────────
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = performance.now();
  const fpsDisplay = document.getElementById('fpsCounter');

  function animate(now) {
    requestAnimationFrame(animate);
    const delta = Math.min(0.06, (now - lastTime) * 0.001);
    lastTime = now;

    // FPS Meter
    frameCount++;
    if (now - fpsTimer >= 1000) {
      simState.fps = frameCount;
      if (fpsDisplay) fpsDisplay.textContent = `${simState.fps} FPS`;
      frameCount = 0;
      fpsTimer = now;
    }

    // 1. Update Camera Position based on orbit and pitch
    const dist = 52;
    const camX = Math.sin(simState.cameraOrbit) * dist * Math.cos(simState.cameraPitch);
    const camZ = Math.cos(simState.cameraOrbit) * dist * Math.cos(simState.cameraPitch);
    const camY = Math.sin(simState.cameraPitch) * dist + 4;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(2, 8, 0);

    // 2. Animate Mist Layers
    const windSpeed = 1.2 + simState.windSpeed * 4.0;
    mistPlanes.forEach((plane, i) => {
      plane.position.x += delta * windSpeed * (0.8 + i * 0.2);
      if (plane.position.x > 45) plane.position.x = -45;
    });

    // 3. Dynamic Weather Adjustments (Sunny <-> Storm)
    const storm = simState.stormIntensity;

    // Sky and fog darkening
    const clearSky = new THREE.Color(0xdce3ea);
    const stormSky = new THREE.Color(0x38414d);
    scene.background.copy(clearSky).lerp(stormSky, storm);
    scene.fog.color.copy(scene.background);
    scene.fog.density = 0.010 + storm * 0.018;

    // Sunlight intensity drops during storm
    sunLight.intensity = (1.35 * (1 - storm * 0.75));
    sunLight.color.setHex(storm > 0.5 ? 0xaec0d4 : 0xfff5ea);
    ambientLight.intensity = (0.9 * (1 - storm * 0.45));

    // 4. Animate Rain Particles
    const rainSlant = 0.28 + storm * 0.35;
    rainMat.opacity = THREE.MathUtils.lerp(0.0, 0.45, Math.max(0, (storm - 0.15) * 1.2));

    if (rainMat.opacity > 0.01) {
      for (let i = 0; i < rainCount; i++) {
        let rx = rainOffsets[i * 3];
        let ry = rainOffsets[i * 3 + 1];
        let rz = rainOffsets[i * 3 + 2];

        ry -= rainVelocities[i] * delta * (0.8 + storm * 0.6);
        rx += rainSlant * 8 * delta;

        // Recycle if below terrain level
        if (ry < -4) {
          ry = 38 + Math.random() * 8;
          rx = (Math.random() - 0.5) * 80;
        }

        rainOffsets[i * 3] = rx;
        rainOffsets[i * 3 + 1] = ry;

        dummy.position.set(rx, ry, rz);
        dummy.rotation.z = -rainSlant;
        dummy.updateMatrix();
        rainMesh.setMatrixAt(i, dummy.matrix);
      }
      rainMesh.instanceMatrix.needsUpdate = true;
    }

    // 5. Stochastic Lightning Trigger (Only during storm)
    if (storm > 0.4) {
      simState.lightningTimer += delta;
      // High storm intensity triggers lightning every 3 to 7 seconds
      const nextStrikeTime = 7.0 - (storm * 3.5);
      if (simState.lightningTimer > nextStrikeTime) {
        simState.lightningTimer = 0;
        triggerLightning();
      }
    }

    // 6. Update Web Audio API sound synthesis
    if (audioCtx && simState.isAudioActive) {
      if (windFilter && windGain) {
        windFilter.frequency.value = 180 + storm * 650;
        windGain.gain.value = 0.05 + storm * 0.32;
      }
      if (rainGain) {
        rainGain.gain.value = Math.max(0, (storm - 0.2) * 0.4);
      }
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

})();
