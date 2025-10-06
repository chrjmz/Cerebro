
# KRANG — 3D Avatar + ElevenLabs (WebRTC)  
**Lipsync + mandíbula + dientes + lengua**  
*(English below)*

## 🧱 Estructura del proyecto

```
/ (root)
├─ index.html                 # Shell de la app (importmap + UI)
├─ app.css                    # Estilos
├─ app.js                     # Lógica Three.js + ElevenLabs
├─ eleven-webrtc-token.php    # Token proxy (standalone, sin WordPress)
├─ exp3test.glb               # Modelo GLB (o el que estés usando)
├─ T_Ojos_BaseColor.png       # Textura ojos
├─ T_Theets_BaseColor.png     # Textura dientes
├─ T_Side_Box_BaseColor.png   # Textura “caja/puerta” (si aplica)
├─ Logo 01.png / Logo 02.png  # Activos UI
└─ (otros assets…)
```

---

## ⚙️ Requisitos

- Servir por **HTTPS** (recomendado) para acceso a micrófono en Chrome.
- Un servidor estático simple (Live Server, `http-server`, `python -m http.server`).
- Un backend que obtenga el **conversation token** de ElevenLabs:
  - O **`eleven-webrtc-token.php`** (incluido).
  - O tu **endpoint WordPress** (`/wp-json/eleven/v1/webrtc-token`).

---

## 🚀 Cómo ejecutar en local

1) Instala un servidor local (elige uno):
```bash
# Node
npx http-server -p 8080

# o Python 3
python -m http.server 8080
```

2) Abre `https://localhost:8080` (o la URL que te dé tu servidor con HTTPS si lo tienes configurado).

3) Verás el loader, luego el avatar. Usa el botón **Connect mic** para seleccionar el micrófono.

> Si Chrome no muestra la lista de micrófonos, revisa la sección **Solución de problemas (micrófono)** más abajo.

---

## 🔑 Configuración (claves y endpoints)

En `app.js`, verifica estas constantes (o el mecanismo que ya tengas):

```js
const AGENT_ID = 'agent_XXXXXXXX';            // Tu agente de ElevenLabs
const TOKEN_URL = './eleven-webrtc-token.php';// Proxy PHP local
// Si usas WordPress, puedes mantener:
const WP_BASE = 'https://tu-dominio-wp.com';  // para tus propias llamadas
```

### Opción A — PHP standalone (`eleven-webrtc-token.php`)
- Sube el archivo al mismo directorio de `index.html`.
- Asegúrate de que el host tenga PHP activado.
- `app.js` llamará a `TOKEN_URL` para obtener el token.

### Opción B — WordPress REST
- Mantén tu MU plugin/endpoint (`/wp-json/eleven/v1/webrtc-token`) con la `ELEVEN_API_KEY`.
- Cambia `TOKEN_URL` para apuntar a tu ruta REST si prefieres.

---

## 🧩 Tecnologías

- **Three.js** (carga GLB, animaciones, rig de mandíbula/dientes/labios)
- **ElevenLabs WebRTC** (voz del agente + evento de nivel de audio para lipsync)
- **Import maps** en `index.html` y código módulo en `app.js`
- Paneles UI mínimos para ajustes (mandíbula, dientes, etc.)

---

## 🛠️ Solución de problemas

### 1) Chrome no muestra micrófonos / no pide permiso
- Verifica que **no** estés enviando un encabezado que los bloquee.  
  **No uses:** `Permissions-Policy: microphone=()` en el root del sitio.  
  **Permite al menos self:**  
  - **Nginx**
    ```nginx
    add_header Permissions-Policy 'microphone=(self)';
    ```
  - **Apache (.htaccess)**
    ```apache
    Header set Permissions-Policy "microphone=(self)"
    ```
- Recuerda que **Chrome solo muestra etiquetas de dispositivos** después de conceder permiso alguna vez.  
  El flujo correcto es: llamar `getUserMedia({ audio: true })` → usuario acepta → `enumerateDevices()` devuelve lista con nombres.

### 2) HTTPS / contextos seguros
- En Chrome, algunos permisos y `enumerateDevices()` requieren **origen seguro** (HTTPS o `localhost`).

### 3) CORS / tipos MIME para 3D y decoders
- Asegura MIME correctos:
  - `.glb` → `model/gltf-binary`
  - `.wasm` → `application/wasm`
  - `.ktx2` → `image/ktx2`
- Si ves errores de CORS, habilita:
  - **Nginx**
    ```nginx
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    ```
  - **Apache**
    ```apache
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    ```

