<div align="center">

# SIGIA · Sistema de Gestión de Ingresos y Ahorros

Aplicación web de finanzas personales para registrar gastos e ingresos, organizarlos por cuentas y grupos, ver cuánto de lo que ganas se va en gastos y convertir en ahorro lo que dejas de gastar.

**Estado:** terminado · **Versión:** 1.0 · **Última actualización:** 27/11/2026

</div>

---

## Contenido

- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Empezar](#empezar)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas](#rutas)
- [Modelo de datos](#modelo-de-datos)
- [Reglas de negocio y fórmulas](#reglas-de-negocio-y-fórmulas)
- [Calidad y pruebas](#calidad-y-pruebas)
- [Despliegue](#despliegue)
- [Organización del trabajo](#organización-del-trabajo)
- [Mejoras para futuras versiones](#mejoras-para-futuras-versiones)
- [Equipo](#equipo)

## Funcionalidades

Las 23 historias de usuario (106 puntos) están desarrolladas e integradas en `main`.

| Módulo | Qué permite |
|---|---|
| Acceso | Registro e inicio de sesión con correo y contraseña o con Google, cierre de sesión y rutas privadas protegidas. El registro crea la cuenta **Bolsillo** predeterminada. |
| Gastos e ingresos | Crear, editar y eliminar conceptos con frecuencia (eventual, diario, semanal, mensual o anual), grupos y movimientos con fecha, valor y cuenta. Al eliminar un concepto se archiva y su historial se conserva. |
| Registro rápido | Reutilizar un concepto existente (por ejemplo "Café") rellena su último valor, frecuencia y grupos. |
| Grupos | Etiquetas personalizadas con ícono y tono (verde, neutro o rojo). |
| Consulta | Cards con último valor y fecha, filtros combinables por nombre, fecha, grupo y valor. |
| Detalle de un gasto | Porcentaje sobre los ingresos del mes, proyección anual, ahorro por no repetirlo, historial ordenable y gráficas. |
| Cuentas | Crear cuentas (banco, ahorros, etc.), ver el saldo, su evolución y la variación frente a ayer, hace una semana, un mes y un año. |
| Checklist periódica | Al terminar un día, semana, mes o año se marcan los gastos realizados; los no marcados se cuentan como ahorro. |
| Ahorros y metas | Ahorro por día, semana, mes y año con desglose, y metas con fecha límite a las que se asigna o devuelve ahorro. |
| Panel | Gastos frente a ingresos en un rango de fechas: total del periodo, gráfica mes a mes y porcentaje por mes. |
| Experiencia | Interfaz en español, esqueletos de carga con la forma de cada vista, estados de vacío y error, y mensajes claros. |

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · TypeScript 7 · Vite 8 |
| Rutas | React Router 7 |
| Autenticación y datos | Firebase Authentication (correo y Google) · Cloud Firestore |
| Formularios y validación | React Hook Form · Zod |
| Gráficas | Recharts |
| Interfaz | Tailwind CSS 4 · shadcn/ui · Radix UI |
| Notificaciones | notistack |
| Íconos y tipografía | Remix Icon · Poppins |
| Pruebas | Vitest · cobertura con V8 |
| Calidad | Oxlint · TypeScript (`tsc --noEmit`) |

No hay servidor propio: el navegador se comunica directamente con Firebase mediante su SDK oficial.

## Empezar

### Requisitos

- Node.js 20.19 o superior
- Un proyecto de Firebase con Authentication (proveedores correo/contraseña y Google) y Cloud Firestore habilitados

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Mity619/SIGIA.git
cd SIGIA

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.template .env

# 4. Levantar el entorno de desarrollo
npm run dev
```

La aplicación queda disponible en http://localhost:5173.

### Variables de entorno

Se toman de la configuración de la app web en la consola de Firebase. El archivo `.env` no se versiona.

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Clave de API web |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación |
| `VITE_FIREBASE_PROJECT_ID` | Identificador del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Identificador de mensajería |
| `VITE_FIREBASE_APP_ID` | Identificador de la app |

## Scripts disponibles

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verifica tipos y genera el build de producción en `dist` |
| `npm run preview` | Sirve el build de producción en local |
| `npm run typecheck` | Verifica los tipos de TypeScript |
| `npm run lint` | Ejecuta Oxlint |
| `npm test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo observación |
| `npm run test:coverage` | Ejecuta las pruebas con reporte de cobertura |

## Estructura del proyecto

```text
src/
├── app/              # enrutador, rutas privadas y de invitado, proveedores
├── domain/           # lógica de negocio pura (sin React ni Firebase) y sus pruebas
├── features/
│   ├── accounts/     # cuentas, saldo y evolución (HU-14, HU-15)
│   ├── auth/         # registro, inicio y cierre de sesión (HU-01 a HU-03)
│   ├── dashboard/    # gastos frente a ingresos (HU-20)
│   ├── home-checklist/  # checklist periódica (HU-16, HU-17)
│   ├── items/        # gastos, ingresos, filtros y detalle (HU-04 a HU-07, HU-10 a HU-13)
│   ├── savings/      # ahorro por periodo y metas (HU-18, HU-19)
│   ├── tags/         # grupos personalizados (HU-08, HU-09)
│   └── team/         # página del equipo
├── firebase/         # configuración y hooks de acceso a Firestore
├── lib/              # utilidades generales
├── pages/            # páginas enrutables
├── shared/           # componentes, layout, hooks y utilidades de formato y fechas
└── styles/           # estilos globales y tema de Tailwind
```

### Principios de arquitectura

- **Por funcionalidades:** cada módulo de `features` agrupa sus componentes, hooks, servicios, esquemas y tipos.
- **Dominio independiente:** los cálculos (proyecciones, filtros, ahorro, metas, periodos, dinero) viven en `src/domain`, sin dependencias de React ni de Firebase, y se prueban de forma aislada.
- **Acceso a datos aislado:** Firestore solo se usa desde `src/firebase` y los hooks y servicios de cada módulo.
- **Operaciones atómicas:** guardar un movimiento con su concepto, cerrar una checklist y asignar ahorro a una meta se hacen en transacciones de Firestore.

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Pública | Página de inicio |
| `/signup` | Pública | Registro |
| `/login` | Solo sin sesión | Inicio de sesión |
| `/cualquier-cosa` | Pública | Presentación del equipo |
| `/dashboard` | Privada | Panel: gastos frente a ingresos y checklist |
| `/expenses` | Privada | Accesos a gastos, ingresos y etiquetas |
| `/gastos`, `/ingresos` | Privada | Listado con filtros |
| `/gastos/nuevo`, `/ingresos/nuevo` | Privada | Nuevo movimiento |
| `/gastos/:id`, `/ingresos/:id` | Privada | Detalle del concepto |
| `/etiquetas` | Privada | Grupos personalizados |
| `/cuentas` | Privada | Cuentas del usuario |
| `/cuentas/:accountId` | Privada | Detalle y evolución de una cuenta |
| `/ahorro` | Privada | Ahorros y metas |
| `*` | Pública | Página no encontrada |

## Modelo de datos

| Colección | Contenido |
|---|---|
| `users/{uid}` | Perfil: `username`, `email`, `photoURL`, `createdAt` |
| `accounts/{id}` | Cuentas: `user_id`, `name`, `default`, `createdAt`. La predeterminada usa el id `default-{uid}` |
| `users/{uid}/items` | Conceptos: `name`, `type`, `frequency`, `groupIds`, `lastAmount`, `lastUsedAt`, `archived` |
| `users/{uid}/entries` | Movimientos: `itemId`, `accountId`, `type`, `name`, `amount`, `date`, `groupIds` |
| `users/{uid}/groups` | Grupos: `name`, `iconKey`, `tone` |
| `users/{uid}/checklist_periods` | Checklist cerrada por periodo, con id `{frecuencia}_{AAAA-MM-DD}`: `completed`, `saved`, `totalSpent`, `totalSaved`, `accountId` |
| `users/{uid}/savings_goals` | Metas: `name`, `targetAmount`, `savedAmount`, `deadline` |
| `users/{uid}/savings_state/allocations` | Total de ahorro asignado a metas (`totalAssigned`) |

Los grupos se referencian con el arreglo `groupIds`, sin colección intermedia. El tipo del movimiento se guarda también en `entries` para sumar ingresos y gastos por periodo sin consultar los conceptos.

## Reglas de negocio y fórmulas

**Reglas principales**

- El valor de un movimiento es mayor a 0 y todo concepto tiene frecuencia.
- Bolsillo es única por usuario y no se puede eliminar. Una cuenta con movimientos tampoco se puede eliminar, y los nombres de cuenta no se repiten.
- Los nombres de grupo son únicos sin distinguir mayúsculas ni tildes.
- Una checklist solo se guarda cuando termina su periodo, una sola vez, y no duplica los gastos que ya se habían registrado a mano.
- Un mismo gasto no se cuenta dos veces como ahorro en periodos que se superponen.
- Un aporte a una meta no supera el ahorro disponible ni lo que falta, y no se permite en metas completadas o vencidas.
- El dinero se opera en centavos enteros.

**Fórmulas**

| Indicador | Fórmula |
|---|---|
| Porcentaje de un gasto | Total del gasto en el mes ÷ ingresos del mes × 100 |
| Gasto anual proyectado | Último valor × factor (diario 365, semanal 52, mensual 12, anual 1); eventual = suma real del año |
| Ahorro por checklist | Suma del último valor de los gastos no marcados en el periodo |
| Ahorro disponible | Ahorro contabilizado sin duplicados − ahorro asignado a metas |
| Progreso de una meta | Monto asignado ÷ monto objetivo × 100, máximo 100 % |
| Saldo de una cuenta | Σ ingresos − Σ gastos hasta la fecha de referencia |
| Variación de cuenta | (Saldo actual − saldo anterior) ÷ \|saldo anterior\| × 100 |
| Gastos sobre ingresos | Gastos del periodo ÷ ingresos del periodo × 100 |

## Calidad y pruebas

- **117 pruebas automatizadas en 13 archivos**, todas en verde.
- **Cobertura de `src/domain`:** 100 % de sentencias, funciones y líneas, y 99,3 % de ramas (umbral mínimo configurado: 90 %).
- **Análisis estático:** 0 errores de TypeScript y de Oxlint.
- Las pruebas cubren la lógica de dominio, el servicio de la checklist y las utilidades de formato y fechas.

**Definition of Done:** pull request revisado por al menos otro integrante, pruebas en verde, sin errores de lint ni de tipos, textos en español, estados de carga, vacío y error implementados, y aceptada por el equipo en la revisión del sprint.

## Despliegue

`npm run build` genera archivos estáticos en `dist`. Al ser una aplicación de una sola página, el alojamiento debe redirigir todas las rutas a `index.html`. Con Firebase Hosting:

1. Completar `.env` y ejecutar `npm run build`.
2. Instalar la CLI e iniciar sesión: `npm install -g firebase-tools` y `firebase login`.
3. Crear `firebase.json` en la raíz:

    ```json
    {
      "hosting": {
        "public": "dist",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "rewrites": [{ "source": "**", "destination": "/index.html" }]
      },
      "firestore": { "rules": "firestore.rules" }
    }
    ```

4. Publicar: `firebase deploy --only hosting,firestore:rules`.
5. Agregar el dominio publicado en Authentication → Configuración → Dominios autorizados para habilitar el acceso con Google.

Las reglas de seguridad de Firestore deben limitar cada usuario a su propio documento en `users/{uid}` y sus subcolecciones, y a las cuentas cuyo `user_id` sea su `uid`. `firebase.json` y `firestore.rules` aún no están versionados en el repositorio.

## Organización del trabajo

El proyecto se desarrolló con Scrum en 5 sprints, entre el 29 de octubre y el 25 de noviembre de 2026. El backlog y los sprints se gestionaron en ClickUp. Cada sprint entregó un incremento utilizable:

| Sprint | Versión | Incremento | Historias | Puntos |
|---|---|---|---|---|
| 1 | v0.1 | Entrar y registrar el primer gasto | HU-01, 02, 03, 04, 22 | 20 |
| 2 | v0.2 | Gestionar y clasificar gastos e ingresos | HU-05 a 10 | 23 |
| 3 | v0.3 | Consultar, analizar y seguir las cuentas | HU-11 a 15 | 26 |
| 4 | v0.4 | Ahorrar y asignar a metas | HU-16 a 19 | 23 |
| 5 | v1.0 | Panel completo y experiencia unificada | HU-20, 21, 23 | 14 |

### Flujo con Git

- **Ramas:** `main` (versión estable), `develop` (integración), `feature/HU-XX-descripcion` (una historia) y `fix/*` (correcciones).
- **Integración:** pull request hacia `develop`, revisado por al menos otro integrante, y paso a `main` al cerrar la versión. La versión 1.0 se integró a `main` el 25 de noviembre de 2026 (PR 7).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`).

Para contribuir:

```bash
git checkout develop
git checkout -b feature/HU-XX-descripcion
# ...cambios y commits...
npm run typecheck && npm run lint && npm test
git push -u origin feature/HU-XX-descripcion
# abrir un pull request hacia develop
```

## Mejoras para futuras versiones

- Transferencias entre cuentas.
- Renombrar cuentas y editar o eliminar metas.
- Volver a la ruta solicitada después de iniciar sesión.
- Integración continua (lint, tipos, pruebas y build en cada PR) y versionar `firebase.json` y `firestore.rules`.
- Pruebas de componentes, de extremo a extremo y de reglas con el emulador de Firebase.
- Paginación en listados con muchos movimientos y división del paquete principal por rutas.
- Política de tratamiento de datos personales (Ley 1581 de 2012).

## Equipo

Equipo **Cualquier Cosa**. Los cuatro integrantes trabajaron como desarrolladores, cada uno con historias completas.

| Integrante | Historias | Puntos |
|---|---|---|
| Sebastián Leiton | Acceso, cuentas y panel (HU-01 a 03, 14, 15, 20, 21) | 29 |
| Lucas García | Gastos, ingresos y grupos (HU-04 a 09) | 25 |
| Laura Campo | Checklist, ahorros y metas (HU-16 a 19) | 23 |
| Alex Silva | Cards, filtros, detalle y gráficas (HU-10 a 13) | 21 |
| Todo el equipo | Manejo de errores y sistema de diseño (HU-22, 23) | 8 |

Universidad Autónoma de Occidente · Ingeniería Informática · Proyecto Informático · Cali, 2026.

---

© 2026 Alex Silva, Laura Campo, Sebastián Leiton y Lucas García. Todos los derechos reservados.
