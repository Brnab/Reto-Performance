================================================================================
                    GUÍA DE EJECUCIÓN — LOAD TESTING
                  Servicio de Autenticación (Login) — FakeStore API
================================================================================

PROYECTO:        Performance Load Testing — SPEC-004
FECHA:           2026-04-19
VERSIÓN:         2.0
HERRAMIENTA:     k6 v1.7.1 (Grafana k6 / OSS k6)
LENGUAJE:        JavaScript (ES6)

================================================================================
                           REQUERIMIENTOS DEL SISTEMA
================================================================================

1. VERSIONES REQUERIDAS:
   - k6 v1.7.1 o superior  ← versión verificada en este proyecto
     Descargar desde: https://k6.io/docs/getting-started/installation/

   - Node.js v18+ (opcional, para generación de reportes .docx)
     Versión verificada: v24.14.1
   
   - Sistema Operativo:
     ✓ Windows 10+
     ✓ macOS 10.12+
     ✓ Linux (Ubuntu 18.04+)

2. CONEXIÓN A INTERNET:
   ✓ Requerida para acceder a: https://fakestoreapi.com

3. RECURSOS MÍNIMOS:
   - RAM:       2 GB disponible
   - CPU:       Dual-core (se recomienda quad-core)
   - Disco:     1 GB para reportes

================================================================================
                              INSTALACIÓN
================================================================================

OPCIÓN A: INSTALACIÓN EN WINDOWS (PowerShell como Admin)

1. Descargar k6:
   - Ir a: https://k6.io/docs/getting-started/installation/
   - Seleccionar: Windows → Download

2. Extraer archivo descargado:
   - Crear carpeta: C:\k6
   - Extraer el .zip en esa carpeta

3. Agregar k6 al PATH:
   - Presionar Windows + X → Símbolo del Sistema (Admin)
   - Ejecutar: 
     set PATH=%PATH%;C:\k6

4. Verificar instalación:
   - Abrir nueva terminal
   - Ejecutar: k6 --version
   - Resultado esperado: k6 v0.47.0 (o superior)

OPCIÓN B: INSTALACIÓN EN macOS/Linux

1. Instalar con Homebrew (macOS):
   brew install k6

2. Instalar en Linux (Ubuntu/Debian):
   sudo apt-get install k6

3. Verificar instalación:
   k6 --version

OPCIÓN C: USANDO DOCKER (Recomendado para CI/CD)

1. Requerimiento: Docker instalado

2. Ejecutar en Docker:
   docker run -v ${PWD}:/scripts -i grafana/k6 run /scripts/load-test-login.js

================================================================================
                        ESTRUCTURA DE ARCHIVOS
================================================================================

Proyecto/
├── src/
│   └── test/
│       ├── performance/
│       │   └── load-test-login.js          ← Script principal k6
│       └── resources/
│           └── data/
│               └── users-load-test.csv     ← Datos de prueba (5 usuarios)
│
├── conclusiones/                           ← Resultados y entregables
│   ├── resultados_ejercicio1.txt           ← Métricas reales de la ejecución
│   ├── conclusiones_ejercicio1.txt         ← Hallazgos y conclusiones Ejercicio 1
│   └── Informe_Resultados_Ejercicio2.docx  ← Informe formal Ejercicio 2
│
├
│
├── .gitignore                              ← Excluye .claude/, .github/, docs/
└── readme.txt                              ← Este archivo

================================================================================
                          PASO 1: PREPARACIÓN
================================================================================

1. CLONAR O DESCARGAR EL REPOSITORIO:
   
   git clone <url-del-repo>
   cd Performance

2. VERIFICAR ARCHIVOS REQUERIDOS:
   
   Windows (PowerShell):
   Get-Item src\test\resources\data\users-load-test.csv
   Get-Item src\test\performance\load-test-login.js
   
   macOS/Linux (Bash):
   ls -la src/test/resources/data/users-load-test.csv
   ls -la src/test/performance/load-test-login.js

3. VALIDAR CONTENIDO DEL CSV:
   
   El archivo users-load-test.csv debe contener:
   ```
   username,password
   donero,ewedon
   kevinryan,kev02937@
   johnd,m38rmF$
   derek,jklg*_56
   mor_2314,83r5^_
   ```

