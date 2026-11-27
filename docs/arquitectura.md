# Guía de arquitectura

## Visión general

SIGIA es una SPA en React que habla directamente con Firebase desde el navegador. No hay servidor propio: la autenticación la resuelve Firebase Authentication, los datos viven en Cloud Firestore y la seguridad depende de las **Security Rules** de Firestore (ver [Pendientes](#pendientes-de-arquitectura)).

```text
Navegador
 ├── React (pages + features)
 │     ├── hooks de cada feature  ──► services / firebase hooks ──► Firestore
 │     └── src/domain (funciones puras) ◄── datos ya convertidos (Date, números)
 └── Firebase Auth (sesión)
```

## Capas

| Capa | Carpeta | Responsabilidad | Puede depender de |
|---|---|---|---|
| Dominio | `src/domain/` | Fórmulas financieras, periodos, filtros, metas. Sin React ni Firebase | Nada externo |
| Acceso a datos | `src/firebase/`, `features/*/services/` | Leer y escribir en Firestore, transacciones, convertir `Timestamp` → `Date` | Dominio, Firebase SDK |
| Features | `src/features/<módulo>/` | Componentes, hooks, esquemas (Zod) y tipos de cada módulo | Dominio, acceso a datos, `shared` |
| Páginas | `src/pages/`, `features/*/pages/` | Componer features en pantallas enrutables | Features |
| App | `src/app/` | Router, guardas de ruta y providers globales | Páginas |
| Compartido | `src/shared/` | Componentes UI (shadcn), skeletons, utilidades de fecha y formato | — |

Regla principal: **los cálculos de dinero se hacen en `src/domain`**, donde tienen pruebas unitarias. Los componentes solo muestran los resultados.

## Módulos (`src/features`)

| Módulo | Contenido principal |
|---|---|
| `auth` | `AuthContext` (sesión y perfil), formulario de login y registro, traducción de errores de Firebase |
| `accounts` | `AccountContext`, creación y borrado de cuentas, cálculo de saldo (`utils/accountBalance.ts`), gráfica de evolución y comparaciones |
| `items` | Listado con filtros en la URL, card, formulario de movimiento, detalle con indicadores y gráficas, mappers Firestore → dominio |
| `tags` | Grupos, selector de tono e ícono |
| `home-checklist` | Servicio de la checklist (`services/checklist.service.ts`) y su componente |
| `savings` | Página de ahorro, metas, asignación y devolución de ahorro |
| `dashboard` | Resumen de gastos frente a ingresos con rango de fechas |
| `team` | Página de presentación del equipo |

## Flujo de datos

1. **Sesión.** `AuthContext` escucha `onAuthStateChanged`. Al primer inicio de sesión crea el perfil `users/{uid}` y la cuenta **Bolsillo** en una transacción (`ensureDefaultAccount`).
2. **Lectura en tiempo real.** Los hooks (`useItems`, `useUserEntries`, `useAllItems`, `useGroups`) se suscriben con `onSnapshot` mediante `firebase/hooks/useCollection`.
3. **Conversión.** `features/items/mappers.ts` convierte los documentos a tipos de dominio (`Date` en vez de `Timestamp`).
4. **Cálculo.** Las funciones de `src/domain` filtran, agregan y calculan en memoria.
5. **Escritura.** Las operaciones que tocan varios documentos usan `writeBatch` o `runTransaction`. Ejemplos: crear concepto y movimiento juntos, borrar un movimiento y recalcular el último valor, guardar una checklist, asignar ahorro a una meta.

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| **Firebase** en vez de Supabase | Acordado en el documento organizacional (§3.1). Las agregaciones se hacen en el cliente con funciones puras |
| Datos del usuario bajo `users/{uid}/...` | Facilita escribir reglas de seguridad por usuario. Excepción: `accounts` es global y lleva `user_id` |
| **Concepto (`items`) separado del movimiento (`entries`)** | Permite reutilizar el último valor (HU-05) y mantener el historial del mismo gasto |
| Campos desnormalizados (`lastAmount`, `lastUsedAt`, `type` en el movimiento) | Evitan consultas extra al listar y al sumar por tipo |
| Dinero en **centavos enteros** al calcular (`domain/money.ts`) | Evita errores de coma flotante; HU-13 exige margen de error 0 |
| Fechas en **hora local** (`shared/utils/date.ts`) | `valueAsDate` interpreta UTC y en Colombia (UTC−5) corría la fecha un día |
| Filtros en memoria y en la URL | Con el volumen esperado son rápidos, evitan índices compuestos y sobreviven a recargar |
| Borrado lógico de conceptos (`archived`) | HU-06: no se pierde el historial y no quedan movimientos huérfanos |
| Recharts cargado de forma diferida | No penaliza la carga inicial |
| Tokens de color en `styles/index.css` | Tema claro/oscuro único (HU-23) |

## Pruebas

- `src/domain/**/*.test.ts`: fórmulas, periodos, filtros, ahorro, metas.
- `src/features/home-checklist/services/checklist.service.test.ts`: reglas de la checklist.
- `src/shared/utils/*.test.ts`: fechas y formatos.

Se ejecutan con `npm test`. La cobertura de `src/domain` tiene un umbral de 90 % (`vitest.config.ts`).

## Pendientes de arquitectura

1. **Security Rules versionadas** (`firestore.rules` + `firebase.json`) con pruebas en el emulador. Hoy algunas validaciones, como no borrar el Bolsillo o que la cuenta sea del usuario, solo se hacen en el cliente.
2. **CI** que ejecute lint, tipos, pruebas y build en cada PR.
3. **Manejador de errores único** (HU-22): hoy cada módulo traduce sus errores por separado.
4. **Bundle principal** de ~416 KB gzip: conviene dividirlo por ruta (`lazy`) para cumplir la meta de LCP < 2,5 s.
