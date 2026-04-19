# GUÍA: Instalar y Configurar k6 + VSCode

**Fecha**: 2026-04-17  
**Sistema**: Windows 10+  
**Tiempo estimado**: 15 minutos

---

## PASO 1: Instalar k6

### Opción A: Instalador Directo (Recomendado para Windows)

1. Ir a: https://k6.io/docs/getting-started/installation/
2. Descargar: **Windows** → `k6-vX.X.X-windows-amd64.zip`
3. Extraer en carpeta: `C:\k6`
4. Agregar al PATH del sistema:
   - Presionar: **Windows + X**
   - Seleccionar: **Símbolo del sistema (Admin)** o **Windows Terminal (Admin)**
   - Ejecutar:
     ```cmd
     setx PATH "%PATH%;C:\k6"
     ```
5. **Cerrar y reabrir** terminal para aplicar cambios

6. Verificar instalación:
   ```cmd
   k6 --version
   ```
   **Resultado esperado**: `k6 v0.47.0` (o superior)

### Opción B: Chocolatey (Si tienes instalado)

```powershell
choco install k6
```

### Opción C: Scoop

```powershell
scoop install k6
```

---

## PASO 2: Instalar Extensión de k6 en VSCode

1. Abre **VSCode**
2. Presiona: **Ctrl + Shift + X** (Extensiones)
3. Busca: `k6`
4. Instala: **"k6"** (oficial, por Grafana)
   - Icon: Logo de k6 rojo
   - Autor: Grafana
5. Espera a que termine la instalación

✅ **Extensión instalada**

---

## PASO 3: Verificar Configuración de VSCode

Los archivos ya están creados:

```
.vscode/
├── tasks.json        ✅ (5 tareas predefinidas)
├── launch.json       ✅ (2 configuraciones debug)
└── settings.json     ✅ (Extensiones recomendadas)
```

Si VSCode pide instalar extensiones recomendadas:
- **Presiona**: "Install" en la notificación
- Instala: `prettier-vscode` y `k6` (si aún no está)

---

## PASO 4: USAR LAS TAREAS

### Opción A: Desde Menú (Más Fácil)

1. Abre VSCode
2. Presiona: **Ctrl + Shift + P** (Palette de Comandos)
3. Escribe: `task` 
4. Selecciona: **"Tasks: Run Task"**
5. Elige una tarea:
   ```
   ✓ k6: Run Load Test (15 min)  ← PRINCIPAL
   - k6: Run Quick Test (3 min)
   - k6: Run Stress Test (30 min)
   - k6: Check Version
   - k6: Validate Script
   ```
6. **Enter** → La tarea se ejecuta

### Opción B: Keyboard Shortcut (Más Rápido)

**Para ejecutar la tarea por defecto** (Load Test 15 min):
```
Presiona: Ctrl + Shift + B
```

### Opción C: Desde Terminal Integrado

1. Presiona: **Ctrl + `` (backtick)** (abre terminal)
2. Ejecuta:
   ```bash
   k6 run src/test/performance/load-test-login.js
   ```

---

## PASO 5: VER LA EJECUCIÓN EN VIVO

Cuando ejecutes una tarea:

```
Terminal Integrado (VSCode)
├─ [INFO] Iniciando k6 v0.47.0
├─ [INFO] Fase ramp-up: 0→20 VUs (2 min)
├─ [INFO] Fase sostenida: 20 VUs (11 min)
├─ [INFO] Fase ramp-down: 20→0 VUs (2 min)
└─ [INFO] Resumen de resultados
   ├─ Throughput: 73.17 TPS
   ├─ Latencia P95: 1570ms
   ├─ Error Rate: 2.44%
   └─ Archivo guardado: docs/output/qa/summary.json
```

---

## TAREAS DISPONIBLES

### 1️⃣ **k6: Run Load Test (15 min)** — RECOMENDADA
- Patrón: 0→20 VUs (2 min) + 20 VUs (11 min) + 0 (2 min)
- Salida: JSON + stdout
- Archivo: `docs/output/qa/summary.json`
- **Cuando usar**: Validación estándar de rendimiento

### 2️⃣ **k6: Run Quick Test (3 min)** — DESARROLLO
- Patrón: 0→10 VUs (1 min) + 10 VUs (1 min) + 0 (1 min)
- Rápida para testing
- **Cuando usar**: Verificar script funciona antes de test largo

### 3️⃣ **k6: Run Stress Test (30 min)** — INTENSO
- Patrón: 0→50 VUs (5 min) + 50 VUs (20 min) + 0 (5 min)
- Encuentra punto de quiebre
- **Cuando usar**: Identificar límite máximo de capacidad

