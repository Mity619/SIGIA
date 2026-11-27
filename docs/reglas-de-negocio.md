# Reglas de negocio

Todas las fórmulas viven en funciones puras con pruebas unitarias. La columna **Código** indica dónde están. Si cambia una regla, se cambia esa función y su prueba, no los componentes.

Las reglas marcadas con **(S)** son **supuestos**: el documento organizacional (§5.1) no las define y el equipo las decidió durante el desarrollo. Hay que validarlas con el responsable de producto.

## 1. Convenciones generales

| Regla | Código |
|---|---|
| El dinero se suma y compara en **centavos enteros**; los porcentajes se redondean a 2 decimales | `domain/money.ts` |
| Las fechas usan la **hora local** del usuario. Los rangos son `[inicio, fin)`: el fin no se incluye | `domain/period.ts`, `shared/utils/date.ts` |
| Un porcentaje cuya base es 0 devuelve `null` y la interfaz muestra un mensaje, nunca "0 %" ni una división entre cero | `domain/money.ts` (`percentage`) |
| Los conceptos **archivados** no cuentan en ningún total (HU-06) | `items`, `dashboard`, `accounts` |
| Si un movimiento no tiene `type`, se toma del concepto | `domain/finance.ts` (`resolveEntryType`) |

## 2. Acceso (HU-01, HU-02)

| Regla | Detalle | Código |
|---|---|---|
| Contraseña | 8 o más caracteres. Se valida antes de llamar a Firebase, que solo exige 6 | `features/auth/constants/auth.constants.ts` |
| Ruta de retorno | Al pedir una página privada sin sesión, se recuerda la ruta (con filtros y ancla) y se vuelve a ella después del login. Solo se aceptan rutas internas; nunca se vuelve a `/login`, `/signup` ni `/` | `app/router/redirect.ts` |

## 3. Periodos

| Periodo | Rango |
|---|---|
| Diario | De 00:00 a 00:00 del día siguiente |
| Semanal | **De lunes a lunes** |
| Mensual | Del día 1 al día 1 del mes siguiente |
| Anual | Del 1 de enero al 1 de enero siguiente |

Código: `domain/period.ts` (`checklistPeriodRange`).

## 4. Gastos e ingresos (HU-04 a HU-13)

| Regla | Detalle | Código |
|---|---|---|
| Registro | Monto > 0, frecuencia obligatoria, fecha por defecto = hoy. El concepto y su movimiento se guardan en la misma escritura | `items/hooks/useCreateEntry.ts` |
| Reutilizar (HU-05) | Al elegir un concepto se rellena con su último valor. `lastAmount` solo se actualiza si el movimiento nuevo es el más reciente | `useCreateEntry.ts` |
| Borrar un movimiento | Se recalcula `lastAmount` / `lastUsedAt` con el movimiento más reciente que quede | `items/hooks/useDeleteEntry.ts` |
| % sobre ingresos (HU-12) | Total del concepto en el **mes calendario** ÷ ingresos del mismo mes × 100 **(S)** | `domain/finance.ts` (`itemMonthStats`) |
| Gasto anual proyectado | Último monto × factor (diario 365, semanal 52, mensual 12, anual 1). **Eventual:** suma real del año en curso | `annualProjection` |
| Ahorro por no repetirlo (HU-12) | = gasto anual proyectado. No aplica a ingresos **(S)** | `savingsIfStopped` |
| Gráficas (HU-13) | El concepto frente a los gastos del mes y frente a los ingresos del mes | `buildComparison` |
| Filtros (HU-11) | El nombre ignora mayúsculas y tildes. Fecha y valor se evalúan sobre los **movimientos**: el concepto aparece si **un mismo movimiento** cumple ambos rangos **(S)**. La etiqueta acepta una frecuencia o un grupo **(S)** | `domain/filters.ts` |

Más detalle en [epica-3-consulta.md](epica-3-consulta.md).

## 5. Cuentas (HU-14, HU-15)

