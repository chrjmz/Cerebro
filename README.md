# Cerebro — 3D Avatar + ElevenLabs (WebRTC) · Avatar 3D + ElevenLabs (WebRTC)

> EN/ES bilingual README. Scroll for Spanish ↓

## Table of Contents · Tabla de contenido
- [Overview (EN)](#overview-en)
- [Features (EN)](#features-en)
- [Project Structure (EN)](#project-structure-en)
- [Getting Started (EN)](#getting-started-en)
- [Key Configuration (EN)](#key-configuration-en)
- [WebRTC Token (EN)](#webrtc-token-en)
- [Tips (EN)](#tips-en)
- [License / Art (EN)](#license--art-en)
- [Roadmap (EN)](#roadmap-en)
- [Credits (EN)](#credits-en)
- [Resumen (ES)](#resumen-es)
- [Características (ES)](#características-es)
- [Estructura (ES)](#estructura-es)
- [Puesta en marcha (ES)](#puesta-en-marcha-es)
- [Configuración clave (ES)](#configuración-clave-es)
- [Token WebRTC (ES)](#token-webrtc-es)
- [Consejos (ES)](#consejos-es)
- [Licencia / Arte (ES)](#licencia--arte-es)
- [Roadmap (ES)](#roadmap-es)
- [Créditos (ES)](#créditos-es)

---

## Overview (EN)
Cerebro is a **3D avatar** demo built with Three.js featuring **clip‑based lipsync** and jaw/teeth controls driven by an **ElevenLabs agent** over WebRTC. It includes **4:3 auto‑framing**, cinematic lighting, a **container box** (GLB) with a “door”, and tuning parameters for jaw/teeth.

> This version runs with a primary **GLB** avatar and a **GLB** box; lipsync is **clip‑based** (not the user mic) and speech detection is tied to the agent’s **output audio**.

## Features (EN)
- Loads `exp3test.glb` (avatar) and `caja.glb` (box) with optional textures.
- **4:3 auto‑framing**, floor/wall shadow composition.
- **Cinematic lights** with soft shadows.
- **Clip‑based lipsync** with lip converge controls and **teeth follow/lock**.
- Hidden config panel for mouth range, lower‑lip falloff, jaw lateral bias, XZ hard‑lock.
- **ElevenLabs WebRTC** via backend token (`eleven-webrtc-token.php`).

## Project Structure (EN)
```
/ (root)
├─ index.html
├─ eleven-webrtc-token.php
├─ exp3test.glb
├─ caja.glb
├─ T_Side_Box_BaseColor.png
├─ T_Theets_BaseColor.png
├─ T_Ojos_BaseColor.png
├─ Logo 01.png
└─ Logo 02.png
```

## Getting Started (EN)
1. **Clone** the repo and place GLB/PNG assets at the root.
2. **Serve** locally (avoid `file://`):
   ```bash
   npx http-server . -p 8080
   # or
   python -m http.server 8080
   ```
3. Enable **PHP** if using `eleven-webrtc-token.php`. Otherwise set `TOKEN_URL` in `index.html` to your remote backend.
4. Open `http://localhost:8080/index.html`. Click **Connect mic** and grant permission. (Mouth animation is driven by the model **clip** and the agent’s **output**.)

## Key Configuration (EN)
**In `index.html`:**
- **ElevenLabs**: `AGENT_ID`, `TOKEN_URL` (defaults to `./eleven-webrtc-token.php`).
- **Models & Textures**: `GLB_URL`, `BOX_URL`, `BOX_TEXTURE_URL`, `TEETH_TEXTURE_URL`; box `BOX_SCALE`, `BOX_OFFSET_MODE`, `BOX_OFFSET`, and “door” controls.
- **Camera/Framing**: `FOV`, `VIEW` (aspect, padding, extraBack, offsets), `FIGURE_TILT_DEG`.
- **Lipsync & Jaw/Teeth**: `talkSource='clip'`, `LIP_CONVERGE`, `LOWER_LIP_LOCK_BASE`, `TEETH_LOCK`, `TEETH_FOLLOW`, `LIP_OUTWARD_CLAMP`, `SILENT_BIAS`, optional XZ hard‑lock, and `AnimationMixer` blending.

## WebRTC Token (EN)
`eleven-webrtc-token.php` requests an **ephemeral** WebRTC token from ElevenLabs and returns it to the browser. Keep your **XI API Key** on the backend (env/constant) and **never** expose it on the client. You can also point `TOKEN_URL` to a remote endpoint (e.g., WordPress).

## Tips (EN)
- Different rig names? The loader uses hints and pattern search to locate lips/teeth/jaw.
- Use devtools console for loader logs (detected nodes, bounds, clips).
- Missing box? A fallback `BoxGeometry` + standard material is created.

## License / Art (EN)
- Code: MIT (suggested) or your own.
- Models/art (GLB/PNG) belong to the original author; replace assets before redistribution.

## Roadmap (EN)
- GUI to switch avatar/scene and save **lipsync profiles**.
- Phoneme‑driven visemes when agent events are available.
- Texture compression (KTX2/Basis) and DRACO/Meshopt bundling.

## Credits (EN)
- [three.js](https://threejs.org/), `@elevenlabs/client`, `livekit-client` (CDN/ESM).

---

## Resumen (ES)
Cerebro es una demo de **avatar 3D** en Three.js con **lipsync por clip** y controles de mandíbula/dientes impulsados por un **agente de ElevenLabs** vía WebRTC. Incluye **auto‑encuadre 4:3**, luces cinematográficas, una **caja** (GLB) con “puerta” y parámetros de ajuste para mandíbula/dientes.

> Esta versión usa un **GLB** principal y un **GLB** de caja; el lipsync está **fijado al clip** (no al mic del usuario) y la detección de habla usa el **audio de salida** del agente.

## Características (ES)
- Carga `exp3test.glb` (avatar) y `caja.glb` (caja) con texturas opcionales.
- **Auto‑encuadre 4:3**, composición de sombras en piso/pared.
- **Luces cinematográficas** con sombras suaves.
- **Lipsync por clip** con convergencia de labios y **seguimiento/bloqueo de dientes**.
- Panel oculto para rango de apertura, caída del labio inferior, *bias* lateral y bloqueo XZ.
- **ElevenLabs WebRTC** mediante token backend (`eleven-webrtc-token.php`).

## Estructura (ES)
```
/ (raíz)
├─ index.html
├─ eleven-webrtc-token.php
├─ exp3test.glb
├─ caja.glb
├─ T_Side_Box_BaseColor.png
├─ T_Theets_BaseColor.png
├─ T_Ojos_BaseColor.png
├─ Logo 01.png
└─ Logo 02.png
```

## Puesta en marcha (ES)
1. **Clona** el repo y coloca los activos GLB/PNG en la raíz.
2. **Sirve** localmente (evita `file://`):
   ```bash
   npx http-server . -p 8080
   # o
   python -m http.server 8080
   ```
3. Habilita **PHP** si usarás `eleven-webrtc-token.php`. De lo contrario apunta `TOKEN_URL` en `index.html` a tu backend remoto.
4. Abre `http://localhost:8080/index.html`. Presiona **Connect mic** y concede permisos. (La boca se anima con el **clip** del modelo y el **audio de salida** del agente).

## Configuración clave (ES)
**En `index.html`:**
- **ElevenLabs**: `AGENT_ID`, `TOKEN_URL` (por defecto `./eleven-webrtc-token.php`).
- **Modelos y Texturas**: `GLB_URL`, `BOX_URL`, `BOX_TEXTURE_URL`, `TEETH_TEXTURE_URL`; `BOX_SCALE`, `BOX_OFFSET_MODE`, `BOX_OFFSET` y controles de “puerta”.
- **Cámara/Encuadre**: `FOV`, `VIEW` (aspecto, padding, extraBack, offsets), `FIGURE_TILT_DEG`.
- **Lipsync y Mandíbula/Dientes**: `talkSource='clip'`, `LIP_CONVERGE`, `LOWER_LIP_LOCK_BASE`, `TEETH_LOCK`, `TEETH_FOLLOW`, `LIP_OUTWARD_CLAMP`, `SILENT_BIAS`, bloqueo XZ opcional y mezcla con `AnimationMixer`.

## Token WebRTC (ES)
`eleven-webrtc-token.php` solicita un token **efímero** de WebRTC a ElevenLabs y lo devuelve al navegador. Mantén tu **XI API Key** en el backend (env/constante) y **no** la expongas en el cliente. También puedes apuntar `TOKEN_URL` a un endpoint remoto (WordPress u otro).

## Consejos (ES)
- ¿Nombres distintos en tu rig? El cargador usa *hints* y búsqueda por patrones para localizar labios/dientes/mandíbula.
- Revisa la consola del navegador para *logs* (nodos detectados, bounds, clips).
- Si falta la **caja**, se crea un *fallback* con `BoxGeometry` + material estándar.

## Licencia / Arte (ES)
- Código: MIT (sugerida) o la que elijas.
- Modelos/arte (GLB/PNG): pertenecen al autor. Sustituye activos antes de redistribuir.

## Roadmap (ES)
- GUI para cambiar avatar/escena y guardar **perfiles de lipsync**.
- Visemas por fonema cuando haya eventos del agente.
- Compresión de texturas (KTX2/Basis) y empaquetado DRACO/Meshopt.

## Créditos (ES)
- [three.js](https://threejs.org/), `@elevenlabs/client`, `livekit-client` (CDN/ESM).
