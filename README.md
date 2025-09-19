# Cerebro# Avatar 3D + ElevenLabs — README

Proyecto de prueba para cargar un **avatar FBX** en Three.js, encuadrarlo automáticamente en pantalla y animar **labios y cabeza** con la voz del agente de ElevenLabs (WebRTC). Incluye dos variantes:

* `index.html` → versión “lista para demo” con *loader*, **half-duplex** (el micrófono se silencia cuando habla el agente) y **solo la voz del agente** mueve la cabeza y abre la boca.&#x20;
* `Untitled-1.html` → versión “tuneable” con selectores de **morph** y **hueso de mandíbula**, además de *sliders* para ajustar el lipsync en tiempo real.&#x20;

---

## 1) Estructura de carpetas

```
/ (raíz del proyecto)
├─ index.html                 # Demo: half-duplex + auto-frame + loader
├─ Untitled-1.html            # Demo: panel de ajustes (morph/bone/sliders)
├─ P1_v02.fbx                 # Modelo 3D (FBX)
├─ T_Head_BaseColor.png       # Textura cabeza (albedo)
├─ T_Ojos_BaseColor.png       # Textura ojos (albedo)
└─ T_Tongue_BaseColor.png     # Textura lengua (albedo)
```

> El modelo FBX se carga desde `./P1_v02.fbx` en ambos HTML. Si renombrás el archivo, actualiza la constante `FBX_URL`. &#x20;

---

## 2) Requisitos

* **Navegador** moderno con WebGL y permiso de micrófono (Chrome recomendado).
* **Servidor local** (no abrir con `file://`). Usa una de estas opciones:

  * VS Code + **Live Server**.
  * Node: `npx http-server . -p 8080`
  * Python 3: `python -m http.server 8080`
* **Conexión HTTPS** si pruebas desde un dominio (requerido para getUserMedia).

---

## 3) Dependencias (CDN)

Ambas páginas usan **import maps** para cargar:

* `three@0.160.0`
* `livekit-client@2` (vía `esm.sh`)
* `@elevenlabs/client@0.6.2` (módulo ESM)

Las rutas están declaradas en el `<script type="importmap">`. Esto soluciona el error *“Failed to resolve module specifier 'livekit-client'”* al resolver el paquete desde CDN. &#x20;

---

## 4) Configuración de ElevenLabs (WebRTC)

Edita en cada HTML:

```js
const AGENT_ID = 'agent_0601k5bpbdwyfwmr4qhwgxvfcn9m';
const WP_BASE  = 'https://test-ai.garabatoweb.com';
const FETCH_WEBRTC_TOKEN_URL = `${WP_BASE}/wp-json/eleven/v1/webrtc-token?agent_id=${encodeURIComponent(AGENT_ID)}`;
```

* `AGENT_ID`: tu agente de ElevenLabs.
* `WP_BASE` y endpoint: servicio que devuelve un **token WebRTC** para `Conversation.startSession`. &#x20;

---

## 5) Cómo ejecutar

1. Levanta el servidor local en la carpeta del proyecto.
2. Abre `http://localhost:8080/index.html` (o el puerto que uses).
3. Presiona **Connect mic** / **Conectar (mic)** y **permite el micrófono**.
4. Habla con el agente (el SDK maneja el audio).

> En `index.html` verás un **loader** mientras se carga el FBX; luego el modelo se **auto-encuadra** para evitar que salga gigante en pantalla.&#x20;

---

## 6) Controles y comportamiento

### `index.html` — demo enfocada a conversación

* **Botones:** Connect / Disconnect; selector de **micrófono**.
* **Half-duplex:** si el agente habla, el micrófono se **mutea**; cuando el agente calla, se **desmutea** automáticamente.&#x20;
* **Animación:**

  * **Solo la salida del agente** mueve la cabeza (oscilación sutil + *nod*) y el lipsync. Tu voz **no** mueve la figura.&#x20;
  * LIPSYNC: si existe **blendshape** de boca (p. ej. `MouthOpen`, `jawOpen`, etc.), se usa; si no, se rota el **hueso de mandíbula**; y, como *fallback*, se hace un micro *squash\&stretch* del *scale*.&#x20;
* **Debug:** presiona **D** para ver el **SkeletonHelper**.&#x20;

### `Untitled-1.html` — demo con panel de ajustes

* Selectores: **Mic**, **Morph** (blendshape) y **Jaw bone** (hueso).
* Sliders: **Gain**, **MaxAngle°**, **Gate**, **Attack**, **Release** para afinar la respuesta de labios en tiempo real.&#x20;
* Muestra en panel de debug: niveles de entrada/salida del agente y datos del lipsync.&#x20;

---

## 7) Materiales y texturas

Este repositorio incluye texturas base:

* `T_Head_BaseColor.png` — piel/cabeza
* `T_Ojos_BaseColor.png` — ojos
* `T_Tongue_BaseColor.png` — lengua

**Recomendación:** asigna estas texturas en tu DCC (Blender/Maya) y exporta el FBX con materiales ya mapeados. Si prefieres hacerlo en runtime, puedes extender el loader para localizar los `MeshStandardMaterial` por nombre y aplicar `map` con `TextureLoader`.

---

## 8) Personalización rápida

* **Cambiar el modelo:** sustituye `P1_v02.fbx` y ajusta `FBX_URL`. &#x20;
* **Invertir eje/signo de la mandíbula:** en `Untitled-1.html` puedes forzar `JAW_AXIS_HINT` y `JAW_SIGN_HINT` si el modelo abre al revés.&#x20;
* **Mostrar/ocultar huesos:** tecla **D** (ambos HTML). &#x20;

---

## 9) Solución de problemas

* **“Failed to resolve module specifier 'livekit-client'”**
  Asegúrate de abrir el HTML **desde un servidor** y mantener el **import map** que apunta a `esm.sh`. &#x20;
* **El modelo sale gigante / fuera de cámara**
  Ya se aplica **auto-framing** al cargar; si cambias el FBX, se volverá a encuadrar.&#x20;
* **No se mueve con mi voz**
  Es intencional en `index.html`: **solo** la voz del agente anima el avatar (tu mic no controla labios/cabeza). Usa `Untitled-1.html` si quieres testear niveles, pero ahí también el lipsync viene del **SDK del agente** (input/output volumes). &#x20;
* **Texturas no se ven**
  Sirve los PNG desde el mismo origen y verifica rutas/UVs del FBX. Considera precargar con `TextureLoader`.

---

## 10) Créditos y licencias

* **Three.js**, **LiveKit Client**, **@elevenlabs/client** — sus licencias respectivas.
* Modelo/arte y texturas: propios del proyecto (sustituye este texto por tu licencia preferida).

---

## 11) Roadmap corto (ideas)

* Aplicar materiales y normal maps en runtime.
* Sistema de **visemas** por fonema (si el agente expone eventos).
* GUI mínima para **cambiar avatar** y guardar perfiles de lipsync.

---

¡Listo! Con esto deberías poder clonar, servir localmente y correr cualquiera de las dos variantes para tu demo de **avatar 3D parlante**.