### 4) WebGL en hosting (ej. Hostinger)
- Verifica que el proveedor no reescriba rutas a `/index.php` en carpetas estáticas.
- Desactiva reglas que bloqueen `.glb`/`.wasm` y confirma que no haya 403 por WAF/ModSecurity.

---

## 🧪 Pruebas rápidas

- **Auto-frame:** al cargar el GLB debe encuadrar el avatar y mostrarlo centrado.
- **Lipsync:** al hablar el agente, verás apertura/rotación mandibular + ajustes de labios/dientes.
- **Half-duplex:** tu captura de mic se pausa cuando habla el agente, evitando realimentación.

---

## 📦 Deploy

- **Estático + PHP**: sube todo el contenido del proyecto (incluye `eleven-webrtc-token.php`).  
- **WordPress**: sirve `index.html` y assets como archivos estáticos (subcarpeta o raíz) y usa tu endpoint REST para el token.  
- Asegura **HTTPS**, ajusta **Permissions-Policy** y **CORS** según lo anterior.

---

## 🗒️ Changelog

- **2025-10-06**: Separación en `index.html`, `app.css`, `app.js`. README actualizado.  
- **2025-10-02**: Añadidos controles de mandíbula/dientes y mejoras de lipsync.  

---

## 📄 Licencia y créditos

- Código de ejemplo: MIT (ajústalo si planeas otra licencia).  
- Modelos y texturas: asegúrate de tener derechos para su uso y distribución.  
- ElevenLabs WebRTC: sujeto a Términos de ElevenLabs.

---

---

# KRANG — 3D Avatar + ElevenLabs (WebRTC)  
**Lipsync + jaw + teeth + tongue**

## 🧱 Project structure

```
/ (root)
├─ index.html                 # App shell (importmap + UI)
├─ app.css                    # Styles
├─ app.js                     # Three.js + ElevenLabs logic
├─ eleven-webrtc-token.php    # Standalone token proxy (no WordPress)
├─ exp3test.glb               # GLB model
├─ T_Ojos_BaseColor.png
├─ T_Theets_BaseColor.png
├─ T_Side_Box_BaseColor.png
├─ Logo 01.png / Logo 02.png
└─ (other assets…)
```

## ⚙️ Requirements

- **HTTPS** (recommended) for microphone access in Chrome.
- Simple static server (Live Server, `http-server`, `python -m http.server`).
- A backend to fetch ElevenLabs **conversation token**:
  - **`eleven-webrtc-token.php`** (included), or
  - Your **WordPress** REST endpoint.

## 🚀 Run locally

```bash
# Node
npx http-server -p 8080
# or Python 3
python -m http.server 8080
```

Open the served URL (prefer HTTPS). Click **Connect mic** and select a microphone.

## 🔑 Configuration

In `app.js` check:

```js
const AGENT_ID = 'agent_XXXXXXXX';
const TOKEN_URL = './eleven-webrtc-token.php'; // or your WP REST route
const WP_BASE = 'https://your-wp-domain.com';
```

## 🛠️ Troubleshooting

### Mic devices not listed / Chrome doesn’t ask permission
- Don’t ship a blocking header like `Permissions-Policy: microphone=()`.  
  Allow at least self:
  - **Nginx**
    ```nginx
    add_header Permissions-Policy 'microphone=(self)';
    ```
  - **Apache**
    ```apache
    Header set Permissions-Policy "microphone=(self)"
    ```
- Chrome shows device **labels only after** a successful `getUserMedia({audio:true})` grant.

### Secure context
Use **HTTPS** (or `localhost`) for device APIs and to avoid silent failures.

### CORS / MIME
- Ensure proper MIME:
  - `.glb` → `model/gltf-binary`
  - `.wasm` → `application/wasm`
  - `.ktx2` → `image/ktx2`
- Open CORS for static assets if needed (see snippets above).

### Hosting gotchas
Disable rewrites that hijack static routes; verify WAF/ModSecurity isn’t blocking `.glb`/`.wasm`.

## 📦 Deploy

- **Static + PHP**: upload everything including the PHP token proxy.
- **WordPress**: serve the static files and use your REST token endpoint.
- Ensure **HTTPS**, **Permissions-Policy**, and **CORS** are correctly set.

## 🗒️ Changelog

- **2025-10-06**: Split into `index.html`, `app.css`, `app.js`. README refreshed.
- **2025-10-02**: Jaw/teeth controls and lipsync improvements.

## 📄 License & credits

- Example code: MIT (change if needed).
- Models/textures: verify you have rights.
- ElevenLabs WebRTC per ElevenLabs Terms.
