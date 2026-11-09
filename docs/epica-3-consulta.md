# Épica 3 · Consulta y análisis de gastos (HU-10 a HU-13)

Rama: `feature/HU-10-13-consulta-gastos` · Base: `develop` (después de Mity619/SIGIA#2)

## Qué se entrega

| HU | Pts | Resultado | Dónde |
|---|---|---|---|
| HU-10 | 3 | La card muestra valor, ícono de etiqueta (frecuencia) y fecha del último movimiento. El skeleton tiene la misma estructura que la card | `features/items/components/ItemCard.tsx` |
| HU-11 | 5 | 4 filtros combinables (nombre, fecha, etiqueta, valor), botón "Limpiar filtros", mensaje cuando no hay resultados | `components/ItemFilters.tsx`, `hooks/useItemFilters.ts`, `domain/filters.ts` |
| HU-12 | 8 | Detalle con % sobre ingresos, gasto anual proyectado y ahorro por no repetirlo. Historial ordenable por fecha y valor | `pages/ItemDetailPage.tsx`, `components/ItemStats.tsx`, `components/EntryHistory.tsx`, `domain/finance.ts` |
| HU-13 | 5 | Dos gráficas Recharts: el gasto frente a los gastos del mes y frente a los ingresos del mes | `components/ItemComparisonChart.tsx` |

## Supuestos (decisiones que el documento organizacional no define)

> Hay que validarlos con el responsable de producto. Si cambian, solo se tocan las funciones de `src/domain/` y sus pruebas.

1. **Periodo de referencia = mes calendario.** §5.1 habla de "ingresos del mismo periodo" sin definirlo. Si se usara la frecuencia (por ejemplo, un café diario frente a los ingresos de un día), el resultado casi siempre sería 0 % o una división entre cero. El % de HU-12 y las gráficas de HU-13 usan el mes en curso. La frecuencia solo se usa para la proyección anual.
2. **Ahorro por no repetirlo = gasto anual proyectado.** HU-12 lo pide, pero §5.1 no lo define. Se interpreta como lo que se dejaría de gastar en un año si el gasto se elimina. Para ingresos no aplica y no se muestra.
3. **Proyección anual de un gasto eventual = suma real de sus movimientos en el año en curso**, tal como dice §5.1. No se usa `factor × monto` porque el factor de eventual es 0.
4. **Sin ingresos en el mes, el % no se calcula** (`null`). En su lugar se muestra el mensaje "Aún no registras ingresos este mes", para no dividir entre cero.
5. **Filtros de fecha y valor (HU-11):** son datos del movimiento, no del concepto. Un concepto aparece si tiene **al menos un movimiento que cumpla a la vez** el rango de fecha y el de valor. Las fechas son inclusivas por día completo.
6. **"Etiqueta" en HU-11** acepta una frecuencia (etiqueta de tiempo, HU-04) o un grupo personalizado (HU-08).
7. **Criterio incompleto de HU-11** ("con 1.000 registros;"): se fijó como meta filtrar 1.000 conceptos con 10.000 movimientos en menos de 200 ms. Lo verifica una prueba unitaria.
8. **"Margen de error 0" (HU-13):** el dinero se suma en centavos enteros (`domain/money.ts`). Así se evita el error de coma flotante de JS (`0.1 + 0.2 !== 0.3`). Los porcentajes se redondean a 2 decimales.

## Fixes previos sobre el Sprint 2 (en esta misma rama)

| Commit | Problema | Corrección |
|---|---|---|
| `fix: store entry dates in local time` | `valueAsDate` interpretaba la fecha como UTC, así que en Colombia se guardaba el día anterior | Input de fecha controlado, con conversión en hora local (`shared/utils/date.ts`) |
| `fix: create item and entry atomically and store entry type` | Eran 3 escrituras independientes, con riesgo de dejar conceptos huérfanos. Además, el movimiento no guardaba si era gasto o ingreso | Una sola `writeBatch`. Ahora cada movimiento guarda `type` |
| `fix: recompute item last amount when an entry is deleted` | Al borrar el último movimiento, la card seguía mostrando su valor | Borrado y recálculo en el mismo batch |

Los movimientos creados antes del fix no tienen `type`. `resolveEntryType` lo toma del concepto, así que no hace falta migrarlos.

## Arquitectura

- `src/domain/`: lógica pura, sin React ni Firebase. Tiene 100 % de cobertura de pruebas; la meta del plan es 90 %.
- `features/items/mappers.ts`: convierte documentos de Firestore (`Timestamp`) a tipos de dominio (`Date`).
- `useUserEntries`: una sola suscripción en tiempo real a los movimientos del usuario. Alimenta los filtros, el historial, los indicadores y las gráficas. Los filtros se aplican en memoria, lo que evita índices compuestos en Firestore.
- Los filtros se guardan en la URL (`?q=&desde=&hasta=&etiqueta=&min=&max=`). Así se mantienen al recargar.
- Recharts se carga de forma diferida (`lazy`) solo en el detalle, en un chunk de ~97 KB gzip.
- Los componentes nuevos usan los tokens del tema (`primary`, `muted`, `chart-1`), no colores escritos a mano.

## Cómo probar

```bash
npm test               # pruebas unitarias
npm run test:coverage  # cobertura de src/domain (umbral 90 %)
npm run typecheck
npm run build
```

## Pendiente o fuera de alcance

- La edición de movimientos (botón de lápiz) sigue siendo un `console.log`. Corresponde a HU-06 (Sprint 2).
- No hay pruebas de componentes (Testing Library) ni E2E (Playwright). El plan las ubica en el Sprint 6.
- El ícono "Ahorro" de la biblioteca de grupos (`ri-piggy-bank-line`) no existe en Remix Icon y se ve vacío. Pertenece a HU-08 y hay que reemplazarlo.
