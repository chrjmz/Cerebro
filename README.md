# KRANG — 3D Avatar + ElevenLabs (WebRTC)
**Lipsync + jaw + teeth + tongue**  
*(Spanish version below)*

## 🧱 Project structure

```
/ (root)
├─ index.html                 # Shell + importmap + UI
├─ app.css                    # Styles
├─ app.js                     # Three.js + ElevenLabs logic
├─ eleven-webrtc-token.php    # Token proxy (PHP standalone)
├─ exp3test.glb               # Main GLB model
├─ caja.glb                   # Container “box” GLB
├─ T_Theets_BaseColor.png     # Teeth texture
├─ T_Side_Box_BaseColor.png   # Box texture
├─ T_Ojos_BaseColor.png       # Eyes texture (if used)
├─ Logo 01.png / Logo 02.png  # UI assets
└─ (other assets…)
```

Matches the current HTML/CSS/JS and referenced assets.

---

## ⚙️ Requirements

- **HTTPS** recommended for microphone access in Chrome.
- A simple static server (Live Server, `http-server`, `python -m http.server`).
- A backend to fetch the ElevenLabs **conversation token**. This project uses
  `eleven-webrtc-token.php` next to `index.html`, fetched via `GET ?agent_id=...`.

---

## 🚀 Run locally

```bash
# Node
npx http-server -p 8080

# Python 3
python -m http.server 8080
```

Open the served URL (prefer **HTTPS**). The UI provides **Connect mic** and a microphone
`<select>` after permission is granted.

---

## 🔑 `app.js` configuration

- **ElevenLabs agent**: set your `AGENT_ID` (placeholder currently present).
- **Token proxy (PHP)**: internal constant uses `./eleven-webrtc-token.php` for token fetch.
- **WordPress (optional)**: set `WP_BASE` if you integrate your own REST route.

---

## 🎛️ Lipsync & animation behavior

- **Lipsync source**: fixed to **clip** mode; the talk clip’s weight is blended only while the
  agent is “talking”.
- **Agent voice detection**: polls the agent output level to toggle the talking state and compute
  mouth openness.
- **Jaw/teeth/lips/tongue safety**: limits and corrections (locks and clamps) keep the jaw centered,
  prevent teeth separation at early openings, clamp lip offsets, and constrain tongue movement.
- **Half‑duplex feel**: mouth opens with the agent’s output, keeping user mic gated while the agent
  speaks (if you enabled that pattern in your UI).

---

## 🧩 Model & scene

- Main model: `exp3test.glb` (auto 4:3 framing, cinematic lights, shadows).
- **Box** (optional): `caja.glb` with `T_Side_Box_BaseColor.png`, size/offset/door alignment
  configurable.
- Teeth texture `T_Theets_BaseColor.png` auto‑applied to meshes matching “teeth/dientes”.

---

## 🛠️ Troubleshooting

1) **Chrome won’t list mics / no prompt**  
   - Avoid blocking headers like `Permissions-Policy: microphone=()`. Allow at least `self`.
   - Device **labels** show only after a successful `getUserMedia` grant; the code requests and
     refreshes the device list when permission is granted.

2) **Secure context**  
   - Use **HTTPS** (or `localhost`) for device APIs.

3) **MIME/CORS for 3D assets**  
   - Ensure correct types: `.glb → model/gltf-binary`, `.wasm → application/wasm`, `.ktx2 → image/ktx2`.
   - If you rely on DRACO/KTX2 CDN decoders, confirm your host serves these files and CORS properly.

---

## 📦 Deploy

- **Static + PHP**: upload everything including `eleven-webrtc-token.php`.
- **WordPress**: serve the static files and use your REST token endpoint.
- Ensure **HTTPS**, **Permissions-Policy**, and **CORS**.

---

## 🗒️ Changelog

- **2025-10-06**: Split into `index.html`, `app.css`, `app.js`; lipsync source set to clip; PHP token proxy in use.
- **2025-10-02**: Jaw/lips/teeth/tongue safety & tuning.

---

## 📄 License & credits

- Example code: MIT (adjust if needed).
- Models/textures: ensure usage rights.
- ElevenLabs WebRTC per ElevenLabs Terms.

---

# KRANG — 3D Avatar + ElevenLabs (WebRTC)
**Lipsync + mandíbula + dientes + lengua**

## 🧱 Estructura del proyecto

