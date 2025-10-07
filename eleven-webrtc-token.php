<?php
/**
 * eleven-webrtc-token.php — Proxy simple para token WebRTC de ElevenLabs
 * - Método: GET
 * - Parámetros: ?agent_id=agent_xxx (opcional, usa un default)
 * - Respuesta: { "token": "..." }
 */

declare(strict_types=1);

// === CONFIG ===
// 1) Si usas variable de entorno:
// $apiKey = getenv('ELEVEN_API_KEY');
$apiKey = "sk_3c458d4d2d0978eb24116918e29b246bff3090f45aeb3ec8";

// 2) O defínelo aquí (descomenta y reemplaza):
// define('ELEVEN_API_KEY', 'TU_API_KEY_AQUI');

// Si lo definiste por constante, úsalo:
if (defined('ELEVEN_API_KEY') && ELEVEN_API_KEY) {
  $apiKey = ELEVEN_API_KEY;
}

// --- CORS: permite tu origen local y el dominio del sitio ---
$origin      = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowList   = [
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://test-ai.garabatoweb.com',
  // agrega aquí otros orígenes permitidos
];

// Siempre anunciamos qué headers soportamos/preflight
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si el Origin está en whitelist, permítelo
if ($origin && in_array($origin, $allowList, true)) {
  header("Access-Control-Allow-Origin: {$origin}");
}

// Responder preflight
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// JSON siempre
header('Content-Type: application/json; charset=utf-8');

// --- Validaciones ---
if (!$apiKey) {
  http_response_code(500);
  echo json_encode([
    'code' => 'no_api_key',
    'message' => 'Falta ELEVEN_API_KEY (variable de entorno o constante).'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// agent_id desde query o default
$agent_id = $_GET['agent_id'] ?? '';
$agent_id = is_string($agent_id) ? trim($agent_id) : '';
if ($agent_id === '') {
  // Default tomado de tu snippet
  $agent_id = 'agent_5501k5ckwydxem1s0sdzjj17ej9m';
}

// --- Llamado a ElevenLabs ---
$endpoint = 'https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=' . rawurlencode($agent_id);

// Usamos cURL
$ch = curl_init($endpoint);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 20,
  CURLOPT_HTTPHEADER => [
    'xi-api-key: ' . $apiKey,
    'Accept: application/json',
  ],
  CURLOPT_SSL_VERIFYPEER => true,
  CURLOPT_SSL_VERIFYHOST => 2,
]);

$body = curl_exec($ch);
$err  = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE) ?: 0;
curl_close($ch);

if ($err) {
  http_response_code(502);
  echo json_encode([
    'code' => 'eleven_error',
    'message' => $err
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($code < 200 || $code >= 300) {
  http_response_code($code ?: 502);
  echo json_encode([
    'code' => 'eleven_http',
    'message' => $body ?: 'Error ElevenLabs'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Pasar tal cual la respuesta (asegurando que es JSON)
$decoded = json_decode($body, true);
if ($decoded === null) {
  // Respuesta no-JSON— la empaquetamos
  echo json_encode(['raw' => $body], JSON_UNESCAPED_UNICODE);
} else {
  echo json_encode($decoded, JSON_UNESCAPED_UNICODE);
}
