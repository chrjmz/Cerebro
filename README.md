# Krang — 3D Avatar (GLB) + ElevenLabs — README · README bilingüe (EN/ES)

> EN/ES bilingual. Scroll for Spanish ↓

Demo to load a **GLB avatar** in Three.js, **auto‑frame** it on screen, and animate the **mouth/jaw/teeth** using an **ElevenLabs agent** over WebRTC. This update replaces the old FBX demos with a single, *demo‑ready* page and adds a **container box (GLB)** with an optional “door”, cinematic lighting, and clip‑based lipsync.

---

## 1) Folder structure (EN)

```
/ (project root)
├─ index.html                    # Demo: auto-frame + clip-based lipsync + WebRTC
├─ eleven-webrtc-token.php       # Backend endpoint to fetch an ElevenLabs WebRTC token
├─ exp3test.glb                  # Main avatar (GLB)
├─ caja.glb                      # Container box (GLB) used as scene prop
├─ T_Side_Box_BaseColor.png      # Box texture (optional)
├─ T_Theets_BaseColor.png        # Teeth texture (optional)
├─ T_Ojos_BaseColor.png          # Eyes texture (optional)
├─ Logo 01.png                   # Light logo
└─ Logo 02.png                   # Dark logo
```

> The avatar is loaded from `./exp3test.glb` and the box from `./caja.glb`. If you rename them, update the constants (`GLB_URL`, `BOX_URL`) in `index.html`.

---

## 2) Requirements (EN)

* **Modern browser** with WebGL and microphone permission (Chrome recommended).
* **Local server** (do not open with `file://`). Use one:
  * VS Code + *Live Server*
  * Node: `npx http-server . -p 8080`
  * Python 3: `python -m http.server 8080`
* **HTTPS** if running from a domain (required by `getUserMedia`).

---

## 3) Dependencies via CDN (EN)

The page uses **import maps** to load:

* `three@0.160.x`
* `livekit-client@2` (via `esm.sh`)
* `@elevenlabs/client@0.6.x` (ESM)

Paths are declared inside `<script type="importmap">` to avoid the “Failed to resolve module specifier 'livekit-client'” error when resolving from CDN.

---

## 4) ElevenLabs configuration (WebRTC) (EN)

Edit in `index.html`:

```js
// Example
const AGENT_ID  = 'agent_xxxxxxxxxxxxxxxxxxxxxxxx';
const TOKEN_URL = './eleven-webrtc-token.php?agent_id=' + encodeURIComponent(AGENT_ID);
```

* **AGENT_ID**: your ElevenLabs agent.
* **TOKEN_URL**: backend service that returns a **WebRTC token** for `Conversation.startSession()`.
* The provided `eleven-webrtc-token.php` requests an **ephemeral** token from ElevenLabs using your **XI API Key** (kept on the server) and returns it to the browser.

> Keep the API key **out of the client**. If you prefer WordPress or another backend, point `TOKEN_URL` there.

---

## 5) How to run (EN)

1. Start a local server in the project folder.
2. Open `http://localhost:8080/index.html`.
3. Click **Connect mic** and **allow microphone access**.
4. Talk to the agent (the SDK handles audio and session).

> A loader is shown while GLBs are fetched. The model is **auto‑framed (4:3)** to avoid appearing too large/small.

---

## 6) Controls & behavior (EN)

### `index.html` — demo‑ready

* **Buttons:** Connect / Disconnect; microphone selector.
* **Animation source:** **clip‑based lipsync** blended with the avatar’s talk clip; **jaw/teeth** follow rules and clamps to keep teeth aligned.
* **Agent‑driven:** the *agent’s output audio* is used to gate/scale the talk clip so the mouth moves **only when the agent speaks**. Your mic does **not** directly animate the avatar.
* **Box & “door”:** optional GLB prop; scale/offset and a simple “door” control can be tuned in constants.
* **Auto‑framing & lights:** 4:3 composition with floor/wall shadow pass and cinematic lights (soft shadows).

