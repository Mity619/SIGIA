<<<<<<< HEAD
# SIGIA
SIGIA es una applicación web orientada a la gestion de finanzas
=======
SIGIA · Sistema de Gestión de Ingresos y Ahorros

Proyecto de aplicación web de finanzas personales. La implementación actual incluye autenticación con Firebase y una estructura inicial para el dashboard; las funcionalidades financieras siguen en desarrollo.

    Estado: 🚧 En desarrollo · Versión: 2.0 · Última actualización: 30/10/2026

🎯 Funcionalidades previstas

    🔐 Autenticación con correo y contraseña, rutas privadas protegidas.

    💸 CRUD de gastos e ingresos con fecha, monto, frecuencia y etiquetas.

    ⚡ Registro rápido: reutiliza el último valor de un gasto existente (ej. "Café").

    🏷️ Clasificación por frecuencia (eventual, diario, semanal, mensual, anual) y grupos personalizados con íconos.

    📊 Dashboard y visualización de finanzas (en desarrollo; aún sin librería de gráficas).

    🏦 Cuentas (Bolsillo por defecto, banco, ahorros) con historial y variación de saldo.

    ✅ Checklist periódica en el home: lo no marcado se contabiliza como ahorrado.

    🎯 Metas de ahorro con barra de progreso.

    🔍 Filtros por nombre, fecha, etiqueta y valor.

    🌐 Interfaz 100 % en español con skeletons de carga y errores claros.

🛠 Stack actual

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · TypeScript 7 · Vite 8 |
| Rutas | React Router 7 |
| Autenticación y datos | Firebase Authentication · Cloud Firestore |
| Archivos | Firebase Storage (fotos de perfil) |
| Interfaz | Tailwind CSS 4 · shadcn/ui · Radix UI |
| Notificaciones | notistack |
| Iconos y tipografía | Remix Icon · Poppins |
| Utilidades de estilos | clsx · tailwind-merge |
| Calidad | Oxlint · TypeScript (`tsc --noEmit`) |

Las pruebas automatizadas, las gráficas y las librerías de formularios todavía no están configuradas.

🚀 Empezar
Requisitos

    Node.js 20.19+ o 22.12+

    Proyecto de Firebase con Authentication, Cloud Firestore y Cloud Storage habilitados

Instalación
bash

# 1. Clonar el repositorio

git clone <repo-url>
cd sigia

# 2. Instalar dependencias

npm install

# 3. Crear el archivo local de variables de entorno
cp .env.template .env
# Completa VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
# VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
# VITE_FIREBASE_MESSAGING_SENDER_ID y VITE_FIREBASE_APP_ID

# 4. Levantar el entorno de desarrollo

npm run dev

La app estará disponible en http://localhost:5173.
Scripts disponibles
bash

npm run dev       # Servidor de desarrollo
npm run typecheck # Verifica los tipos de TypeScript
npm run build     # Verifica tipos y genera el build de producción
npm run lint      # Ejecuta Oxlint
npm run preview   # Previsualiza el build

📁 Estructura del proyecto
text

src/
├── app/          # router y providers de la aplicación
├── features/
│   ├── auth/     # autenticación, estado y formularios
│   └── dashboard/
├── firebase/     # configuración y hooks de acceso a Firebase
├── lib/          # utilidades generales (composición de clases CSS)
├── pages/        # páginas enrutables
├── shared/       # componentes compartidos y hooks
└── styles/       # estilos globales y tema Tailwind

Principios de arquitectura

    Feature-based: cada módulo agrupa componentes, hooks y servicios.

    Acceso a Firebase centralizado en firebase/ y en las funciones de cada feature.

    Componentes compartidos en shared/ y páginas conectadas mediante app/router.


🗺 Rutas implementadas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Pública | Página de inicio |
| `/signup` | Pública | Registro |
| `/login` | Pública | Inicio de sesión |
| `/dashboard` | Privada | Panel principal |

🗄 Modelo de datos previsto

| Colección | Descripción |
|---|---|
| `users/{uid}` | Perfil del usuario |
| `accounts/{accountId}` | Cuentas financieras (`user_id`, `name`, `default`) |
| `users/{uid}/items` | Conceptos de gasto e ingreso |
| `users/{uid}/groups` | Grupos personalizados |
| `users/{uid}/entries` | Movimientos |
| `users/{uid}/savings_goals` | Metas de ahorro |

Los items pueden guardar los identificadores de sus grupos en un campo `groupIds`, evitando una tabla de unión.

Reglas clave:

    Cloud Firestore Security Rules restringen el perfil por uid y las cuentas por user_id.

    Las reglas y la validación de la aplicación verifican datos como monto > 0 y frecuencias válidas.

    Configurar índices compuestos de Firestore para las consultas de movimientos (por fecha, item y cuenta) según se necesiten.

    Implementar las agregaciones del dashboard con consultas o agregaciones de Firestore, según los requisitos de lectura y escritura.

🧮 Fórmulas de negocio

    % de un gasto = gasto del periodo ÷ ingresos del periodo × 100

    Gasto anual proyectado = monto × factor (diario 365 · semanal 52 · mensual 12 · anual 1 · eventual = suma real del año)

    Ahorro por checklist = suma de montos de gastos marcados como "ahorrado"

    Variación de cuenta = (saldo actual − saldo anterior) ÷ saldo anterior × 100

🧪 Calidad

Actualmente se ejecutan Oxlint y el chequeo de tipos de TypeScript durante el build. Las pruebas unitarias, de componentes, E2E y de reglas de Firebase están pendientes de configuración.

Definition of Done: PR revisado, tests en verde, sin errores de lint, textos en español, estados carga/vacío/error implementados y desplegado en previsualización.
📅 Roadmap

    ☑

    Sprint 0 · Preparación (repo, CI, modelo de datos)
    □

    Sprint 1 · Autenticación, rutas privadas, layout, reglas de seguridad de Firestore
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
>>>>>>> 5704157ccaf3f16a3b558b5d4e20fc66e9fcd5f9