4. VERIFICAR CONECTIVIDAD A FAKESTOREAPI:
   
   Abrir navegador y acceder a:
   https://fakestoreapi.com/auth/login
   
   Debe responder con un formulario o instrucciones de uso.

================================================================================
                      PASO 2: EJECUTAR LOAD TEST
================================================================================

EJECUCIÓN BÁSICA (Salida a consola):

1. Abrir terminal/PowerShell

2. Navegar a la raíz del proyecto:
   cd /ruta/al/proyecto

3. Ejecutar el script:
   
   k6 run src/test/performance/load-test-login.js

4. Esperar a que termine (aproximadamente 15 minutos)

5. Observar salida:
   ✓ Fase ramp-up (0-2 min):    TPS 0→20  (executor: ramping-arrival-rate)
   ✓ Fase sostenida (2-13 min): TPS 20 constantes
   ✓ Fase ramp-down (13-15 min): TPS 20→0

   NOTA: El script usa executor 'ramping-arrival-rate' que controla TPS
   directamente (no VUs). El número de VUs activos varía automáticamente
   entre 0 y 50 según la demanda.

EJECUCIÓN CON REPORTE HTML (Recomendado):

1. Instalar k6-html-reporter:
   npm install -g html-reporter
   (Si npm no está disponible, saltarse este paso)

2. Ejecutar con output HTML:
   
   Windows (PowerShell):
   k6 run `
     --out json=docs/output/qa/summary.json `
     src/test/performance/load-test-login.js

   macOS/Linux (Bash):
   k6 run \
     --out json=docs/output/qa/summary.json \
     src/test/performance/load-test-login.js

3. Generar reporte HTML (opcional):
   html-reporter \
     -i docs/output/qa/summary.json \
     -o docs/output/qa/report.html

EJECUCIÓN CON DIFERENTES CONFIGURACIONES:

⚠️ IMPORTANTE: Los flags --stage de k6 solo funcionan con el executor por
   defecto (VU-based). El script actual usa 'ramping-arrival-rate', por lo que
   para cambiar la configuración se deben editar los 'stages' directamente
   dentro del archivo load-test-login.js.

A) Prueba Corta (3 minutos, para desarrollo):
   Editar load-test-login.js → stages:
     { duration: '30s', target: 10 },
     { duration: '2m',  target: 10 },
     { duration: '30s', target: 0  },

B) Prueba Intensiva (30 minutos, mayor TPS):
   Editar load-test-login.js → stages:
     { duration: '5m',  target: 50 },
     { duration: '20m', target: 50 },
     { duration: '5m',  target: 0  },
   Ajustar también: preAllocatedVUs: 80, maxVUs: 100

C) Soak Test (2 horas, detectar memory leaks):
   Editar load-test-login.js → stages:
     { duration: '5m',   target: 20 },
     { duration: '110m', target: 20 },
     { duration: '5m',   target: 0  },

================================================================================
                      PASO 3: INTERPRETAR RESULTADOS
================================================================================

DURANTE LA EJECUCIÓN:
- Observar líneas con "http_req_duration{}", "http_reqs", "errors"
- Monitorear TPS en tiempo real (debe crecer durante ramp-up)
- Detectar picos de latencia (P95, P99)

AL FINALIZAR:
Se mostrará el resumen personalizado del script y luego las métricas de k6:

  ╔════════════════════════════════════════════════════════════╗
  ║              RESUMEN DE PRUEBA DE CARGA                    ║
  ╠════════════════════════════════════════════════════════════╣
  ║ Total de Intentos de Login:                          15,599 ║
  ║ Logins Exitosos:                                     15,599 ║
  ║ Logins Fallidos:                                          0 ║
  ║ Tasa de Error:                                        0.00% ║
  ╚════════════════════════════════════════════════════════════╝

RESULTADOS REALES (ejecución 2026-04-19):

  http_req_duration p(50):  ~350 ms
  http_req_duration p(95):  ~400 ms   ← muy por debajo del SLA (1500 ms)
  http_req_failed:           0.00%
  http_reqs (promedio):     ~17.3 TPS (pico sostenido: 20 TPS)
  iteraciones totales:       15,599

