# Banco No del Estado · Mini Banco Digital

Proyecto de evaluación **TI3V31 · Programación Front End** — React + Firebase.

Aplicación SPA que simula una banca digital básica con autenticación, saldo en tiempo real, transferencias e historial de movimientos usando **Firebase Authentication** y **Cloud Firestore**.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalación paso a paso](#instalación-paso-a-paso)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Ejecutar el proyecto](#ejecutar-el-proyecto)
5. [Usuarios de prueba](#usuarios-de-prueba)
6. [Modelo de datos](#modelo-de-datos)
7. [Funcionalidades implementadas](#funcionalidades-implementadas)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Intervenciones en el código](#intervenciones-en-el-código)
10. [Variables de entorno y seguridad](#variables-de-entorno-y-seguridad)
11. [Uso de IA](#uso-de-ia)

---

## Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- Cuenta en [Firebase Console](https://console.firebase.google.com/)
- Git (para la entrega final en GitHub)

---

## Instalación paso a paso

### Paso 1 · Clonar o abrir el proyecto

```bash
cd "Prueba 2- MiniBanco"
```

### Paso 2 · Instalar dependencias

```bash
npm install
```

### Paso 3 · Crear archivo de entorno

Copia el archivo de ejemplo y completa tus credenciales:

```bash
copy .env.example .env
```

En Windows PowerShell también puedes usar:

```powershell
Copy-Item .env.example .env
```

### Paso 4 · Configurar Firebase

Sigue la sección [Configuración de Firebase](#configuración-de-firebase) antes de ejecutar la app.

### Paso 5 · Levantar la aplicación

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

### Paso 6 · Verificar compilación de producción (opcional)

```bash
npm run build
npm run preview
```

---

## Configuración de Firebase

### 1. Crear proyecto en Firebase Console

1. Entra a [Firebase Console](https://console.firebase.google.com/).
2. Crea un proyecto nuevo (ej: `xbank-minibanco`).
3. Agrega una **aplicación web** y copia las credenciales del SDK.

### 2. Activar Authentication

1. Ve a **Build → Authentication**.
2. Haz clic en **Comenzar**.
3. En **Sign-in method**, habilita **Correo electrónico/Contraseña**.

### 3. Crear base de datos Firestore

1. Ve a **Build → Firestore Database**.
2. Crea la base de datos en **modo de prueba** (para desarrollo local).
3. Elige la región más cercana.

### 4. Reglas de seguridad sugeridas (desarrollo)

> Ajusta estas reglas según lo indique tu profesor. Son un punto de partida para pruebas locales.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null;
    }

    match /movimientos/{movimientoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Completar el archivo `.env`

Pega tus valores en `.env` (este archivo **no se sube a Git**):

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> **Importante:** cuando tengas la `apiKey` y el resto de credenciales, solo van en `.env`. El repositorio incluye `.env.example` vacío como plantilla.

---

## Ejecutar el proyecto

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza build |

---

## Usuarios de prueba

Registra **2 usuarios** desde la pantalla de la app para probar transferencias entre cuentas.

| Usuario | Correo | Contraseña | Notas |
|---------|--------|------------|-------|
| Usuario 1 | `usuario1@test.com` | `Test1234` | Crear desde Registro |
| Usuario 2 | `usuario2@test.com` | `Test1234` | Crear desde Registro |

> Al registrarse, cada usuario recibe un **saldo inicial de $100.000** automáticamente.

**Prueba sugerida:**

1. Inicia sesión con Usuario 1.
2. Transfiere $10.000 a `usuario2@test.com`.
3. Abre otra ventana/incógnito con Usuario 2.
4. Verifica que el saldo y el historial se actualicen **sin refrescar** la página.

---

## Modelo de datos

### Colección `users`

```
users/{uid}
  ├── nombre: string
  ├── email: string
  └── saldo: number
```

### Colección `movimientos`

```
movimientos/{id}
  ├── emisorUid: string
  ├── receptorUid: string
  ├── emisorEmail: string
  ├── receptorEmail: string
  ├── monto: number
  ├── fecha: timestamp
  ├── descripcion: string
  └── tipo: "transferencia"
```

---

## Funcionalidades implementadas

### Requisitos obligatorios (RF1–RF5)

| RF | Descripción | Estado |
|----|-------------|--------|
| RF1 | Registro e inicio de sesión con Firebase Auth. Saldo inicial $100.000 | ✅ |
| RF2 | Dashboard con saldo en tiempo real vía `onSnapshot` | ✅ |
| RF3 | Transferencias con validaciones (monto, saldo, destinatario, no auto-transferencia) | ✅ |
| RF4 | Historial de movimientos en tiempo real, ordenado del más reciente al más antiguo | ✅ |
| RF5 | Cerrar sesión con limpieza de suscripciones (`unsubscribe`) | ✅ |

### Bonus implementados

- Depósito y retiro simulado con validación de saldo
- Filtro y búsqueda en historial (tipo + contraparte/descripción)
- Modo oscuro/claro persistente en `localStorage`
- Estado global de sesión con `useReducer` + `useContext`

---

## Estructura del proyecto

```
Prueba 2- MiniBanco/
├── .env.example          # Plantilla de variables (sin secretos)
├── .gitignore            # Excluye .env y node_modules
├── README.md
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── firebase/
    │   └── config.js           # Inicialización Firebase
    ├── services/
    │   ├── authService.js      # Login, registro, logout
    │   ├── userService.js      # Perfil y saldo
    │   ├── transferService.js  # Transferencias atómicas
    │   └── movementService.js  # Suscripción a movimientos
    ├── context/
    │   ├── authReducer.js      # Reducer de sesión
    │   └── AuthContext.jsx     # Provider global
    ├── hooks/
    │   ├── useUserProfile.js   # onSnapshot del usuario
    │   ├── useMovements.js     # onSnapshot del historial
    │   └── useTheme.js         # Tema persistente
    ├── components/
    │   ├── AuthPage.jsx
    │   ├── LoginForm.jsx
    │   ├── RegisterForm.jsx
    │   ├── Dashboard.jsx
    │   ├── BalanceCard.jsx
    │   ├── TransferForm.jsx
    │   ├── DepositWithdrawForm.jsx
    │   ├── MovementHistory.jsx
    │   ├── LoadingSpinner.jsx
    │   └── ErrorMessage.jsx
    └── utils/
        └── formatters.js
```

---

## Intervenciones en el código

Resumen de lo creado y modificado respecto al template base de Vite:

| Archivo / carpeta | Intervención |
|-------------------|--------------|
| `src/firebase/config.js` | **Creado.** Lee credenciales desde variables `VITE_*` e inicializa Auth y Firestore. |
| `src/services/*` | **Creado.** Capa de servicios separada de los componentes. Transferencias con `runTransaction`. |
| `src/context/*` | **Creado.** Sesión global con `useReducer` + `useContext` y suscripción a `onAuthStateChanged`. |
| `src/hooks/*` | **Creado.** Hooks con `onSnapshot`, estados loading/error y cleanup en `useEffect`. |
| `src/components/*` | **Creado.** UI modular: auth, dashboard, transferencias, historial, depósito/retiro. |
| `src/utils/formatters.js` | **Creado.** Formato de moneda CLP, fechas y mensajes de error Firebase. |
| `src/App.jsx` | **Reescrito.** Enrutamiento simple: login vs dashboard según sesión. |
| `src/main.jsx` | **Modificado.** Eliminada referencia a `App.css`. |
| `src/index.css` | **Reescrito.** Estilos propios con variables CSS y modo oscuro/claro. |
| `src/App.css` | **Eliminado.** Reemplazado por `index.css`. |
| `index.html` | **Modificado.** Título y lang `es`. |
| `.gitignore` | **Modificado.** Agregado `.env` y variantes para no subir credenciales. |
| `.env.example` | **Creado.** Plantilla vacía para configuración local. |
| `package.json` | **Modificado.** Dependencia `firebase` agregada. |

### Decisiones técnicas relevantes

- **Saldo en tiempo real:** no se guarda en un `useState` aislado; se suscribe al documento `users/{uid}` con `onSnapshot`.
- **Historial:** dos consultas (`emisorUid` y `receptorUid`) que se fusionan y ordenan; ambas se limpian al desmontar o cerrar sesión.
- **Transferencias:** validación en UI antes de Firestore + transacción atómica que actualiza ambos saldos y crea el movimiento.
- **Formularios:** inputs controlados, handlers nombrados y `preventDefault()` en submits.

---

## Variables de entorno y seguridad

| Archivo | ¿Se sube a Git? | Contenido |
|---------|-----------------|-----------|
| `.env` | ❌ No | Credenciales reales (apiKey, projectId, etc.) |
| `.env.example` | ✅ Sí | Plantilla con claves vacías |
| `.gitignore` | ✅ Sí | Incluye `.env`, `.env.local`, `.env.*.local` |

**Antes de subir a GitHub:**

1. Verifica que `.env` no esté en el staging: `git status`
2. Si aparece, no lo agregues: `git reset .env`
3. Solo commitea `.env.example`

---

## Uso de IA

Se utilizó IA (Cursor/Claude) en distintas etapas del proyecto, no solo para escribir código:

**Generación y estructura inicial**
- Scaffolding con Vite, organización de carpetas (`services/`, `components/`, `hooks/`, `context/`)
- Borrador del README y guías de configuración de Firebase

**Auditoría y revisiones del código**
- Revisión de la separación entre capa de servicios y componentes de UI
- Verificación de buenas prácticas reactivas: suscripciones con `onSnapshot`, función de limpieza (`unsubscribe`) en `useEffect` y dependencias correctas
- Revisión del manejo de eventos: formularios controlados, `preventDefault`, validaciones antes de Firestore y prevención de doble submit
- Auditoría de seguridad básica: credenciales en `.env`, `.gitignore` y plantilla `.env.example`
- Revisión de la lógica de transferencias con `runTransaction` (atomicidad entre saldos y movimientos)
- Corrección de mensajes de error traducidos al español y feedback visible al usuario

**Qué se ajustó manualmente después de la IA**
- Lógica de fusión de dos suscripciones para el historial (enviados + recibidos)
- Validación de RUT chileno y autenticación con RUT + contraseña
- Decisiones de diseño visual (colores, layout del dashboard) y pruebas en Firebase Console

La IA funcionó como apoyo para generar, revisar y corregir el código, pero cada decisión final fue validada probando la app en local (`npm run dev`) y entendiendo el flujo completo antes de integrarlo.

---

## Autor

Proyecto académico por Sebastian Salazar — INACAP · TI3V31 Programación Front End.
