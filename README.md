SIGIA · Sistema de Gestión de Ingresos y Ahorros

https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white
https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white
https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white
https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white
https://img.shields.io/badge/Recharts-2-22B5BF?logo=chartdotjs&logoColor=white
https://img.shields.io/badge/license-MIT-blue

Aplicación web de finanzas personales para registrar gastos e ingresos, clasificarlos por frecuencia y grupos, gestionar cuentas y visualizar el impacto financiero con gráficas interactivas.

    Estado: 🚧 En desarrollo · Versión: 2.0 · Última actualización: 29/10/2026

✨ Características

    🔐 Autenticación con correo y contraseña, rutas privadas protegidas.

    💸 CRUD de gastos e ingresos con fecha, monto, frecuencia y etiquetas.

    ⚡ Registro rápido: reutiliza el último valor de un gasto existente (ej. "Café").

    🏷️ Clasificación por frecuencia (eventual, diario, semanal, mensual, anual) y grupos personalizados con íconos.

    📊 Dashboard con Recharts: gastos vs. ingresos, distribución por etiqueta y evolución del balance.

    🏦 Cuentas (Bolsillo por defecto, banco, ahorros) con historial y variación de saldo.

    ✅ Checklist periódica en el home: lo no marcado se contabiliza como ahorrado.

    🎯 Metas de ahorro con barra de progreso.

    🔍 Filtros por nombre, fecha, etiqueta y valor.

    🌐 Interfaz 100 % en español con skeletons de carga y errores claros.

🛠 Stack
Capa	Tecnología
Frontend	React 18 · Vite · TypeScript
Rutas	React Router v6
Datos	TanStack Query · Supabase (PostgreSQL + Auth + RLS)
Formularios	React Hook Form · Zod
UI	MUI + tema propio (en revisión)
Gráficas	Recharts
Notificaciones	notistack
Fechas	date-fns (locale es)
Pruebas	Vitest · Testing Library · Playwright
Calidad	ESLint · Prettier
CI/CD	GitHub Actions · Vercel
🚀 Empezar
Requisitos

    Node.js ≥ 18

    Cuenta de Supabase

Instalación
bash

# 1. Clonar el repositorio
git clone <repo-url>
cd sigia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 4. Levantar el entorno de desarrollo
npm run dev

La app estará disponible en http://localhost:5173.
Scripts disponibles
bash

npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Previsualizar el build
npm run lint         # ESLint
npm run test         # Pruebas unitarias y de componentes
npm run test:e2e     # Pruebas E2E con Playwright

📁 Estructura del proyecto
text

src/
├── app/          # providers, router, guards, tema
├── domain/       # lógica financiera pura (porcentajes, proyecciones, ahorro)
├── services/     # acceso a Supabase (auth, items, entries, accounts…)
├── shared/       # UI compartida, hooks, utilidades, manejador de errores
├── features/
│   ├── auth/
│   ├── home-checklist/
│   ├── items/        # gastos e ingresos
│   ├── accounts/
│   ├── savings/
│   ├── dashboard/
│   └── tags/         # etiquetas, grupos e íconos
└── assets/icons/     # íconos verdes, neutros y rojos

Principios de arquitectura

    Feature-based: cada módulo agrupa componentes, hooks y servicios.

    Capa de servicios aislada: ningún componente llama a Supabase directamente.

    Lógica financiera pura en domain/, testeable sin React.

    Un solo manejador de errores que traduce fallas técnicas a español.

    Un solo sistema de diseño: sin colores ni espaciados ad-hoc.

🗺 Rutas
Ruta	Acceso	Descripción
/login, /registro	Pública	Autenticación
/	Privada	Home con checklist y resumen
/gastos	Privada	Listado con filtros
/gastos/:id	Privada	Detalle e historial
/ingresos	Privada	Listado de ingresos
/cuentas	Privada	Estado de cuentas
/ahorro	Privada	Ahorro y metas
*	Pública	Página 404
🗄 Modelo de datos (resumen)
Tabla	Descripción
users	Perfil del usuario (nombre, moneda)
accounts	Cuentas financieras (Bolsillo por defecto)
items	Conceptos de gasto/ingreso con frecuencia e ícono
groups	Grupos personalizados
item_groups	Relación N:N entre items y grupos
entries	Movimientos (monto, fecha, cuenta, item)
savings_goals	Metas de ahorro

Reglas clave:

    RLS activo en todas las tablas (user_id = auth.uid()).

    Restricciones CHECK: monto > 0, frecuencia válida.

    Índices en entries(user_id, fecha) e entries(item_id, fecha).

    Vistas SQL para agregaciones del dashboard y la página de ahorro.

🧮 Fórmulas de negocio

    % de un gasto = gasto del periodo ÷ ingresos del periodo × 100

    Gasto anual proyectado = monto × factor (diario 365 · semanal 52 · mensual 12 · anual 1 · eventual = suma real del año)

    Ahorro por checklist = suma de montos de gastos marcados como "ahorrado"

    Variación de cuenta = (saldo actual − saldo anterior) ÷ saldo anterior × 100

🧪 Calidad
Nivel	Herramienta	Meta
Unitarias	Vitest	90 % cobertura en domain/
Componentes	Testing Library	Casos éxito y error
E2E	Playwright	8 flujos críticos
RLS	Pruebas de aislamiento	0 fugas entre usuarios

Definition of Done: PR revisado, tests en verde, sin errores de lint, textos en español, estados carga/vacío/error implementados y desplegado en previsualización.
📅 Roadmap

    ☑

    Sprint 0 · Preparación (repo, CI, modelo de datos)
    □

    Sprint 1 · Autenticación, rutas privadas, layout, RLS
    □

    Sprint 2 · CRUD de items y movimientos, formulario inteligente
    □

    Sprint 3 · Listado con filtros, detalle y gráficas del gasto
    □

    Sprint 4 · Cuentas y evolución de saldo
    □

    Sprint 5 · Home, checklist y página de ahorro
    □

    Sprint 6 · Dashboard, pulido, E2E y despliegue final

🤝 Contribuir

    Crea una rama desde develop: git checkout -b feature/HU-XX-descripcion

    Haz commits siguiendo Conventional Commits.

    Abre un Pull Request hacia develop con descripción y capturas.

    Espera revisión (SLA: < 24 h).

Ramas:

    main → producción

    develop → integración

    feature/* → una historia de usuario

    fix/* → correcciones puntuales

📄 Licencia

MIT © 2026 · Equipo SIGIA
<div align="center"> <sub>Hecho con ☕ y React · <a href="#sigia--sistema-de-gestión-de-ingresos-y-ahorros">Volver arriba</a></sub> </div>
