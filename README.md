# SIGIA · Sistema de Gestión de Ingresos y Ahorros

Aplicación web de finanzas personales. Cada usuario registra sus gastos e ingresos, los clasifica por frecuencia y grupos, administra cuentas y revisa una checklist periódica. Lo que no marca en la checklist cuenta como **ahorrado**.

> **Estado:** 🚧 Sprint 6 (cierre) · 21 de 23 historias de usuario integradas en `develop` · Última actualización: 26/11/2026

## Funcionalidades

| Módulo | Qué permite | HU |
|---|---|---|
| Autenticación | Registro, inicio de sesión (correo o Google), cierre de sesión y rutas privadas. Al registrarse se crea la cuenta **Bolsillo** | HU-01 a 03 |
| Gastos e ingresos | Crear, reutilizar (último valor), editar y archivar conceptos y movimientos. Frecuencia obligatoria | HU-04 a 07 |
| Etiquetas y grupos | Grupos personalizados con íconos verdes, neutros o rojos | HU-08, 09 |
| Consulta | Cards, filtros combinables (nombre, fecha, etiqueta, valor), detalle con indicadores, historial y gráficas | HU-10 a 13 |
| Cuentas | Crear cuentas, ver la evolución del saldo y compararlo con ayer, la semana, el mes y el año anteriores | HU-14, 15 |
| Checklist y ahorro | Checklist diaria, semanal, mensual y anual. Totales de ahorro por periodo y metas con progreso | HU-16 a 19 |
| Dashboard | Gastos frente a ingresos por mes y en total, con filtro de fechas | HU-20 |
| Experiencia | Esqueletos de carga en todas las páginas | HU-21 |

Pendientes y limitaciones conocidas: ver [Estado y pendientes](#estado-y-pendientes).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · TypeScript · Vite |
| Rutas | React Router 7 |
| Backend | Firebase Authentication · Cloud Firestore |
| Formularios | React Hook Form · Zod |
| Interfaz | Tailwind CSS 4 · shadcn/ui · Radix UI · Remix Icon |
| Gráficas | Recharts |
| Notificaciones | notistack |
| Pruebas | Vitest (unitarias, con cobertura v8) |
| Calidad | Oxlint · `tsc --noEmit` |

## Empezar

**Requisitos:** Node.js 20.19+ o 22.12+, y un proyecto de Firebase con Authentication (correo y Google) y Cloud Firestore habilitados.

```bash
git clone https://github.com/Mity619/SIGIA.git
cd SIGIA
npm install
cp .env.template .env   # completar con las credenciales web de Firebase
npm run dev             # http://localhost:5173
```

El archivo `.env` está en `.gitignore` y nunca se sube al repositorio.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos y build de producción |
| `npm run preview` | Sirve el build localmente |
| `npm run typecheck` | Solo chequeo de tipos |
| `npm run lint` | Oxlint |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:coverage` | Pruebas con cobertura de `src/domain` (umbral 90 %) |

## Estructura

```text
src/
├── app/            # router, rutas privadas/solo invitados y providers
├── domain/         # lógica financiera pura (sin React ni Firebase) + pruebas
├── features/
│   ├── auth/           # registro, login, sesión
│   ├── accounts/       # cuentas, saldos y comparaciones
│   ├── items/          # gastos e ingresos: listado, filtros, detalle, formulario
│   ├── tags/           # grupos e íconos
│   ├── home-checklist/ # checklist periódica
│   ├── savings/        # página de ahorro y metas
│   ├── dashboard/      # gastos frente a ingresos
│   └── team/           # página de presentación del equipo
├── firebase/       # configuración y hooks genéricos de Firestore
├── pages/          # páginas enrutables
├── shared/         # componentes UI, skeletons, utilidades (fechas, formato)
└── styles/         # tema (tokens de color) y estilos globales
```

Más detalle en [docs/arquitectura.md](docs/arquitectura.md).

## Rutas

| Ruta | Acceso | Página |
|---|---|---|
| `/` | Pública | Inicio |
| `/signup` | Pública | Registro |
| `/login` | Solo sin sesión | Inicio de sesión |
| `/cualquier-cosa` | Pública | Presentación del equipo |
| `/dashboard` | Privada | Checklist y resumen de gastos frente a ingresos |
| `/expenses` | Privada | Menú de gastos, ingresos y etiquetas |
| `/gastos`, `/ingresos` | Privada | Listado con filtros |
| `/gastos/nuevo`, `/ingresos/nuevo` | Privada | Registrar movimiento |
| `/gastos/:id`, `/ingresos/:id` | Privada | Detalle e historial |
| `/etiquetas` | Privada | Grupos personalizados |
| `/cuentas`, `/cuentas/:accountId` | Privada | Cuentas y detalle de saldo |
| `/ahorro` | Privada | Ahorro por periodo y metas |
| `*` | Pública | Página 404 |

## Documentación

| Documento | Contenido |
|---|---|
| [docs/arquitectura.md](docs/arquitectura.md) | Capas, flujo de datos y decisiones técnicas |
| [docs/diccionario-datos.md](docs/diccionario-datos.md) | Colecciones de Firestore, campos y relaciones |
| [docs/reglas-de-negocio.md](docs/reglas-de-negocio.md) | Fórmulas y reglas de cálculo, incluidos los supuestos acordados |
| [docs/manual-usuario.md](docs/manual-usuario.md) | Guía de uso pantalla por pantalla |
| [docs/epica-3-consulta.md](docs/epica-3-consulta.md) | Detalle de la Épica 3 (HU-10 a HU-13) |

## Calidad

- 117 pruebas unitarias. La cobertura de `src/domain` está en ~100 % de líneas (umbral configurado: 90 %).
- TypeScript estricto. El build falla si hay errores de tipos.
- **No hay pipeline de CI todavía:** las pruebas y el lint se ejecutan a mano.

**Definition of Done:** PR revisado por al menos una persona, pruebas en verde, sin errores de lint, textos en español y estados de carga, vacío y error implementados.

## Flujo de trabajo

- `main`: versión estable (pendiente de la primera integración desde `develop`).
- `develop`: integración.
- `feature/HU-XX-descripcion`: una rama por historia, con PR hacia `develop`.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`…).

## Estado y pendientes

| Pendiente | Impacto |
|---|---|
| **Reglas de seguridad de Firestore** (`firestore.rules`) no versionadas ni probadas | Alto: el aislamiento entre usuarios depende de lo publicado en la consola de Firebase |
| CI (GitHub Actions) y despliegue | El plan los exige (E1 y E11) |
| Pruebas E2E (Playwright) | El plan pide 8 flujos críticos |
| HU-22: catálogo único de errores | Los mensajes de §9 solo existen en el dashboard |
| HU-23: tokens de tema en todas las páginas | Quedan colores escritos a mano en varios componentes |
| HU-01: contraseña mínima de 8 caracteres | Hoy se acepta el mínimo de Firebase (6) |
| HU-02: volver a la ruta solicitada tras el login | Hoy siempre redirige a `/dashboard` |

## Equipo

Proyecto académico · 2026. La página `/cualquier-cosa` presenta a los integrantes.