VALIDAR CUMPLIMIENTO DE SLA:

✅ PASS:  http_reqs rate > 17 TPS       (Observado: 17.3 TPS promedio)
✅ PASS:  http_req_duration p(95) < 1500ms  (Observado: ~400 ms)
✅ PASS:  http_req_failed < 3%          (Observado: 0.00%)

RESULTADO GENERAL: ✅ VERDE — Todos los SLAs cumplidos (exit code 0)

================================================================================
                        PASO 4: ANALIZAR RESULTADOS
================================================================================

1. UBICACIÓN DE ARCHIVOS GENERADOS:
   
   - summary.json:     docs/output/qa/summary.json
   - report.html:      docs/output/qa/report.html (si se generó)
   - conclusiones.md:  docs/output/qa/conclusiones.md (plantilla)

2. ABRIR REPORTE HTML:
   
   Windows:
   start docs/output/qa/report.html
   
   macOS:
   open docs/output/qa/report.html
   
   Linux:
   firefox docs/output/qa/report.html

3. ACTUALIZAR CONCLUSIONES.MD:
   
   Editar: docs/output/qa/conclusiones.md
   Reemplazar valores de ejemplo con valores reales:
   - Throughput observado
   - Latencia P95 observada
   - Error rate observado
   - Nuevos hallazgos

4. DOCUMENTAR HALLAZGOS:
   
   Capturar en conclusiones.md:
   ✓ SLAs cumplidos / incumplidos
   ✓ Comportamiento durante ramp-up, sostenido, ramp-down
   ✓ Errores significativos observados
   ✓ Recomendaciones para mejora

================================================================================
                         PASO 5: INFORME DE ANÁLISIS
================================================================================

EJERCICIO 2: Analizar Resultados

1. USAR DATOS DE EJEMPLO:
   
   Los datos de ejemplo (140 VUs, 73.17 TPS, etc.) están incluidos en:
   - .github/specs/performance-load-testing.spec.md
   - docs/output/qa/Informe_Resultados.md

2. GENERAR INFORME FORMAL:
   
   El archivo Informe_Resultados.md contiene:
   ✓ Tabla de resultados observados
   ✓ Matriz Esperado vs Observado
   ✓ Análisis de errores (4xx vs 5xx)
   ✓ Interpretación de diagrama VUs-TPS
   ✓ Hallazgos y recomendaciones

3. CONVERTIR A .DOCX (Word):
   
   Opción A: Copiar contenido a Microsoft Word y formatear
   Opción B: Usar pandoc (si está instalado):
     pandoc -f markdown -t docx -o Informe_Resultados.docx Informe_Resultados.md
   
   Opción C: Usar Google Docs
     1. Copiar contenido markdown a Google Docs
     2. Formatear: títulos, colores, tablas
     3. Exportar como .docx

4. ESTRUCTURA DEL INFORME:
   
   - Portada (título, fecha, versión)
   - Tabla de contenidos
   - Resumen ejecutivo (1 página)
   - Resultados observados (tablas + gráficos)
   - Análisis cumplimiento SLA
   - Interpretación VUs vs TPS
   - Clasificación de errores
   - Hallazgos clave (5-10 puntos)
   - Recomendaciones priorizado
   - Próximos pasos
   - Conclusiones y sign-off

5. GUARDAR ARCHIVOS ENTREGABLES:
   
   - Informe_Resultados.docx (análisis formal)
   - Informe_Resultados.pdf (exportación)
   - Datos_Brutos.csv (tabla de resultados)

================================================================================
                         TROUBLESHOOTING
================================================================================

PROBLEMA: "k6 command not found"
SOLUCIÓN:
- Verificar que k6 está en PATH: k6 --version
- En Windows: Reiniciar PowerShell después de agregar a PATH
- Usar ruta completa: C:\k6\k6.exe run script.js

PROBLEMA: "No such file or directory: users-load-test.csv"
SOLUCIÓN:
- Verificar ruta del CSV: src/test/resources/data/users-load-test.csv
- Usar rutas relativas desde raíz del proyecto
- Validar que el CSV contiene 5 usuarios (sin header duplicado)

