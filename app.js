    import * as THREE from 'three';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
    import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
    import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
    import { KTX2Loader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/KTX2Loader.js';
    import { MeshoptDecoder } from 'meshopt-decoder';
    import { Conversation } from '@elevenlabs/client';

    // ---------- CONFIG ----------
    const AGENT_ID = 'agent_5501k5ckwydxem1s0sdzjj17ej9m';
    const WP_BASE = 'https://test-ai.garabatoweb.com';
    const GLB_URL = './exp3test.glb';

    // === TEXTURAS / CAJA ===
    const BOX_URL = './caja.glb';
    const BOX_TEXTURE_URL = './T_Side_Box_BaseColor.png';
    const BOX_TEXTURE_REPEAT = { x: 1, y: 1 };
    const BOX_USE_TRANSPARENCY = false;
    const BOX_OPACITY = 1.0;

    const TEETH_TEXTURE_URL = './T_Theets_BaseColor.png';

    const BOX_SCALE = { x: 0.51, y: 0.27, z: 1.00 };
    const BOX_OFFSET_MODE = 'ratio';
    const BOX_OFFSET = { x: 0.00, y: 0.36, z: 0.00 };
    const BOX_WIREFRAME = false;
    const BOX_ROT_INIT = { x: 0, y: 0, z: 0, degrees: false };

    // === PUERTA ===
    const DOOR_HINTS = ['Puerta', 'PUERTA', 'Door', 'DOOR'];
    const DOOR_ALIGN = 'none';
    const DOOR_OFFSET_MODE = 'ratio';
    const DOOR_OFFSET = { x: 0.0, y: 0.90, z: 0.0 };

    // === LIPSYNC: modo fijo a clip ===
    const talkSource = 'clip'; // <-- solo clip

    const TALK_NAME_HINTS = ['talk', 'habla', 'speak', 'lip', 'mouth', 'viseme', 'phoneme'];

    const ENABLE_IDLE_SWAY = false;
    const USE_MIXER_MOUTH = true;
    const MOUTH_MIXER_WHEN_TALK = 0.20;
    const MOUTH_MIXER_WHEN_SILENT = 0.50;

    const ALWAYS_CENTER_INIT = true;
    const VIEW = { faceFront: true, targetYOffsetRatio: 0.36, fitPadding: 0.65, extraBack: 0.34, targetXOffsetRatio: 0.10 };
    const FOV = 40;
    const FIGURE_TILT_DEG = { x: -12, y: 0, z: 0 };

    // --- LENGUA (límites seguros)
    const TONGUE_CFG = {
      MIN_OPEN: 0.28, CURL_DEG: 14, WAG_DEG: 4, WAG_SPD: 2.6,
      ALLOW_FORWARD: true, MAX_FORWARD: 0.006, UP_OFFSET: 0.010,
      SAFETY_CLEARANCE: 0.003
    };

    // Ajustes varios
    const LIGHT_SCALE = 0.60;
    const CHEEK_SILENT_DAMP = 0.90;

    const HEAD_IDLE = {
      enabled: true,
      amp: { pitch: 0.035, yaw: 0.030, roll: 0.015 },
      speed: { pitch: 0.50, yaw: 0.37, roll: 0.41 },
      talkDamp: 0.5
    };

    // -------- Labios / dientes (parámetros clave) --------
    // (a) Convergencia labios: inferior sube / superior baja
    const LIP_CONVERGE = {
      enabled: true,
      lowerUpY: 0.0,     // cuánto sube el inferior (unidades de tu rig)
      upperDownY: 0.2,   // cuánto baja el superior
      rotDeg: 4,         // leve pitch para “sellar”
      curve: 1.0        // énfasis cuando la apertura es pequeña
    };

    // (b) “Arranque desde silencio” del labio inferior (suaviza lift inicial)
    const LOWER_LIP_LOCK_BASE = {
      enabled: true,
      untilOpen: 0.20,    // hasta este open (0..1) partimos desde base
      ease: 0.6           // 0..1: cómo se mezcla hacia anim
    };

    // (c) Teeth lock: evita rotaciones/derivas fuertes
    const TEETH_LOCK = {
      enabled: true,
      lockRot: true,
      lockPosZ: true,
      startAtOpen: 0.0,
      endAtOpen: 0.00,   // se suelta gradualmente al abrir
      zMax: 0.004        // máximo desplazamiento Z desde la pose de reposo
    };

    // (d) Clamp para que los labios NO salgan hacia afuera (X/Z)
    const LIP_OUTWARD_CLAMP = {
      enabled: true,
      up: { maxDX: 0.006, maxDZ: 0.004 }, // superior
      down: { maxDX: 0.005, maxDZ: 0.004 }  // inferior
    };

    // (e) Offsets finos “pose de silencio”
    const SILENT_BIAS = {
      up: { x: -0.006, y: 0.001, z: 0.000, zDeg: 2.0 },
      down: { x: -0.005, y: -0.002, z: 0.000, zDeg: -1.5 }
    };

    // --------- Mandíbula / dientes dinamicos ----------
    let LIP_DOWN_DROP = 1.15;
    let TEETH_FOLLOW = {
      lowerDownY: 0.004,
      lowerBackZ: 0.920,
      lowerRotDeg: 3.5,
      upperUpY: 0.0015,
      upperRotDeg: 1.2
    };

    let JAW_CENTER = {
      biasXPerRad: -0.15,
      alsoTeethAndLowerLip: true,
      hardLockXZ: true
    };

    // Base upper lip local correction
    const LIP_UP_LOCAL_BIAS = { x: -0.012, y: 0.000, z: 0.000 };
    const LIP_UP_LOCAL_ROT = { xDeg: 0.0, yDeg: 0.0, zDeg: 5.0 };
    const LIP_UP_BASE = {
      center: { x: 99.00, y: 0.00, z: 0.00, xDeg: 0.0, yDeg: 0.0, zDeg: -66.0 },
      left: { x: 0.00, y: 0.99, z: 0.00, xDeg: 0.0, yDeg: 0.0, zDeg: -6.0 },
      right: { x: 0.00, y: 0.00, z: 0.00, xDeg: 0.0, yDeg: 0.0, zDeg: -6.0 }
    };

    const UPPER_LIP_SIDE = {
      enableRuntimeFix: true,
      lockAxes: { x: true, y: false, z: false },
      lockRot: { yaw: true, roll: true },
      offsetX: -0.012,
      followOpenScale: 1.0
    };


    // ---------- RENDERER / ESCENA ----------
    const canvas = document.getElementById('stage');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, /Mobi|Android/i.test(navigator.userAgent) ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.85;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(/Mobi|Android/i.test(navigator.userAgent) ? 40 : FOV, 1, 0.01, 1000);
    camera.position.set(3, 1.6, 4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.enablePan = false; controls.enableZoom = false;

    const pivot = new THREE.Group();
    scene.add(pivot);

    const PIVOT_BASE_POS = new THREE.Vector3(0, 0, 0);

    function fitCanvas43() {
      const W = window.innerWidth, H = window.innerHeight, targetAR = 4 / 3;
      let wEff, hEff;
      if (W / H > targetAR) { hEff = H; wEff = Math.round(hEff * targetAR); }
      else { wEff = W; hEff = Math.round(wEff / targetAR); }
      renderer.setSize(wEff, hEff, false);
      canvas.style.left = ((W - wEff) >> 1) + 'px';
      canvas.style.top = ((H - hEff) >> 1) + 'px';
      canvas.style.right = 'auto'; canvas.style.bottom = 'auto';
      canvas.style.width = wEff + 'px'; canvas.style.height = hEff + 'px';
      camera.aspect = wEff / hEff;
      camera.fov = /Mobi|Android/i.test(navigator.userAgent) ? 40 : FOV;
      camera.updateProjectionMatrix();
    }
    canvas.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => window.addEventListener(ev, e => e.preventDefault(), { passive: false }));

    let avatar = null;

    // Caja refs
    let containerBox = null, containerBoxPivot = null;

    // Texturas
    const texLoader = new THREE.TextureLoader();
    let boxTex = null, teethTex = null;

    function onResize() { fitCanvas43(); if (avatar) frameToView(avatar, VIEW); }
    addEventListener('resize', onResize, { passive: true });
    addEventListener('orientationchange', onResize, { passive: true });

    // ---------- HELPERS ----------
    const theE = new THREE.Euler();
    const clamp01 = x => Math.min(1, Math.max(0, x));

    function disableFrustumCulling(root) { root.traverse(o => { if (o.isMesh) o.frustumCulled = false; }); }
    const findRegex = (root, regex) => { const found = []; root.traverse(o => { if (regex.test(o.name)) found.push(o); }); return found; };
    function findFirst(root, names) { for (const n of names) { let o = null; root.traverse(k => { if (!o && k.name === n) o = k; }); if (o) return o; } return null; }
    function findFirstByHints(root, hints) { const rx = new RegExp(hints.map(h => `(${h})`).join('|'), 'i'); const found = []; root.traverse(o => { if (rx.test(o.name)) found.push(o); }); return found[0] || null; }

    const restQ = new Map(), restP = new Map();
    const saveRest = o => { if (!o) return; if (!restQ.has(o)) restQ.set(o, o.quaternion.clone()); if (!restP.has(o)) restP.set(o, o.position.clone()); };
    const restore = o => { if (!o) return; const q = restQ.get(o), p = restP.get(o); if (q) o.quaternion.copy(q); if (p) o.position.copy(p); };
    const rot = (n, ax, r) => { if (!n) return; restore(n); const q = new THREE.Quaternion().setFromAxisAngle(ax, r); n.quaternion.multiply(q).normalize(); };
    const mov = (n, dx = 0, dy = 0, dz = 0) => { if (!n) return; restore(n); n.position.x += dx; n.position.y += dy; n.position.z += dz; };
    const addRot = (n, ax, r) => { if (!n || r === 0) return; const q = new THREE.Quaternion().setFromAxisAngle(ax, r); n.quaternion.multiply(q).normalize(); };
    const addMov = (n, dx = 0, dy = 0, dz = 0) => { if (!n) return; n.position.x += dx; n.position.y += dy; n.position.z += dz; };

    function addLocalMove(n, lx = 0, ly = 0, lz = 0) {
      if (!n) return;
      const parent = n.parent;
      const a0 = new THREE.Vector3(0, 0, 0);
      const a1 = new THREE.Vector3(lx, ly, lz);
      n.localToWorld(a0); n.localToWorld(a1);
      if (parent) {
        const l0 = parent.worldToLocal(a0);
        const l1 = parent.worldToLocal(a1);
        n.position.add(l1.sub(l0));
      } else {
        n.position.add(a1.sub(a0));
      }
    }
    function addLocalRot(n, degX = 0, degY = 0, degZ = 0) {
      if (!n) return;
      const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(degX));
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(degY));
      const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(degZ));
      n.quaternion.multiply(qx).multiply(qy).multiply(qz).normalize();
    }

    function applyUpperLipBaseCorrection(n) {
      if (!n) return;
      const name = n.name || '';
      let cfg = LIP_UP_BASE.center;
      if (/(\.|_|)L\b/i.test(name)) cfg = LIP_UP_BASE.left;
      else if (/(\.|_|)R\b/i.test(name)) cfg = LIP_UP_BASE.right;
      addLocalMove(n, cfg.x, cfg.y, cfg.z);
      addLocalRot(n, cfg.xDeg, cfg.yDeg, cfg.zDeg);
    }

    function dampNodesTowardRest(nodes, k = 0.8) {
      if (!nodes) return;
      nodes.forEach(n => {
        const rq = restQ.get(n), rp = restP.get(n);
        if (rq) n.quaternion.slerp(rq, k);
        if (rp) n.position.lerp(rp, k);
      });
    }

    // ---------- BOUNDS ----------
    function computeRobustBounds(root) {
      root.updateMatrixWorld(true);
      const box = new THREE.Box3(); let found = false;
      root.traverse(o => {
        if (o.isMesh || o.isSkinnedMesh) {
          const g = o.geometry;
          if (g) {
            if (!g.boundingBox) g.computeBoundingBox();
            const bb = g.boundingBox?.clone();
            if (bb && isFinite(bb.min.x) && isFinite(bb.max.x)) {
              bb.applyMatrix4(o.matrixWorld); box.union(bb); found = true;
            }
          }
        }
        if (o.isBone) { const p = new THREE.Vector3(); o.getWorldPosition(p); box.expandByPoint(p); found = true; }
      });
      if (!found || !isFinite(box.min.x) || !isFinite(box.max.x)) return null;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      return { box, sphere };
    }
    function computeBaseSphere(object) { const b = computeRobustBounds(object); return b ? b.sphere : null; }
    function normalizeAndCenter(object) {
      const b = computeRobustBounds(object);
      if (!b) { console.warn('[bounds] No se pudo calcular'); return; }
      const { box, sphere } = b;
      const size = box.getSize(new THREE.Vector3());
      const maxSide = Math.max(size.x, size.y, size.z);
      const center = sphere.center;
      object.position.x -= center.x; object.position.z -= center.z;
      const target = 2.5;
      if (maxSide < 0.05 || maxSide > 50) { object.scale.multiplyScalar(target / maxSide); }
      object.userData.baseSphere = sphere;
    }

    // ---------- RIG ----------
    let ROOT = null, DEF_HEAD = null, CTRL_HEAD_UP = null, HEAD_DOWN = null;
    let CTRL_MOUTH = null, CTRL_JAW = null, DEF_JAW = null;
    let TEETH_LOWER = null, TEETH_UPPER = null;
    let LIP_UP = [], LIP_DOWN = [];
    let LIP_UP_CORNERS = [], LIP_UP_CENTER = [];
    let LIP_DOWN_CORNERS = [], LIP_DOWN_CENTER = [];
    let OJO_L = null, OJO_R = null;
    let FK_LEFT = [], FK_RIGHT = [];
    let TONGUE = [];
    let CHEEKS = [], EYELIDS = [], EYEBROWS = [], NOSE = null;

    // ---------- UI ----------
    const statusEl = document.getElementById('status');
    const btnConnect = document.getElementById('btnConnect');
    const btnDisconnect = document.getElementById('btnDisconnect');
    const micSelect = document.getElementById('micSelect');
    const btnMode = document.getElementById('btnMode');
    const statusElSet = t => statusEl.textContent = t;

    const lvlTxt = document.getElementById('lvlTxt');
    const lvlBar = document.getElementById('lvlBar');
    const talkDot = document.getElementById('talkDot');
    const openTxt = document.getElementById('openTxt');

    // Panel control refs
    const sMaxDeg = document.getElementById('sMaxDeg');
    const nMaxDeg = document.getElementById('nMaxDeg');
    const sLipDownDrop = document.getElementById('sLipDownDrop');
    const nLipDownDrop = document.getElementById('nLipDownDrop');
    const sJawBias = document.getElementById('sJawBias');
    const nJawBias = document.getElementById('nJawBias');
    const chkLockXZ = document.getElementById('chkLockXZ');
    const sTLdownY = document.getElementById('sTLdownY');
    const nTLdownY = document.getElementById('nTLdownY');
    const sTLbackZ = document.getElementById('sTLbackZ');
    const nTLbackZ = document.getElementById('nTLbackZ');
    const sTLrot = document.getElementById('sTLrot');
    const nTLrot = document.getElementById('nTLrot');
    const sTUupY = document.getElementById('sTUupY');
    const nTUupY = document.getElementById('nTUupY');
    const sTUrot = document.getElementById('sTUrot');
    const nTUrot = document.getElementById('nTUrot');

    // ---------- CARGA (GLB) ----------
    const loader = new GLTFLoader();
    const draco = new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/'); loader.setDRACOLoader(draco);
    const ktx2 = new KTX2Loader().setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/basis/'); ktx2.detectSupport(renderer); loader.setKTX2Loader(ktx2);
    loader.setMeshoptDecoder(MeshoptDecoder);

    // util clip
    function estimateFpsFromClip(clip) {
      const deltas = [];
      for (const tr of clip.tracks) {
        const t = tr.times;
        for (let i = 1; i < t.length; i++) {
          const d = t[i] - t[i - 1];
          if (d > 1e-5 && isFinite(d)) deltas.push(d);
        }
      }
      if (!deltas.length) return 30;
      deltas.sort((a, b) => a - b);
      const mid = Math.floor(deltas.length / 2);
      const median = deltas.length % 2 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) * 0.5;
      return median > 1e-5 ? Math.round(1 / median) : 30;
    }
    function makeFirstNSecondsClip(clip, seconds = 5) {
      if (clip.duration <= seconds + 1e-4) return clip;
      const fps = estimateFpsFromClip(clip);
      const startFrame = 0;
      const endFrame = Math.max(1, Math.round(seconds * fps));
      return THREE.AnimationUtils.subclip(clip, `${clip.name || 'Talk'}_first${seconds}s`, startFrame, endFrame, fps);
    }
    function sanitizeTalkClipSides(clip, upperLipNodes = []) {
      if (!clip || !clip.tracks || !upperLipNodes.length) return clip;
      const names = new Set(upperLipNodes.map(n => n?.name).filter(Boolean));
      const rxPos = /\.position$/;
      clip.tracks.forEach(tr => {
        const nodeName = tr.name.split('.')[0];
        if (!names.has(nodeName)) return;
        if (rxPos.test(tr.name) && tr.values && tr.values.length % 3 === 0) {
          for (let i = 0; i < tr.values.length; i += 3) tr.values[i] = (i % 3 === 0) ? 0 : tr.values[i];
        }
      });
      return clip;
    }

    let mixer = null, clock = null, actionBody = null, actionTalk = null;

    if (BOX_TEXTURE_URL) {
      boxTex = texLoader.load(BOX_TEXTURE_URL);
      boxTex.colorSpace = THREE.SRGBColorSpace;
      boxTex.wrapS = boxTex.wrapT = THREE.RepeatWrapping;
      boxTex.repeat.set(BOX_TEXTURE_REPEAT.x, BOX_TEXTURE_REPEAT.y);
      boxTex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
    }
    if (TEETH_TEXTURE_URL) {
      teethTex = texLoader.load(TEETH_TEXTURE_URL);
      teethTex.colorSpace = THREE.SRGBColorSpace;
      teethTex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
    }

    // cargar glb
    loader.load(GLB_URL, (gltf) => {
      avatar = gltf.scene;
      if (!avatar) throw new Error('GLB sin escena');

      normalizeAndCenter(avatar);
      disableFrustumCulling(avatar);
      pivot.add(avatar);
      PIVOT_BASE_POS.copy(pivot.position);

      avatar.traverse(o => {
        if (o.visible === false) o.visible = true;
        if (o.isMesh || o.isSkinnedMesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) {
            if (!m) continue;
            if (m.opacity === 0) m.opacity = 1;
            if (m.transparent && m.opacity >= 1) m.transparent = false;
            if ('side' in m) m.side = THREE.DoubleSide;
            if ('roughness' in m) m.roughness = Math.min(0.65, Math.max(0.0, m.roughness ?? 0.5));
            if ('metalness' in m) m.metalness = Math.min(0.45, Math.max(0.0, m.metalness ?? 0.05));
            m.depthWrite = true; m.needsUpdate = true;
          }
        }
      });

      if (!avatar.userData.baseSphere) {
        const s = computeBaseSphere(avatar);
        if (s) avatar.userData.baseSphere = s;
      }

      // NODOS
      const ROOT_HINT = /\bKRANG_RIG(\.?\d+)?\b/i;
      ROOT = findFirst(avatar, ['ROOT']) || findRegex(avatar, ROOT_HINT)[0] || avatar;

      DEF_HEAD = findFirst(avatar, ['DEF_HEAD_UP', 'DEF_HEAD']) || findRegex(avatar, /DEF[_-]?HEAD/i)[0];
      HEAD_DOWN = findFirst(avatar, ['DEF_HEAD_DOWN']) || findRegex(avatar, /DEF[_-]?HEAD[_-]?DOWN/i)[0] || null;

      CTRL_JAW = findFirst(avatar, ['CTRL_JAW']) || null;
      DEF_JAW = findFirst(avatar, ['DEF_JAW']) || findRegex(avatar, /DEF[_-]?JAW/i)[0];

      TEETH_LOWER = findFirst(avatar, ['DEF_TEETH_DOWN'])
        || findRegex(avatar, /(DEF_)?TEETH.*(DOWN|LOWER|INF|BAJ)/i)[0]
        || findRegex(avatar, /(teeth|dientes).*?(low|down|infer|abaj)/i)[0] || null;

      TEETH_UPPER = findFirst(avatar, ['DEF_TEETH_UP'])
        || findRegex(avatar, /(DEF_)?TEETH.*(UP|UPPER|SUP|ARR)/i)[0]
        || findRegex(avatar, /(teeth|dientes).*?(up|upper|super|arrib)/i)[0] || null;

      const lipsAnyUpper = findRegex(avatar, /\bDEF_LIP(?!_DOWN)/i);
      const lipsAnyLower = findRegex(avatar, /\bDEF_LIP_DOWN_/i);
      LIP_UP = lipsAnyUpper; LIP_DOWN = lipsAnyLower;

      const isCorner = n => /\.L\b|_L\b|\bL\b|\.R\b|_R\b|\bR\b|CORNER/i.test(n.name);
      LIP_UP_CORNERS = (LIP_UP || []).filter(isCorner);
      LIP_UP_CENTER = (LIP_UP || []).filter(n => !isCorner(n));
      LIP_DOWN_CORNERS = (LIP_DOWN || []).filter(isCorner);
      LIP_DOWN_CENTER = (LIP_DOWN || []).filter(n => !isCorner(n));

      OJO_L = findFirst(avatar, ['DEF_EYE.L']) || findRegex(avatar, /DEF[_-]?EYE.*(\.|_)L\b/i)[0];
      OJO_R = findFirst(avatar, ['DEF_EYE.R']) || findRegex(avatar, /DEF[_-]?EYE.*(\.|_)R\b/i)[0];

      const tongueRaw = findRegex(avatar, /DEF[_-]?TONGUE[_-]?(\d+)/i);
      TONGUE = tongueRaw.slice().sort((a, b) => (parseInt((a.name.match(/(\d+)/) || [])[1] || '0', 10) - parseInt((b.name.match(/(\d+)/) || [])[1] || '0', 10)));
      if (!TONGUE.length) {
        const tAny = findRegex(avatar, /(tongue|lengua)/i);
        if (tAny.length) TONGUE = [tAny[0]];
      }

      const tentL = findRegex(avatar, /DEF[_-]?TENTACULO[_-]?B[_-]?\d+\.(L|_L|\bL\b)/i);
      const tentR = findRegex(avatar, /DEF[_-]?TENTACULO[_-]?B[_-]?\d+\.(R|_R|\bR\b)/i);
      FK_LEFT = tentL; FK_RIGHT = tentR;

      CHEEKS = findRegex(avatar, /DEF[_-]?CHEEK[_-]?(UP|DOWN)/i);
      EYELIDS = findRegex(avatar, /DEF[_-]?EYELID/i);
      EYEBROWS = findRegex(avatar, /DEF[_-]?EYEBROW/i);
      NOSE = findFirst(avatar, ['DEF_NOSE']) || findRegex(avatar, /DEF[_-]?NOSE/i)[0] || null;

      ;[
        ROOT, DEF_HEAD, CTRL_HEAD_UP, HEAD_DOWN,
        CTRL_MOUTH, CTRL_JAW, DEF_JAW, TEETH_LOWER, TEETH_UPPER,
        OJO_L, OJO_R, NOSE,
        ...LIP_UP, ...LIP_DOWN,
        ...FK_LEFT, ...FK_RIGHT,
        ...TONGUE, ...CHEEKS, ...EYELIDS, ...EYEBROWS
      ].forEach(saveRest);

      // Encuadre + entorno
      onResize(); frameToView(avatar, VIEW);
      addCinematicLights(avatar);
      buildShadowReceiversAround(avatar);

      const tmpBox = computeRobustBounds(avatar)?.box;
      if (tmpBox) {
        const sz = tmpBox.getSize(new THREE.Vector3()).y;
        controls.target.y -= 0.08 * sz;
      } else controls.target.y -= 0.1;
      camera.position.y -= 0.05;
      controls.update();

      if (teethTex) applyTeethTexture(avatar, teethTex);

      // CAJA
      addContainerBoxFor(avatar).catch(() => { });

      document.getElementById('loader').style.display = 'none';
      document.getElementById('hud').style.display = 'none';

      // Mezclador / Clips
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(avatar);
        clock = new THREE.Clock();

        const rxMouthish = /(MOUTH|JAW|LIP|TONGUE|NOSE|BOCA|DIENTE|LABIO|Cabeza\.morphTargetInfluences|Head\.morphTargetInfluences)/i;

        let mouthTracks = [];
        let bodyTracks = [];
        let maxDuration = 0;

        for (const clip of gltf.animations) {
          maxDuration = Math.max(maxDuration, clip.duration);
          for (const tr of clip.tracks) {
            const isMouth = rxMouthish.test(tr.name);
            if (isMouth) mouthTracks.push(tr);
            else bodyTracks.push(tr);
          }
        }

        if (bodyTracks.length) {
          const clipBody = new THREE.AnimationClip('BodyOnly', maxDuration || 1, bodyTracks);
          actionBody = mixer.clipAction(clipBody); actionBody.play();
        }

        let talkClipRaw = null;
        if (mouthTracks.length) {
          talkClipRaw = new THREE.AnimationClip('TalkMouthOnly', maxDuration || 1, mouthTracks);
        } else {
          const talkByName = gltf.animations.find(c =>
            TALK_NAME_HINTS.some(h => c.name?.toLowerCase().includes(h))
          );
          talkClipRaw = talkByName || null;
        }

        if (talkClipRaw) sanitizeTalkClipSides(talkClipRaw, LIP_UP);
        const talkClip = talkClipRaw ? makeFirstNSecondsClip(talkClipRaw, 5) : null;

        if (talkClip) {
          actionTalk = mixer.clipAction(talkClip);
          actionTalk.setLoop(THREE.LoopRepeat, Infinity);
          actionTalk.clampWhenFinished = false;
          actionTalk.enabled = true;
          actionTalk.play();
          actionTalk.setEffectiveTimeScale(0); // avanza con mixer global
          actionTalk.setEffectiveWeight(0.0);  // lo pesamos según “habla”
        } else {
          actionTalk = null;
        }
      }

      pivot.rotation.set(
        THREE.MathUtils.degToRad(FIGURE_TILT_DEG.x),
        THREE.MathUtils.degToRad(FIGURE_TILT_DEG.y),
        THREE.MathUtils.degToRad(FIGURE_TILT_DEG.z)
      );

      console.log('Teeth lower:', TEETH_LOWER?.name, 'upper:', TEETH_UPPER?.name, 'tongue parts:', TONGUE.length);

    }, undefined, (err) => {
      console.error('GLB load error:', err);
      document.getElementById('loader').querySelector('.loader-text').textContent = 'Error loading 3D avatar';
      alert('No se pudo cargar el GLB. Revisa la consola (F12) para detalles.');
    });

    // ---------- ILUMINACIÓN / SOMBRAS ----------
    function addCinematicLights(target) {
      const amb = new THREE.AmbientLight(0xffffff, 0.30 * LIGHT_SCALE); scene.add(amb);

      const key = new THREE.DirectionalLight(0xfff2e0, 1.45 * LIGHT_SCALE);
      key.position.set(-0.0, 0.8, 1);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
      key.shadow.radius = 4; key.shadow.bias = -0.00018;

      const b = computeRobustBounds(target || pivot);
      const s = (b?.box.getSize(new THREE.Vector3()).length() ?? 5) * 0.6;
      key.shadow.camera.near = 0; key.shadow.camera.far = 10;
      key.shadow.camera.left = -s; key.shadow.camera.right = s;
      key.shadow.camera.top = s; key.shadow.camera.bottom = -s;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xaec8ff, 0.55 * LIGHT_SCALE);
      fill.position.set(-1.1, 1.2, 0.8); scene.add(fill);

      const rim = new THREE.DirectionalLight(0xfff2d0, 0.50 * LIGHT_SCALE);
      rim.position.set(0.5, 0.9, -1.2); scene.add(rim);
    }
    function buildShadowReceiversAround(object) {
      const b = computeRobustBounds(object);
      const box = b?.box ?? new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const shadowMatFloor = new THREE.ShadowMaterial({ opacity: 0.35 }); shadowMatFloor.depthWrite = false;
      const shadowMatWall = new THREE.ShadowMaterial({ opacity: 0.18 }); shadowMatWall.depthWrite = false;

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 2.2, size.z * 2.2), shadowMatFloor);
      floor.rotation.x = -Math.PI * 0.5;
      floor.position.set(center.x, box.min.y + 0.02, center.z + size.z * 0.15);
      floor.receiveShadow = true; floor.renderOrder = -1; scene.add(floor);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 2.0, size.y * 2.0), shadowMatWall);
      backWall.position.set(center.x, center.y, box.max.z + size.z * 0.25);
      backWall.receiveShadow = true; scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(size.z * 2.0, size.y * 2.0), shadowMatWall);
      leftWall.rotation.y = Math.PI * 0.5;
      leftWall.position.set(box.min.x - size.x * 0.35, center.y, center.z + size.z * 0.05);
      leftWall.receiveShadow = true; scene.add(leftWall);

      const rightWall = leftWall.clone(); rightWall.position.x = box.max.x + size.x * 0.35; scene.add(rightWall);
    }

    // === CAJA ===
    function setBoxRotation({ x = 0, y = 0, z = 0, degrees = true } = {}) {
      if (!containerBoxPivot) return;
      if (degrees) {
        containerBoxPivot.rotation.set(
          THREE.MathUtils.degToRad(x),
          THREE.MathUtils.degToRad(y),
          THREE.MathUtils.degToRad(z)
        );
      } else containerBoxPivot.rotation.set(x, y, z);
    }

    async function addContainerBoxFor(targetObj) {
      const b = computeRobustBounds(targetObj);
      if (!b) { console.warn('[box] No bounds, fallback'); return addFallbackBox(targetObj); }
      const size = b.box.getSize(new THREE.Vector3());
      const center = b.box.getCenter(new THREE.Vector3());

      const desired = new THREE.Vector3(
        size.x * (BOX_SCALE?.x ?? 1.00),
        size.y * (BOX_SCALE?.y ?? 1.00),
        size.z * (BOX_SCALE?.z ?? 1.00)
      );

      const pivotBox = new THREE.Group();
      pivotBox.position.copy(center);
      if (BOX_OFFSET_MODE === 'ratio') {
        pivotBox.position.x += BOX_OFFSET.x * size.x;
        pivotBox.position.y += BOX_OFFSET.y * size.y;
        pivotBox.position.z += BOX_OFFSET.z * size.z;
      } else {
        pivotBox.position.x += BOX_OFFSET.x;
        pivotBox.position.y += BOX_OFFSET.y;
        pivotBox.position.z += BOX_OFFSET.z;
      }
      pivot.add(pivotBox); containerBoxPivot = pivotBox;

      try {
        await new Promise((resolve, reject) => {
          loader.load(BOX_URL, (glb) => {
            const boxRoot = glb.scene;
            if (!boxRoot) return reject(new Error('caja.glb sin escena'));
            disableFrustumCulling(boxRoot);

            const bb = computeRobustBounds(boxRoot);
            if (!bb) return reject(new Error('caja.glb sin bounds'));
            const os = bb.box.getSize(new THREE.Vector3());
            const oc = bb.box.getCenter(new THREE.Vector3());

            boxRoot.position.sub(oc);
            const sx = desired.x / (os.x || 1);
            const sy = desired.y / (os.y || 1);
            const sz = desired.z / (os.z || 1);
            boxRoot.scale.set(sx, sy, sz);

            boxRoot.traverse(o => {
              if (o.isMesh || o.isSkinnedMesh) {
                let m = o.material;
                const mats = Array.isArray(m) ? m : [m];
                for (let i = 0; i < mats.length; i++) {
                  const mm = mats[i]; if (!mm) continue;
                  if (boxTex) {
                    mats[i] = new THREE.MeshStandardMaterial({
                      map: boxTex, color: 0xffffff, roughness: 0.7, metalness: 0.0,
                      side: THREE.DoubleSide, transparent: BOX_USE_TRANSPARENCY,
                      opacity: BOX_USE_TRANSPARENCY ? BOX_OPACITY : 1.0
                    });
                  } else {
                    mm.transparent = BOX_USE_TRANSPARENCY;
                    mm.opacity = BOX_USE_TRANSPARENCY ? BOX_OPACITY : 1.0;
                    if ('roughness' in mm) mm.roughness = 0.9;
                    if ('metalness' in mm) mm.metalness = 0.0;
                    if ('side' in mm) mm.side = THREE.DoubleSide;
                    mm.depthWrite = !BOX_USE_TRANSPARENCY;
                    mm.needsUpdate = true;
                    mats[i] = mm;
                  }
                }
                o.material = Array.isArray(m) ? mats : mats[0];
              }
            });

            containerBox = boxRoot;
            pivotBox.add(containerBox);
            setBoxRotation(BOX_ROT_INIT);

            // Puerta
            try {
              const door = findFirstByHints(containerBox, DOOR_HINTS);
              if (door) {
                const bBox = computeRobustBounds(containerBox)?.box;
                if (bBox) {
                  const boxSize = bBox.getSize(new THREE.Vector3());
                  const boxHalfY = boxSize.y * 0.5;

                  const dB = computeRobustBounds(door);
                  if (dB && DOOR_ALIGN !== 'none') {
                    if (DOOR_ALIGN === 'center') {
                      const worldCenter = dB.box.getCenter(new THREE.Vector3());
                      const localCenter = door.parent.worldToLocal(worldCenter.clone());
                      door.position.sub(localCenter);
                    } else if (DOOR_ALIGN === 'bottom') {
                      const worldMin = dB.box.min.clone();
                      const localMin = door.parent.worldToLocal(worldMin.clone());
                      const targetBottom = -boxHalfY + (0.02 * boxSize.y);
                      const deltaY = targetBottom - localMin.y;
                      door.position.y += deltaY;
                    }
                  }
                  if (DOOR_OFFSET_MODE === 'ratio') {
                    door.position.x += DOOR_OFFSET.x * boxSize.x;
                    door.position.y += DOOR_OFFSET.y * boxSize.y;
                    door.position.z += DOOR_OFFSET.z * boxSize.z;
                  } else {
                    door.position.x += DOOR_OFFSET.x;
                    door.position.y += DOOR_OFFSET.y;
                    door.position.z += DOOR_OFFSET.z;
                  }
                }
              } else console.warn('[puerta] No se encontró nodo ~', DOOR_HINTS.join(', '));
            } catch (e) { console.warn('[puerta] Ajuste falló:', e); }

            resolve();
          }, undefined, reject);
        });
      } catch (e) {
        console.warn('[box] No se pudo cargar caja.glb, fallback:', e.message);
        addFallbackBox(targetObj, desired, center, pivotBox);
      }
    }

    function addFallbackBox(targetObj, desired = null, center = null, pivotBox = null) {
      const b = computeRobustBounds(targetObj); if (!b) return;
      const base = b.box.getSize(new THREE.Vector3());
      const size = desired || new THREE.Vector3(
        base.x * (BOX_SCALE?.x ?? 1), base.y * (BOX_SCALE?.y ?? 1), base.z * (BOX_SCALE?.z ?? 1)
      );
      const c = center || b.box.getCenter(new THREE.Vector3());

      const pv = pivotBox || new THREE.Group();
      if (!pivotBox) {
        pv.position.copy(c);
        if (BOX_OFFSET_MODE === 'ratio') {
          pv.position.x += BOX_OFFSET.x * base.x;
          pv.position.y += BOX_OFFSET.y * base.y;
          pv.position.z += BOX_OFFSET.z * base.z;
        } else {
          pv.position.x += BOX_OFFSET.x; pv.position.y += BOX_OFFSET.y; pv.position.z += BOX_OFFSET.z;
        }
        pivot.add(pv); containerBoxPivot = pv;
      }

      const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, wireframe: BOX_WIREFRAME, map: boxTex || null,
        roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide,
        transparent: BOX_USE_TRANSPARENCY, opacity: BOX_USE_TRANSPARENCY ? BOX_OPACITY : 1.0,
        depthWrite: !BOX_USE_TRANSPARENCY
      });
      if (boxTex) boxTex.repeat.set(BOX_TEXTURE_REPEAT.x, BOX_TEXTURE_REPEAT.y);
      const mesh = new THREE.Mesh(geo, mat); mesh.position.set(0, 0, 0); mesh.renderOrder = -10;
      pv.add(mesh); containerBox = mesh; setBoxRotation(BOX_ROT_INIT);
    }
    // === FIN CAJA ===

    // ---------- ENCUADRE ----------
    function frameToView(object, {
      fitPadding = (/Mobi|Android/i.test(navigator.userAgent) ? 1.24 : 1.30),
      extraBack = 1.45, targetYOffsetRatio = 0.18,
      faceFront = true, targetXOffsetRatio = 0.00
    } = {}) {
      let sphere = object.userData.baseSphere;
      if (!sphere || !isFinite(sphere.radius) || sphere.radius === 0) {
        const b = computeRobustBounds(object); if (!b) return; sphere = b.sphere; object.userData.baseSphere = sphere;
      }
      const center = sphere.center.clone();
      const sizeY = Math.max(0.001, sphere.radius * 2);
      const fovRad = THREE.MathUtils.degToRad(camera.fov * 0.5);
      const dist = ((sphere.radius * fitPadding) / Math.sin(fovRad)) * extraBack;

      const target = center.clone(); target.y += sizeY * targetYOffsetRatio;
      const xOff = ALWAYS_CENTER_INIT ? 0.00 : targetXOffsetRatio;
      target.x += (sphere.radius * 2) * xOff;

      const dir = faceFront ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3().subVectors(camera.position, target).normalize();
      dir.multiplyScalar(dist);
      camera.position.copy(target).add(dir);

      camera.near = Math.max(0.01, (sphere.radius) / 200);
      camera.far = Math.max(1000, sphere.radius * 40);
      camera.updateProjectionMatrix();

      controls.target.copy(target); controls.update();
      controls.minDistance = dist * 0.75; controls.maxDistance = dist * 2.2;
    }

    // ---------- AUDIO / SESIÓN ----------
    let conversation = null, volPoller = null, levelOut = 0; let isConnecting = false;

    async function calibrateMicGain(ms = 700) { /* ya no necesitamos calibrar exacto para clip, pero mantenemos lectura de volumen */ }

    async function listMics() { try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { } const devices = await navigator.mediaDevices.enumerateDevices(); const mics = devices.filter(d => d.kind === 'audioinput'); micSelect.innerHTML = ''; for (const it of mics) { const opt = document.createElement('option'); opt.value = it.deviceId; opt.textContent = it.label || `Mic (${it.deviceId.slice(0, 6)}…)`; micSelect.appendChild(opt); } }
    listMics(); navigator.mediaDevices.addEventListener?.('devicechange', listMics);

    // Antes:
    // const r = await fetch(`${WP_BASE}/wp-json/eleven/v1/webrtc-token?agent_id=${encodeURIComponent(AGENT_ID)}`, { credentials: 'omit' });

    // Ahora (ajusta la ruta según dónde subas el archivo):
    const TOKEN_URL = `./eleven-webrtc-token.php`;
    async function getWebRTCToken() {
      const r = await fetch(`${TOKEN_URL}?agent_id=${encodeURIComponent(AGENT_ID)}`, {
        method: 'GET',
        credentials: 'omit'
      });
      if (!r.ok) throw new Error('Could not obtain WebRTC token');
      const { token } = await r.json();
      return token;
    }


    const OUT_GATE = 0.02, OUT_GAIN = 4.2, OUT_GAMMA = 0.75;
    const ATTACK = 0.85, RELEASE = 0.28;
    let MAX_MOUTH_DEG = 22;
    const THRESH_ON = 0.06, THRESH_OFF = 0.03, HOLD_ON_MS = 80, HOLD_OFF_MS = 150;

    let agentTalking = false; let aboveSince = 0, belowSince = 0;

    function setUIConnected(state) {
      if (state) {
        btnConnect.style.display = 'none'; btnDisconnect.style.display = '';
        btnConnect.disabled = true; micSelect.disabled = true; statusElSet('connected');
      } else {
        btnConnect.style.display = ''; btnDisconnect.style.display = 'none';
        btnConnect.disabled = false; micSelect.disabled = false; statusElSet('disconnected');
      }
    }

    btnConnect.onclick = async () => {
      if (conversation || isConnecting) return;
      isConnecting = true; btnConnect.disabled = true; statusElSet('connecting…');
      try {
        const inputDeviceId = micSelect.value || undefined;
        const token = await getWebRTCToken();
        conversation = await Conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc', inputDeviceId, webrtc: { token } });

        if (volPoller) { clearInterval(volPoller); volPoller = null; }
        volPoller = setInterval(async () => {
          try {
            const v = await conversation.getOutputVolume?.();
            if (typeof v === 'number') {
              const ALPHA = 0.35; levelOut = (1 - ALPHA) * levelOut + ALPHA * v;
              const now = performance.now();
              if (levelOut >= THRESH_ON) { aboveSince = aboveSince || now; belowSince = 0; if (!agentTalking && (now - aboveSince) >= HOLD_ON_MS) agentTalking = true; }
              else if (levelOut <= THRESH_OFF) { belowSince = belowSince || now; aboveSince = 0; if (agentTalking && (now - belowSince) >= HOLD_OFF_MS) agentTalking = false; }

              lvlTxt.textContent = levelOut.toFixed(2);
              lvlBar.style.width = Math.min(100, levelOut * 100) + '%';
              talkDot.classList.toggle('on', agentTalking);
            }
          } catch { }
        }, 0);

        setUIConnected(true);
        calibrateMicGain();
      } catch (e) {
        console.error(e); statusElSet('failed'); alert(e.message); setUIConnected(false); conversation = null;
      } finally { isConnecting = false; }
    };

    btnDisconnect.onclick = async () => {
      try { if (conversation) await conversation.endSession(); } catch { }
      conversation = null;
      if (volPoller) { clearInterval(volPoller); volPoller = null; }
      levelOut = 0; agentTalking = false; aboveSince = 0; belowSince = 0;
      setUIConnected(false);
    };

    // ---------- MATERIALES/TEETH ----------
    function applyTeethTexture(root, texture) {
      const rxTeeth = /(teeth|dientes|tooth)/i;
      root.traverse(o => {
        if (o.isMesh || o.isSkinnedMesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          const nameHint = (o.name || '') + '|' + (mats.map(m => m?.name || '').join('|'));
          if (rxTeeth.test(nameHint)) {
            for (let i = 0; i < mats.length; i++) {
              const m = mats[i];
              if (!m || m.isMeshStandardMaterial) {
                const mm = m || new THREE.MeshStandardMaterial();
                mm.map = texture; mm.color = new THREE.Color(0xffffff);
                mm.roughness = 0.35; mm.metalness = 0.0; mm.envMapIntensity = 0.5; mm.needsUpdate = true;
                mats[i] = mm;
              } else {
                mats[i] = new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.35, metalness: 0.0 });
              }
            }
            o.material = Array.isArray(o.material) ? mats : mats[0];
          }
        }
      });
    }

    // ---------- CORRECCIONES ----------
    function jawRestPos(n) { return restP.get(n) || new THREE.Vector3(0, 0, 0); }
    function applyJawCenterComp(openRad) {
      if (!DEF_JAW) return;
      const dx = (JAW_CENTER.biasXPerRad || 0) * openRad;
      const base = jawRestPos(DEF_JAW);
      DEF_JAW.position.x = base.x + dx;
      if (JAW_CENTER.alsoTeethAndLowerLip) {
        (LIP_DOWN || []).forEach(n => {
          const b = restP.get(n) || new THREE.Vector3();
          n.position.x = b.x + dx;
        });
      }
    }
    function hardLockJawXZ(openRad) {
      if (!DEF_JAW) return;
      const base = jawRestPos(DEF_JAW);
      DEF_JAW.position.z = base.z;
      const dx = (JAW_CENTER.biasXPerRad || 0) * openRad;
      DEF_JAW.position.x = base.x + dx;
    }
    function lockJawRotationToX() {
      if (!DEF_JAW) return;
      const qRest = restQ.get(DEF_JAW);
      const qCur = DEF_JAW.quaternion.clone();
      const qDelta = qRest.clone().invert().multiply(qCur);
      theE.setFromQuaternion(qDelta, 'XYZ');
      theE.y = 0; theE.z = 0;
      const qAllowed = new THREE.Quaternion().setFromEuler(new THREE.Euler(theE.x, 0, 0, 'XYZ'));
      DEF_JAW.quaternion.copy(qRest.clone().multiply(qAllowed));
    }
    function limitRotationPitchOnly(node, restQuat) {
      if (!node || !restQuat) return;
      const qRest = restQuat;
      const qCur = node.quaternion.clone();
      const qDelta = qRest.clone().invert().multiply(qCur);
      theE.setFromQuaternion(qDelta, 'XYZ');
      theE.y = 0; theE.z = 0;
      const qAllowed = new THREE.Quaternion().setFromEuler(new THREE.Euler(theE.x, 0, 0, 'XYZ'));
      node.quaternion.copy(qRest.clone().multiply(qAllowed));
    }
    function fixUpperLipSide(open01 = 0) {
      if (!UPPER_LIP_SIDE.enableRuntimeFix || !LIP_UP || !LIP_UP.length) return;
      const addOffsetX = (UPPER_LIP_SIDE.offsetX || 0)
        + (LIP_UP_LOCAL_BIAS?.x || 0) * (UPPER_LIP_SIDE.followOpenScale || 0) * open01;

      (LIP_UP || []).forEach(n => {
        if (!n) return;
        const rp = restP.get(n);
        const rq = restQ.get(n);
        if (!rp) return;
        if (UPPER_LIP_SIDE.lockAxes?.x) n.position.x = rp.x + addOffsetX;
        if (UPPER_LIP_SIDE.lockAxes?.y) n.position.y = rp.y;
        if (UPPER_LIP_SIDE.lockAxes?.z) n.position.z = rp.z;
        if (UPPER_LIP_SIDE.lockRot && (UPPER_LIP_SIDE.lockRot.yaw || UPPER_LIP_SIDE.lockRot.roll)) {
          limitRotationPitchOnly(n, rq);
        }
      });
    }

    // Convergencia de labios + lower lip lock + teeth lock + clamp
    function applyLipConverge(k) {
      if (!LIP_CONVERGE.enabled || k <= 0) return;
      const ly = (LIP_CONVERGE.lowerUpY || 0) * k;     // inferior sube (Y+)
      const uy = -(LIP_CONVERGE.upperDownY || 0) * k;  // superior baja (Y-)
      const rx = THREE.MathUtils.degToRad(LIP_CONVERGE.rotDeg || 0) * k;

      (LIP_DOWN || []).forEach(n => addMov(n, 0, ly, 0));
      (LIP_UP || []).forEach(n => { addMov(n, 0, uy, 0); addRot(n, new THREE.Vector3(1, 0, 0), rx * 0.35); });
    }

    function enforceLowerLipStart(open01) {
      if (!LOWER_LIP_LOCK_BASE.enabled) return;
      const a = clamp01((LOWER_LIP_LOCK_BASE.untilOpen - open01) / LOWER_LIP_LOCK_BASE.untilOpen);
      if (a <= 0) return;
      const mix = a * (LOWER_LIP_LOCK_BASE.ease || 0.6);
      (LIP_DOWN || []).forEach(n => {
        const rp = restP.get(n);
        if (!rp) return;
        n.position.lerp(rp, mix);
        const rq = restQ.get(n);
        if (rq) n.quaternion.slerp(rq, mix);
      });
    }

    function enforceTeethLock(open01) {
      if (!TEETH_LOCK.enabled) return;
      const t = THREE.MathUtils.smoothstep(open01, TEETH_LOCK.startAtOpen, TEETH_LOCK.endAtOpen);
      const k = 1 - t; // k=1: lock total, k=0: libre
      if (k <= 0) return;

      const lockOne = (n, zMax) => {
        const rp = restP.get(n), rq = restQ.get(n);
        if (!n || !rp) return;
        if (TEETH_LOCK.lockRot && rq) n.quaternion.slerp(rq, k);
        if (TEETH_LOCK.lockPosZ) {
          const dz = n.position.z - rp.z;
          const lim = (zMax ?? 0.004);
          const clamped = Math.max(-lim, Math.min(lim, dz));
          n.position.z = rp.z + clamped * (1 - (1 - k));
        }
      };
      if (TEETH_UPPER) lockOne(TEETH_UPPER, TEETH_LOCK.zMax);
      if (TEETH_LOWER) lockOne(TEETH_LOWER, TEETH_LOCK.zMax);
    }

    function clampNodeOutward(n, rp, lim) {
      if (!n || !rp || !lim) return;
      const dx = n.position.x - rp.x;
      if (Math.abs(dx) > lim.maxDX) n.position.x = rp.x + Math.sign(dx) * lim.maxDX;
      const dz = n.position.z - rp.z;
      if (Math.abs(dz) > lim.maxDZ) n.position.z = rp.z + Math.sign(dz) * lim.maxDZ;
    }
    function enforceLipOutwardClamp() {
      if (!LIP_OUTWARD_CLAMP.enabled) return;
      (LIP_UP || []).forEach(n => { const rp = restP.get(n); clampNodeOutward(n, rp, LIP_OUTWARD_CLAMP.up); });
      (LIP_DOWN || []).forEach(n => { const rp = restP.get(n); clampNodeOutward(n, rp, LIP_OUTWARD_CLAMP.down); });
    }

    // ---------- OJOS / CABEZA ----------
    let eyesCur = new THREE.Vector2(0, 0), eyesTarget = new THREE.Vector2(0, 0), nextSaccadeAt = 0;
    function applyEyesIdle() {
      const now = performance.now();
      if (now > nextSaccadeAt) {
        nextSaccadeAt = now + 600 + Math.random() * 900;
        const amp = 0.18;
        eyesTarget.set((Math.random() * 2 - 1) * amp, (Math.random() * 2 - 1) * (amp * 0.6));
      }
      eyesCur.lerp(eyesTarget, 0.15);

      const qy = x => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), x);
      const qx = y => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), y);

      if (OJO_L) { restore(OJO_L); OJO_L.quaternion.multiply(qy(eyesCur.x)).multiply(qx(eyesCur.y)).normalize(); }
      if (OJO_R) { restore(OJO_R); OJO_R.quaternion.multiply(qy(eyesCur.x)).multiply(qx(eyesCur.y)).normalize(); }
    }
    function applyHeadAndBodyIdle(t, talking = false) {
      const nod = Math.sin(t * 0.6) * 0.02;
      const headNode = DEF_HEAD || CTRL_HEAD_UP || HEAD_DOWN;

      if (headNode) {
        restore(headNode);
        addRot(headNode, new THREE.Vector3(1, 0, 0), nod);

        if (HEAD_IDLE.enabled) {
          const damp = talking ? (HEAD_IDLE.talkDamp ?? 0.5) : 1.0;
          const rx = Math.sin(t * HEAD_IDLE.speed.pitch) * HEAD_IDLE.amp.pitch * damp;
          const ry = Math.sin(t * HEAD_IDLE.speed.yaw + 1.3) * HEAD_IDLE.amp.yaw * damp;
          const rz = Math.sin(t * HEAD_IDLE.speed.roll + 0.7) * HEAD_IDLE.amp.roll * damp;
          addRot(headNode, new THREE.Vector3(1, 0, 0), rx);
          addRot(headNode, new THREE.Vector3(0, 1, 0), ry);
          addRot(headNode, new THREE.Vector3(0, 0, 1), rz);
        }
      }

      if (ROOT) {
        restore(ROOT);
        if (ENABLE_IDLE_SWAY) {
          const sway = Math.sin(t * 0.9) * 0.03;
          const twist = Math.sin(t * 0.5) * 0.015;
          const qZ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), sway);
          const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), twist);
          ROOT.quaternion.multiply(qZ).multiply(qY).normalize();
        }
      }
    }

    // --- LENGUA (segura)
    function getMouthFloorY() {
      let y = null;
      try {
        const bTeeth = TEETH_LOWER ? computeRobustBounds(TEETH_LOWER) : null;
        if (bTeeth) y = (y == null) ? bTeeth.box.min.y : Math.min(y, bTeeth.box.min.y);
        const bJaw = DEF_JAW ? computeRobustBounds(DEF_JAW) : null;
        if (bJaw) y = (y == null) ? bJaw.box.min.y : Math.min(y, bJaw.box.min.y);
      } catch { }
      return (y == null) ? 0 : y;
    }
    function applyTongue(t, open) {
      if (!TONGUE || TONGUE.length === 0) return;
      if (open < TONGUE_CFG.MIN_OPEN) { TONGUE.forEach(restore); return; }

      const k = Math.min(1, Math.max(0, (open - TONGUE_CFG.MIN_OPEN) / (1 - TONGUE_CFG.MIN_OPEN)));
      const baseCurl = THREE.MathUtils.degToRad(TONGUE_CFG.CURL_DEG) * k;
      const wagAmp = THREE.MathUtils.degToRad(TONGUE_CFG.WAG_DEG) * k;
      const wagSpd = TONGUE_CFG.WAG_SPD;

      const parts = TONGUE;
      const L = parts.length;

      parts.forEach((n, i) => {
        restore(n);
        const fall = (L > 1) ? (1 - i * 0.18) : 1.0;
        const curl = baseCurl * fall;
        const wag = Math.sin(t * wagSpd + i * 0.7) * wagAmp * fall;

        const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -curl);
        const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), wag);
        n.quaternion.multiply(qx).multiply(qy).normalize();

        const up = (TONGUE_CFG.UP_OFFSET * k * fall);
        const fwd = (TONGUE_CFG.ALLOW_FORWARD ? Math.min(TONGUE_CFG.MAX_FORWARD, 0.006 * k * fall) : 0);
        addMov(n, 0, up, fwd);
      });

      const tip = parts[L - 1];
      const tipPos = new THREE.Vector3(); tip.getWorldPosition(tipPos);
      const floorY = getMouthFloorY() + TONGUE_CFG.SAFETY_CLEARANCE;
      if (tipPos.y < floorY) {
        const pushUp = floorY - tipPos.y;
        parts.forEach((n, i) => {
          const w = (L > 1) ? (1 - i / (L - 1)) * 0.65 : 1.0;
          addMov(n, 0, pushUp * w, 0);
        });
      }
    }

    // ---------- LOOP ----------
    let jawOpen = 0, justStoppedAt = 0;

    function animate() {
      requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      if (mixer && clock) mixer.update(clock.getDelta());

      const talkingNow = agentTalking; // usamos salida de audio del agente

      if (!talkingNow && talkDot.classList.contains('on')) {
        justStoppedAt = performance.now();
      }

      // Detectar energía y convertir a open (solo para aditivos sobre el clip)
      const Lraw = levelOut;
      let targetOpen = 0;
      if (talkingNow) {
        const lvl = Math.max(0, Lraw - OUT_GATE);
        const boosted = Math.pow(lvl * OUT_GAIN, OUT_GAMMA);
        targetOpen = Math.min(boosted, 1.0);
      }
      const localRelease = talkingNow ? RELEASE : RELEASE;
      const kEnv = (targetOpen > jawOpen) ? ATTACK : localRelease;
      jawOpen += (targetOpen - jawOpen) * kEnv;

      // Clip disponible/activo
      const clipAvailable = !!actionTalk;
      const clipActive = (talkSource === 'clip') && clipAvailable;

      // Gestionar pesos del clip (solo “habla” si talkingNow)
      if (actionTalk) {
        const tgt = (clipActive && talkingNow) ? 1.0 : 0.0;
        const cur = actionTalk.getEffectiveWeight();
        actionTalk.setEffectiveWeight(cur + (tgt - cur) * 0.25);
        actionTalk.timeScale = THREE.MathUtils.lerp(0.8, 1.6, clamp01(jawOpen));
      }

      // Mixer aditivo sobre clip (muy leve)
      const mixerWeight = (clipActive && USE_MIXER_MOUTH) ? (talkingNow ? MOUTH_MIXER_WHEN_TALK : MOUTH_MIXER_WHEN_SILENT) : 0.0;
      if (mixerWeight > 0) {
        const upDy = +0.08 * clamp01(jawOpen);
        const upRx = THREE.MathUtils.degToRad(6) * clamp01(jawOpen);
        (LIP_UP || []).forEach(n => { addMov(n, 0, upDy, 0); addRot(n, new THREE.Vector3(1, 0, 0), upRx); });
      }

      // Convergencia de labios (menos agresiva en clip)
      if (talkingNow) {
        const openClip = clamp01(jawOpen);
        const convergeDrive = Math.pow(1 - openClip, LIP_CONVERGE.curve || 1.6);
        applyLipConverge(clamp01(convergeDrive * 0.85));
      }

      // Labio inferior parte desde silencio cuando la apertura es chica
      enforceLowerLipStart(clamp01(jawOpen));

      // Pose “silencio” leve si no habla
      if (!talkingNow) {
        (LIP_UP || []).forEach(n => { addLocalMove(n, SILENT_BIAS.up.x, SILENT_BIAS.up.y, SILENT_BIAS.up.z); addLocalRot(n, 0, 0, SILENT_BIAS.up.zDeg); });
        (LIP_DOWN || []).forEach(n => { addLocalMove(n, SILENT_BIAS.down.x, SILENT_BIAS.down.y, SILENT_BIAS.down.z); addLocalRot(n, 0, 0, SILENT_BIAS.down.zDeg); });
        dampNodesTowardRest(CHEEKS, CHEEK_SILENT_DAMP);
      }

      // Lengua segura
      applyTongue(t, clamp01(jawOpen));

      // Idle / ojos / cabeza
      applyEyesIdle();
      applyHeadAndBodyIdle(t, talkingNow);

      const openRad = THREE.MathUtils.degToRad(MAX_MOUTH_DEG) * clamp01(jawOpen);
      applyJawCenterComp(openRad);
      lockJawRotationToX();
      if (JAW_CENTER.hardLockXZ) hardLockJawXZ(openRad);

      // Correcciones finales
      fixUpperLipSide(clamp01(jawOpen));
      enforceTeethLock(clamp01(jawOpen));
      enforceLipOutwardClamp();

      // UI
      openTxt.textContent = jawOpen.toFixed(2);
      lvlTxt.textContent = levelOut.toFixed(2);
      lvlBar.style.width = Math.min(100, levelOut * 100) + '%';
      talkDot.classList.toggle('on', talkingNow);

      controls.update();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    // --- OTHERS ---
    async function listMicsInit() { try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { } }
    listMicsInit().finally(listMics);
    fitCanvas43();