```
/ (root)
├─ index.html                 # Shell + importmap + UI
├─ app.css                    # Estilos
├─ app.js                     # Lógica Three.js + ElevenLabs
├─ eleven-webrtc-token.php    # Proxy de token (PHP standalone)
├─ exp3test.glb               # Modelo GLB principal
├─ caja.glb                   # GLB de la “caja” contenedora
├─ T_Theets_BaseColor.png     # Textura dientes
├─ T_Side_Box_BaseColor.png   # Textura de la “caja”
├─ T_Ojos_BaseColor.png       # Textura ojos (si aplica)
├─ Logo 01.png / Logo 02.png  # Activos UI
└─ (otros assets…)
```

En línea con los archivos y referencias actuales en HTML/CSS/JS.

---

## ⚙️ Requisitos

- **HTTPS** recomendado para acceso a micrófono en Chrome.
- Servidor estático simple (Live Server, `http-server`, `python -m http.server`).
- Backend que obtenga el **conversation token** de ElevenLabs. Aquí se usa
  `eleven-webrtc-token.php` junto a `index.html`, consumido con `GET ?agent_id=...`.

---

## 🚀 Cómo ejecutar en local

```bash
# Node
npx http-server -p 8080

# Python 3
python -m http.server 8080
```

Abre la URL servida (mejor **HTTPS**). La UI muestra **Connect mic** y un `<select>` de micrófono
tras conceder el permiso.

---

## 🔑 Configuración en `app.js`

- **Agente ElevenLabs**: define tu `AGENT_ID` (placeholder actual).
- **Token proxy (PHP)**: constante interna usa `./eleven-webrtc-token.php` para pedir el token.
- **WordPress (opcional)**: define `WP_BASE` si integras tu propio endpoint REST.

---

## 🎛️ Comportamiento del lipsync y animaciones

- **Fuente de lipsync**: fijada a modo **clip**; el peso del clip se mezcla solo mientras el
  agente “habla”.
- **Detección de voz del agente**: se consulta el nivel de salida para alternar el estado de
  “hablando” y calcular la apertura de la boca.
- **Seguridad mandíbula/labios/dientes/lengua**: límites y correcciones para mantener mandíbula
  centrada, evitar separación temprana de dientes, acotar desplazamientos de labios y restringir la
  lengua.
- **Sensación half‑duplex**: la boca abre con la voz del agente, manteniendo el mic del usuario
  silenciado cuando el agente habla (si activaste ese patrón en la UI).

---

## 🧩 Modelo y escena

- Modelo principal: `exp3test.glb` (encuadre automático 4:3, luces “cinemáticas”, sombras).
- **Caja** (opcional): `caja.glb` con `T_Side_Box_BaseColor.png`, tamaño/offset/puerta configurables.
- Textura de dientes `T_Theets_BaseColor.png` aplicada a mallas que coincidan con “teeth/dientes”.

---

## 🛠️ Solución de problemas

1) **Chrome no lista micrófonos / no pide permiso**  
   - Evita cabeceras que bloqueen permisos, p. ej. `Permissions-Policy: microphone=()`. Permite al menos `self`.
   - Las **etiquetas** de dispositivos aparecen solo tras un `getUserMedia` exitoso; el código ya
     solicita y refresca la lista cuando se concede el permiso.

2) **Contexto seguro**  
   - Usa **HTTPS** (o `localhost`) para las APIs de dispositivo.

3) **MIME/CORS para assets 3D**  
   - Tipos correctos: `.glb → model/gltf-binary`, `.wasm → application/wasm`, `.ktx2 → image/ktx2`.
   - Si usas decoders DRACO/KTX2 por CDN, valida tipos y CORS en tu host.

---

## 📦 Deploy

- **Estático + PHP**: sube todo incluyendo `eleven-webrtc-token.php`.
- **WordPress**: sirve los archivos estáticos y usa tu endpoint REST de tokens.
- Asegura **HTTPS**, **Permissions-Policy** y **CORS**.

---

## 🗒️ Changelog

- **2025-10-06**: Separación en `index.html`, `app.css`, `app.js`; lipsync por clip; uso de proxy PHP.
- **2025-10-02**: Ajustes de seguridad y afinación de mandíbula/labios/dientes/lengua.

---

## 📄 Licencia y créditos

- Código de ejemplo: MIT (ajústalo si lo necesitas).
- Modelos/texturas: verifica derechos de uso.
- ElevenLabs WebRTC según los términos de ElevenLabs.