| Regla | Detalle | Código |
|---|---|---|
| Bolsillo | Se crea al registrarse, con id `default-{uid}`. **No se puede borrar** | `accounts/hooks/useAccountState.ts`, `utils/accountRules.ts` |
| Nombre | Obligatorio, máximo 40 caracteres, único por usuario (sin distinguir mayúsculas ni tildes) | `accountRules.ts` |
| Saldo | Ingresos − gastos de los movimientos de la cuenta. No se guarda: se calcula | `utils/accountBalance.ts` |
| Saldo en una fecha | Incluye los movimientos hasta el final de ese día | `calculateBalanceAt` |
| Comparaciones | Contra ayer, hace 7 días, hace 1 mes y hace 1 año. Al restar meses se ajusta al último día del mes (31 de marzo − 1 mes = 28 o 29 de febrero) | `subtractPeriod` |
| Variación (§5.1) | (saldo actual − saldo anterior) ÷ \|saldo anterior\| × 100. `null` si el saldo anterior es 0. Se divide entre el valor absoluto para que el signo indique si subió o bajó **(S)** | `calculateVariation` |
| Gráfica de evolución | Necesita al menos **2 movimientos**. Si hay menos, se muestra un mensaje guía | `MIN_MOVEMENTS_FOR_EVOLUTION` |

## 6. Checklist (HU-16, HU-17)

| Regla | Detalle |
|---|---|
| Qué aparece | Solo los **gastos** de la frecuencia elegida (diarios, semanales, mensuales o anuales). Los eventuales y los ingresos nunca aparecen |
| Cuándo se puede cerrar | **Solo cuando el periodo terminó** **(S)**. La checklist de hoy se cierra mañana. Esto evita que lo no marcado cuente como ahorro antes de tiempo |
| Una sola vez | Cada periodo se guarda una vez (id `frecuencia_fechaInicio`). Después solo se consulta y no se puede editar |
| Gasto **marcado** | Se crea un movimiento real en la cuenta elegida, con el último monto del concepto y fecha dentro del periodo |
| Gasto **ya registrado a mano** en el periodo | Sale **premarcado** y bloqueado. Cuenta como realizado con la suma de lo registrado y **no** se duplica **(S)** |
| Gasto **no marcado** y sin movimientos | Cuenta como **ahorrado**, por su último monto. No crea movimiento |
| Atomicidad | Los movimientos y el resumen del periodo se escriben en una sola transacción |

Código: `features/home-checklist/services/checklist.service.ts`, `domain/checklist.ts`.

## 7. Ahorro (HU-18)

| Regla | Detalle | Código |
|---|---|---|
| Total de un periodo | Suma de `saved` de las checklist que caen en ese periodo | `domain/savings.ts` |
| Periodos que cruzan un límite | Una semana que cruza de mes o de año cuenta en el **mes y año donde empieza** **(S)**. Los totales diario y semanal solo incluyen periodos completos | `filterSavingsByRange`, `calculateSavingsByPeriod` |
| Desglose | Por concepto: monto acumulado y número de veces evitado | `calculateSavings` |
| Ahorro disponible | Total ahorrado − total asignado a metas (nunca negativo). Si un mismo concepto aparece en periodos que se solapan, se cuenta una sola vez | `domain/availableSavings.ts` |

## 8. Metas (HU-19)

| Regla | Detalle | Código |
|---|---|---|
| Crear | Nombre de 1 a 100 caracteres, monto > 0 con máximo 2 decimales, fecha límite desde hoy | `savings/schemas/savingsGoal.schema.ts` |
| Progreso | `savedAmount ÷ targetAmount × 100`, con tope de 100 % | `domain/savingsGoals.ts` |
| Estado | **Completada** si se alcanzó el monto. **Vencida** si pasó el día límite sin alcanzarlo. Si no, **pendiente** | `calculateGoalProgress` |
| Asignar ahorro | Monto > 0, no mayor al disponible ni a lo que falta para la meta. **No se puede asignar a metas vencidas ni completadas.** Al llegar al 100 % se muestra una felicitación | `domain/goalAllocation.ts`, `services/goalAllocation.service.ts` |
| Devolver ahorro | Se puede devolver hasta lo asignado a esa meta | `reverseSavingsAllocation` |
| Concurrencia | Cada asignación o devolución actualiza la meta y `savings_state/allocations` en una transacción | `goalAllocation.service.ts` |

> El ahorro asignado a metas es un **valor de control**: no mueve dinero entre cuentas ni cambia saldos.

## 9. Dashboard (HU-20)

| Regla | Detalle | Código |
|---|---|---|
| Rango por defecto | El mes actual y los 5 anteriores | `dashboard/utils/dateRange.ts` |
| Límites | Máximo 24 meses. La fecha final se incluye completa | `validateDateRangeInput` |
| Totales | Gastos e ingresos por mes y en total. Se muestran todos los meses del rango, aunque estén en 0 | `utils/incomeExpenseSummary.ts` |
| % de gastos sobre ingresos | Gastos ÷ ingresos × 100. `null` si no hay ingresos | ídem |
| Errores de carga | Sin conexión, sesión vencida o error del servidor, con los textos de §9 del documento organizacional | `constants/incomeExpense.constants.ts` |