### 4️⃣ **k6: Check Version**
- Verifica que k6 esté instalado
- **Cuando usar**: Diagnosticar problemas

### 5️⃣ **k6: Validate Script**
- Valida sintaxis sin ejecutar
- Útil para debugging
- **Cuando usar**: Antes de ejecutar test largo

---

## TROUBLESHOOTING

### ❌ Problema: "k6: comando no encontrado"

**Solución:**
1. Verificar PATH:
   ```cmd
   echo %PATH%
   ```
   Debe contener: `C:\k6`

2. Si no está, agregar manualmente:
   - Windows → Buscar: "Variables de entorno"
   - Clic: "Editar las variables de entorno del sistema"
   - Botón: "Variables de entorno..."
   - Nueva variable:
     - Nombre: `PATH`
     - Valor: `C:\k6` (append to existing)
   - **Reiniciar VSCode**

### ❌ Problema: "No se ve la tarea en VSCode"

**Solución:**
1. Presiona: **Ctrl + Shift + P**
2. Busca: `Reload Window`
3. Presiona: **Enter**
4. Ahora debería aparecer la tarea

### ❌ Problema: "Error: archivo CSV no encontrado"

**Solución:**
1. Verificar que existe: `src/test/resources/data/users-load-test.csv`
2. Si no existe, crear:
   ```
   username,password
   donero,ewedon
   kevinryan,kev02937@
   johnd,m38rmF$
   derek,jklg*_56
   mor_2314,83r5^_
   ```

### ❌ Problema: "Error: No se puede conectar a fakestoreapi.com"

**Solución:**
1. Verificar conexión a internet
2. Probar manualmente:
   ```bash
   curl -X POST https://fakestoreapi.com/auth/login -H "Content-Type: application/json" -d '{"username":"donero","password":"ewedon"}'
   ```
3. Si falla: FakeStore API podría estar caído (esperar 5-10 min)

---

## RESULTADO ESPERADO

Cuando todo está instalado y configurado:

```
┌─────────────────────────────────────────────┐
│  VSCode (Abierto)                           │
├─────────────────────────────────────────────┤
│  Ctrl + Shift + P → "Task" → "Load Test"   │
│                    ↓                        │
│  Terminal integrado muestra:                │
│  ✓ k6 v0.47.0                              │
│  ✓ Carga de usuarios: 5 usuarios OK        │
│  ✓ Fase ramp-up: 0→20 VUs                  │
│  ✓ Fase sostenida: 20 VUs constantes      │
│  ✓ Fase ramp-down: 20→0 VUs               │
│  ✓ Resumen: Throughput, Latencia, Errores │
│  ✓ Archivo: summary.json generado ✅      │
└─────────────────────────────────────────────┘
```

---

## CHECKLIST FINAL

- [ ] **Paso 1**: k6 instalado (`k6 --version` funciona)
- [ ] **Paso 2**: Extensión "k6" por Grafana instalada
- [ ] **Paso 3**: Archivos .vscode/ presentes (tasks.json, launch.json)
- [ ] **Paso 4**: `Ctrl + Shift + P` → "Run Task" muestra tareas k6
- [ ] **Paso 5**: Ejecutar `Ctrl + Shift + B` sin errores
- [ ] **Resultado**: summary.json creado en docs/output/qa/

---

## COMANDOS RÁPIDOS

```bash
# Verificar instalación
k6 --version

# Ejecutar desde terminal
k6 run src/test/performance/load-test-login.js

# Ejecutar con archivo de salida JSON
k6 run --out json=docs/output/qa/summary.json src/test/performance/load-test-login.js

# Validar script (dry-run)
k6 run --dry-run src/test/performance/load-test-login.js

# Ejecutar con stages personalizados
k6 run --stage 1m:10 --stage 1m:10 --stage 1m:0 src/test/performance/load-test-login.js
```

---

## SOPORTE

Si tienes problemas:

1. **Documentación oficial k6**: https://k6.io/docs/
2. **Ext. k6 en VSCode**: Click en extensión → "Documentation"
3. **Revisar**: `.github/specs/performance-load-testing.spec.md`
4. **Guía completa**: `README_LOAD_TESTING.txt`

---

## PRÓXIMOS PASOS DESPUÉS DE INSTALAR

1. ✅ Abre VSCode
2. ✅ Presiona `Ctrl + Shift + B` para ejecutar Load Test
3. ✅ Espera ~15 minutos
4. ✅ Revisa output en terminal
5. ✅ Abre `docs/output/qa/summary.json` para ver métricas
6. ✅ Actualiza `docs/output/qa/conclusiones.md` con resultados

---

**Configuración completada** ✅  
**Fecha**: 2026-04-17  
**Versión**: 1.0