**Debug tips**
* Open DevTools → Console to see detected nodes (teeth, jaw, mouth shapes) and clip names.
* If the box GLB is missing, a **fallback** procedural box is created.

---

## 7) Materials & textures (EN)

Provided textures:

* `T_Side_Box_BaseColor.png` — box
* `T_Ojos_BaseColor.png` — eyes
* `T_Theets_BaseColor.png` — teeth

> Prefer exporting materials from your DCC already mapped in GLB. To override at runtime, extend the loader to assign `MeshStandardMaterial` maps via `TextureLoader`.

---

## 8) Quick customization (EN)

* **Change the model:** replace `exp3test.glb` and update `GLB_URL`.
* **Jaw/lips tuning:** constants like `LIP_CONVERGE`, `LOWER_LIP_LOCK_BASE`, `TEETH_LOCK`, `TEETH_FOLLOW`, `LIP_OUTWARD_CLAMP`, and jaw centering/limits can be adjusted.
* **Camera/framing:** tweak `FOV`, `VIEW` (padding/offsets/extraBack), and `FIGURE_TILT_DEG`.
* **Box prop:** adjust `BOX_SCALE`, `BOX_OFFSET_MODE`, `BOX_OFFSET` or swap `caja.glb`.

---

## 9) Troubleshooting (EN)

* **“Failed to resolve module specifier 'livekit-client'”**  
  Serve from a local server and keep the import map pointing to `esm.sh`.
* **Model appears huge / out of frame**  
  Auto‑framing runs after load; verify GLB bounding box and scale if needed.
* **No mouth movement with my voice**  
  By design, only the **agent output** gates/scales the clip. Use a different mode if you want mic‑driven lipsync.
* **Textures not showing**  
  Host PNGs from the same origin and verify UVs. Consider preloading with `TextureLoader`.

---

# ————————————————————————————————————————————————————————————————
# ES · Español
# ————————————————————————————————————————————————————————————————

Demo para cargar un **avatar GLB** en Three.js, **encuadrarlo automáticamente** y animar **boca/mandíbula/dientes** con la voz de un **agente de ElevenLabs** vía WebRTC. Esta actualización reemplaza los demos FBX con una sola página *lista para demo* y agrega una **caja contenedora (GLB)** con “puerta”, luces cinematográficas y lipsync basado en **clip**.

---

## 1) Estructura de carpetas (ES)

```
/ (raíz)
├─ index.html                    # Demo: auto-frame + lipsync por clip + WebRTC
├─ eleven-webrtc-token.php       # Endpoint backend para obtener token WebRTC
├─ exp3test.glb                  # Avatar principal (GLB)
├─ caja.glb                      # Caja/prop de escena (GLB)
├─ T_Side_Box_BaseColor.png      # Textura de la caja (opcional)
├─ T_Theets_BaseColor.png        # Textura de dientes (opcional)
├─ T_Ojos_BaseColor.png          # Textura de ojos (opcional)
├─ Logo 01.png                   # Logo claro
└─ Logo 02.png                   # Logo oscuro
```

> El avatar se carga desde `./exp3test.glb` y la caja desde `./caja.glb`. Si cambias los nombres, actualiza `GLB_URL` y `BOX_URL` en `index.html`.

---

## 2) Requisitos (ES)

* **Navegador moderno** con WebGL y permiso de micrófono (Chrome recomendado).
* **Servidor local** (no abrir con `file://`). Opciones:
  * VS Code + *Live Server*
  * Node: `npx http-server . -p 8080`
  * Python 3: `python -m http.server 8080`
* **HTTPS** si lo ejecutas desde un dominio (requisito de `getUserMedia`).

---

## 3) Dependencias por CDN (ES)

Se usan **import maps** para:

* `three@0.160.x`
* `livekit-client@2` (vía `esm.sh`)
* `@elevenlabs/client@0.6.x` (ESM)

Las rutas se declaran en `<script type="importmap">` para evitar el error “Failed to resolve module specifier 'livekit-client'”.

---

## 4) Configuración de ElevenLabs (WebRTC) (ES)

Editar en `index.html`:

```js
// Ejemplo
const AGENT_ID  = 'agent_xxxxxxxxxxxxxxxxxxxxxxxx';
const TOKEN_URL = './eleven-webrtc-token.php?agent_id=' + encodeURIComponent(AGENT_ID);
```

* **AGENT_ID**: tu agente de ElevenLabs.
* **TOKEN_URL**: servicio backend que devuelve un **token WebRTC** para `Conversation.startSession()`.
* `eleven-webrtc-token.php` solicita un token **efímero** a ElevenLabs con tu **XI API Key** (guardada en el servidor) y lo devuelve al navegador.

> Mantén la API Key **fuera del cliente**. Si prefieres WordPress u otro backend, apunta `TOKEN_URL` allí.

---

## 5) Cómo ejecutarlo (ES)

1. Inicia un servidor local en la carpeta del proyecto.
2. Abre `http://localhost:8080/index.html`.
3. Presiona **Connect mic** y **autoriza el micrófono**.
4. Habla con el agente (el SDK gestiona el audio y la sesión).

> Verás un *loader* mientras se descargan los GLB. El modelo se **encuadra automáticamente (4:3)** para no aparecer desproporcionado.

---

## 6) Controles y comportamiento (ES)

### `index.html` — listo para demo

* **Botones:** Connect / Disconnect; selector de micrófono.
* **Fuente de animación:** **lipsync por clip** mezclado con el *talk clip*; **mandíbula/dientes** con *clamps* y seguimiento para mantener los dientes alineados.
* **Conducido por el agente:** el **audio de salida del agente** activa/escala el clip de habla, así la boca se mueve **solo cuando habla el agente**. Tu micrófono **no** anima directamente el avatar.
* **Caja y “puerta”:** prop GLB opcional; escala/offset y un control simple de “puerta” se ajustan por constantes.
* **Auto‑encuadre y luces:** composición 4:3 con sombras en piso/pared y luces cinematográficas (sombras suaves).

**Tips de debug**
* Abre la consola del navegador para ver nodos detectados (dientes, mandíbula, formas de boca) y nombres de clips.
* Si falta el GLB de la caja, se genera una **caja de respaldo** procedural.

---

## 7) Materiales y texturas (ES)

Texturas incluidas:

* `T_Side_Box_BaseColor.png` — caja
* `T_Ojos_BaseColor.png` — ojos
* `T_Theets_BaseColor.png` — dientes

> Es preferible exportar el GLB con materiales mapeados desde tu DCC. Para reemplazar en runtime, extiende el *loader* y asigna mapas de `MeshStandardMaterial` con `TextureLoader`.

---

## 8) Personalización rápida (ES)

* **Cambiar el modelo:** reemplaza `exp3test.glb` y ajusta `GLB_URL`.
* **Ajustes de mandíbula/labios:** modifica constantes como `LIP_CONVERGE`, `LOWER_LIP_LOCK_BASE`, `TEETH_LOCK`, `TEETH_FOLLOW`, `LIP_OUTWARD_CLAMP` y centrado/límites de mandíbula.
* **Cámara/encuadre:** ajusta `FOV`, `VIEW` (padding/offsets/extraBack) y `FIGURE_TILT_DEG`.
* **Caja:** ajusta `BOX_SCALE`, `BOX_OFFSET_MODE`, `BOX_OFFSET` o sustituye `caja.glb`.

---

## 9) Problemas comunes (ES)

* **“Failed to resolve module specifier 'livekit-client'”**  
  Sirve la página desde un servidor local y mantén el *import map* apuntando a `esm.sh`.
* **El modelo se ve enorme / fuera de cuadro**  
  El auto‑encuadre corre al cargar; verifica la *bounding box* y escala del GLB si es necesario.
* **No se mueve con mi voz**  
  Por diseño, solo el **audio del agente** activa/escala el clip. Usa otro modo si quieres lipsync por micrófono.
* **No se ven las texturas**  
  Sirve los PNG desde el mismo origen y revisa UVs. Considera precargar con `TextureLoader`.
