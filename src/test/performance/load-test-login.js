import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ==================== MÉTRICAS PERSONALIZADAS ====================
const errorRate = new Rate('errors');
const latencyByUser = new Trend('http_req_duration_by_user');
const loginCounter = new Counter('login_attempts');
const failedLogins = new Counter('failed_logins');
const successfulLogins = new Counter('successful_logins');

// ==================== PARAMETRIZACIÓN DESDE CSV ====================
const users = new SharedArray('users', function () {
  const data = open('../resources/data/users-load-test.csv');
  return data
    .split('\n')
    .slice(1)                                    // saltar encabezado
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const [username, password] = line.split(',');
      return [username.trim(), password.trim()];
    });
});

// ==================== CONFIGURACIÓN k6 ====================
export const options = {
  scenarios: {
    login_rate: {
      executor: 'ramping-arrival-rate',  // Controla TPS directamente
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 30,               // VUs pre-asignados para mantener 20 TPS
      maxVUs: 50,                        // Techo de VUs si la latencia sube
      stages: [
        { duration: '2m', target: 20 },  // Ramp-up: 0→20 TPS en 2 minutos
        { duration: '11m', target: 20 }, // Sostenido: 20 TPS constantes
        { duration: '2m', target: 0 },   // Ramp-down: 20→0 TPS en 2 minutos
      ],
    },
  },
  thresholds: {
    'http_req_duration': [
      'p(50) < 500',                    // P50 < 500ms
      'p(95) < 1500',                   // P95 < 1.5s (SLA crítico)
      'p(99) < 3000',                   // P99 < 3s
    ],
    'http_req_failed': ['rate < 0.03'], // Error rate < 3%
    'http_reqs': ['rate > 17'],         // Throughput promedio > 17 TPS (pico sostenido 20 TPS; rampas reducen promedio global a ~17.3 TPS)
    'errors': ['rate < 0.03'],          // Métrica personalizada
  },
};

// ==================== TEST PRINCIPAL ====================
export default function () {
  // Asignar usuario de forma round-robin por VU
  const userIndex = (__VU - 1) % users.length;
  const [username, password] = users[userIndex];
  
  group('Login Flow', () => {
    // Preparar payload
    const payload = JSON.stringify({
      username: username,
      password: password,
    });

    // Ejecutar POST /auth/login
    const response = http.post(
      'https://fakestoreapi.com/auth/login',
      payload,
      {
        headers: { 
          'Content-Type': 'application/json',
        },
        timeout: '5s',
        tags: { name: 'LoginEndpoint' },
      }
    );

    // Contar intento
    loginCounter.add(1);

    // Validaciones
    const isSuccess = check(response, {
      'status is 201': (r) => r.status === 201,
      'token present': (r) => {
        try {
          const body = r.json();
          return body && typeof body.token === 'string' && body.token.length > 0;
        } catch (_) {
          return false;
        }
      },
      'latency < 1.5s': (r) => r.timings.duration < 1500,
    });

    // Registrar métrica personalizada por usuario
    latencyByUser.add(response.timings.duration, { 
      user: username,
      vu: __VU,
      status: response.status,
    });

    // Contabilizar resultado
    if (!isSuccess) {
      errorRate.add(1);
      failedLogins.add(1);
      console.error(`✗ LOGIN FAILED [${username}] - Status: ${response.status}`);
    } else {
      successfulLogins.add(1);
    }

    // Log detallado en caso de error
    if (response.status !== 201) {
      console.warn(
        `⚠ HTTP ${response.status} - User: ${username} - Duration: ${response.timings.duration}ms`
      );
    }

    // Sleep para simular comportamiento real
    sleep(1);
  });
}

// ==================== RESUMEN FINAL ====================
// handleSummary recibe los valores reales de métricas al finalizar el test
export function handleSummary(data) {
  const totalAttempts  = data.metrics['login_attempts']?.values?.count ?? 0;
  const totalFailed    = data.metrics['failed_logins']?.values?.count ?? 0;
  const totalSuccessful = data.metrics['successful_logins']?.values?.count ?? 0;
  const failureRate = totalAttempts > 0 ? ((totalFailed / totalAttempts) * 100).toFixed(2) : '0.00';

  console.log(`
╔════════════════════════════════════════════════════════════╗
║              RESUMEN DE PRUEBA DE CARGA                    ║
╠════════════════════════════════════════════════════════════╣
║ Total de Intentos de Login:  ${String(totalAttempts).padStart(30)} ║
║ Logins Exitosos:              ${String(totalSuccessful).padStart(30)} ║
║ Logins Fallidos:              ${String(totalFailed).padStart(30)} ║
║ Tasa de Error:                ${String(failureRate + '%').padStart(29)} ║
╠════════════════════════════════════════════════════════════╣
║ SLA Esperado: Error Rate < 3%                             ║
║ SLA Esperado: Throughput >= 20 TPS                        ║
║ SLA Esperado: P95 Latencia <= 1500ms                      ║
╚════════════════════════════════════════════════════════════╝
  `);

  return {};
}
