# Diccionario de datos (Cloud Firestore)

Fuente: tipos en `src/features/*/types/` y escrituras reales en hooks y servicios.

## Mapa de colecciones

```text
users/{uid}                              perfil
 ├── items/{itemId}                      conceptos de gasto/ingreso ("Café", "Salario")
 ├── entries/{entryId}                   movimientos (cada registro de un concepto)
 ├── groups/{groupId}                    grupos personalizados
 ├── checklist_periods/{periodId}        checklist cerrada de un periodo
 ├── savings_goals/{goalId}              metas de ahorro
 └── savings_state/allocations           total de ahorro asignado a metas
accounts/{accountId}                     cuentas (colección global, con user_id)
```

```text
items 1 ──< entries >── 1 accounts
items >──< groups               (por arreglo groupIds, sin tabla intermedia)
checklist_periods ── guarda copia de itemId, nombre y monto (snapshot histórico)
savings_goals ──> savings_state/allocations (suma de savedAmount de todas las metas)
```

Convenciones:
- Las fechas se guardan como `Timestamp` y se convierten a `Date` en hora local al leer.
- Los montos se guardan como `number` en pesos. Los cálculos se hacen en centavos enteros.
- `createdAt` y `updatedAt` se llenan con `serverTimestamp()`.

---

## `users/{uid}`
Perfil. El id del documento es el `uid` de Firebase Auth. Se crea en el primer inicio de sesión, en la misma transacción que la cuenta Bolsillo.

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `username` | string | Sí | Nombre de usuario. Si no se da, se toma de Google o del correo |
| `email` | string | Sí | Correo de la cuenta |
| `photoURL` | string | No | Foto de perfil (Google). Cadena vacía si no hay |
| `createdAt` | Timestamp | Sí | Fecha de creación |

## `accounts/{accountId}` (global)
Cuentas del usuario: Bolsillo, banco, ahorros…

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `user_id` | string | Sí | `uid` del dueño. Todas las consultas filtran por este campo |
| `name` | string | Sí | Máximo 40 caracteres. Único por usuario, sin distinguir mayúsculas ni tildes |
| `default` | boolean | Sí | `true` solo para Bolsillo. Una cuenta con `default` distinto de `false` no se puede borrar |
| `createdAt` | Timestamp | Sí | Fecha de creación |

- La cuenta por defecto tiene id fijo `default-{uid}` y nombre `Bolsillo`.
- **El saldo no se guarda**: se calcula sumando los `entries` con ese `accountId` (ingresos − gastos).

## `users/{uid}/items/{itemId}`
Concepto reutilizable ("Café", "Alquiler", "Salario").

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `name` | string | Sí | Nombre del concepto (máx. 80) |
| `type` | `"expense"` \| `"income"` | Sí | Gasto o ingreso |
| `frequency` | `"eventual"` \| `"daily"` \| `"weekly"` \| `"monthly"` \| `"annual"` | Sí | Etiqueta de tiempo (HU-04) |
| `groupIds` | string[] | Sí | Ids de `groups` (puede estar vacío) |
| `lastAmount` | number | Sí | Monto del movimiento más reciente. Se reutiliza en HU-05 |
| `lastUsedAt` | Timestamp \| null | No | Fecha del movimiento más reciente |
| `archived` | boolean | Sí | Borrado lógico (HU-06). Los archivados no se listan ni cuentan en totales |
| `createdAt`, `updatedAt` | Timestamp | — | Auditoría |

## `users/{uid}/entries/{entryId}`
Movimiento: cada vez que se registra un gasto o ingreso.

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `itemId` | string | Sí | Concepto al que pertenece |
| `type` | `"expense"` \| `"income"` | No* | Copia del tipo del concepto |
| `accountId` | string | Sí | Cuenta afectada (`accounts/{id}`) |
| `name` | string | Sí | Nombre al momento del registro (puede diferir del concepto) |
| `amount` | number | Sí | Mayor a 0 |
| `date` | Timestamp | Sí | Fecha del movimiento (hora local). Por defecto, hoy |
| `groupIds` | string[] | No | Grupos al momento del registro |
| `createdAt`, `updatedAt` | Timestamp | — | Auditoría |

\* Los movimientos creados antes del 9/11/2026 pueden no tener `type`. En ese caso se toma el del concepto (`resolveEntryType`).

## `users/{uid}/groups/{groupId}`

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `name` | string | Sí | 2 a 40 caracteres |
| `tone` | `"green"` \| `"neutral"` \| `"red"` | Sí | Tono del ícono |
| `iconKey` | string | Sí | Clase de Remix Icon de la biblioteca (`tags/constants/icons.ts`, 10 por tono) |
| `createdAt` | Timestamp | — | |

Al borrar un grupo, su id se quita de los `groupIds` de conceptos y movimientos.

## `users/{uid}/checklist_periods/{periodId}`
Checklist cerrada de un periodo. **Se escribe una sola vez y no se edita.**

- **Id:** `{frequency}_{YYYY-MM-DD del inicio}`. Ejemplo: `weekly_2026-11-23`. Este id fijo impide guardar dos veces el mismo periodo.

| Campo | Tipo | Descripción |
|---|---|---|
| `frequency` | `"daily"` \| `"weekly"` \| `"monthly"` \| `"annual"` | Tipo de checklist |
| `periodStart` | Timestamp | Inicio del periodo (inclusivo) |
| `periodEnd` | Timestamp | Fin del periodo (exclusivo) |
| `completed` | `{itemId, name, amount}[]` | Gastos realizados (marcados o ya registrados a mano) |
| `saved` | `{itemId, name, amount}[]` | Gastos **no** realizados = ahorro |
| `totalSpent` | number | Suma de `completed` |
| `totalSaved` | number | Suma de `saved` |
| `accountId` | string | Cuenta donde se registraron los gastos marcados |
| `createdAt` | Timestamp | |

## `users/{uid}/savings_goals/{goalId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | 1 a 100 caracteres |
| `targetAmount` | number | Meta, mayor a 0, máximo 2 decimales |
| `savedAmount` | number | Ahorro asignado a la meta |
| `deadline` | Timestamp | Fecha límite (incluye todo ese día) |
| `createdAt` | Timestamp | |

El estado (`pending` / `completed` / `failed`) **no se guarda**: se calcula con `calculateGoalProgress`.

## `users/{uid}/savings_state/allocations`
Documento único de control.

| Campo | Tipo | Descripción |
|---|---|---|
| `totalAssigned` | number | Suma de lo asignado a todas las metas. Se actualiza en la misma transacción que la meta, para evitar asignar dos veces el mismo ahorro |

## Índices

Las consultas actuales no necesitan índices compuestos. Son de tres tipos:
- un rango sobre un solo campo (`entries.date`, `checklist_periods.periodStart`);
- igualdades (`entries.accountId`, `items.type` + `items.archived`);
- `array-contains` sobre `groupIds`. Si se agregan consultas que combinen rango y otro filtro, habrá que crear el índice en Firebase.