PROBLEMA: "Connection refused" o "HTTP 502"
SOLUCIÓN:
- Verificar conectividad a internet
- Validar que fakestoreapi.com está accesible (ping o curl)
- Esperar 5 min e intentar nuevamente (API puede tener downtime)

PROBLEMA: "http_req_failed rate=X% higher than threshold"
SOLUCIÓN:
- Error rate > 3% es anormal
- Verificar logs del servidor (FakeStore)
- Reducir VUs en script si es necesario
- Contactar a soporte de FakeStore

PROBLEMA: "Cannot find module" (al generar reporte)
SOLUCIÓN:
- Instalar dependencias: npm install
- O usar opción más simple: k6 run --out json=summary.json script.js

PROBLEMA: "Latency very high" (P95 > 2s)
SOLUCIÓN:
- Red lenta o FakeStore con problemas
- Ejecutar en horario diferente (menos carga)
- Usar máquina con mejor conexión

================================================================================
                        EJECUCIÓN RECOMENDADA
================================================================================

PLAN DE TESTING (4 SEMANAS):

SEMANA 1: Load Testing
- [ ] Ejecutar load-test-login.js (15 min, 20 VUs)
- [ ] Capturar summary.json y report.html
- [ ] Generar conclusiones.md
- [ ] Analizar resultados

SEMANA 2: Análisis
- [ ] Crear Informe_Resultados.md
- [ ] Convertir a .docx (Word)
- [ ] Recopilar datos brutos (CSV)
- [ ] Sign-off del informe

SEMANA 3: Ejecuciones Adicionales
- [ ] Stress Test (escalar hasta punto de quiebre)
- [ ] Soak Test (2 horas para detectar memory leaks)
- [ ] Comparar contra baseline

SEMANA 4: Documentación Final
- [ ] Generar reporte ejecutivo
- [ ] Crear dashboard de métricas
- [ ] Documentar SLAs en contratos
- [ ] Presentar hallazgos a equipo

================================================================================
                          ARCHIVOS ENTREGABLES
================================================================================

EJERCICIO 1 - Load Testing:

📄 load-test-login.js
   Ubicación: src/test/performance/
   Tipo: JavaScript (k6 script)
   Descripción: Script ejecutable para prueba de carga

📄 users-load-test.csv
   Ubicación: src/test/resources/data/
   Tipo: CSV
   Descripción: Datos de prueba (5 usuarios)

📊 summary.json
   Ubicación: docs/output/qa/
   Tipo: JSON
   Descripción: Resumen de métricas (generado en ejecución)

📊 report.html
   Ubicación: docs/output/qa/
   Tipo: HTML
   Descripción: Reporte visual interactivo (generado en ejecución)

📝 conclusiones.md
   Ubicación: docs/output/qa/
   Tipo: Markdown
   Descripción: Análisis y hallazgos de la prueba

EJERCICIO 2 - Análisis:

📄 Informe_Resultados.docx
   Ubicación: docs/output/qa/
   Tipo: Word
   Descripción: Informe formal con análisis completo

📄 Informe_Resultados.pdf
   Ubicación: docs/output/qa/
   Tipo: PDF
   Descripción: Exportación para archivado

📊 Datos_Brutos.csv
   Ubicación: docs/output/qa/
   Tipo: CSV
   Descripción: Tabla de resultados detallados

================================================================================
                        CONTATOS Y SOPORTE
================================================================================

DOCUMENTACIÓN:
- k6 Oficial:  https://k6.io/docs/
- FakeStore API: https://fakestoreapi.com/
- Spec ASDD:  .github/specs/performance-load-testing.spec.md

CONTACTOS:
- QA Team:  qa@company.com
- DevOps:   devops@company.com
- Lead:     tech-lead@company.com

================================================================================

                    ✅ GUÍA COMPLETADA

        Para más información, consultar SPEC-004 en
        .github/specs/performance-load-testing.spec.md

================================================================================
Versión: 2.0
Última actualización: 2026-04-19
Estado: APROBADO PARA USO — Ejecución validada con exit code 0
