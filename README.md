# Finanzas Personales

Aplicacion web responsive (mobile-first) para registrar y analizar finanzas personales. Construida con Next.js, PostgreSQL y Prisma, lista para desplegar en Railway.

## Caracteristicas

- **Dashboard interactivo**: Resumen de balance, ingresos, gastos y ahorro mensual
- **Gestion de transacciones**: CRUD completo con filtros y paginacion
- **Presupuestos por categoria**: Control mensual con alertas de exceso
- **Multiples cuentas**: Efectivo, banco y tarjetas de credito
- **Tarjetas de credito**: Seguimiento de deuda automatico
- **Importacion CSV**: Carga masiva de transacciones con BullMQ
- **Autenticacion segura**: Email magic link + Google OAuth
- **100% Responsive**: Diseno mobile-first con navegacion tipo app

## Stack Tecnologico

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Estilos**: TailwindCSS, shadcn/ui
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticacion**: NextAuth.js v5 (beta)
- **Jobs en background**: Redis + BullMQ
- **Validacion**: Zod
- **Testing**: Vitest

## Requisitos Previos

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Redis (para importacion CSV)

## Instalacion Local

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd finanzas-app
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finanzas_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Resend)
EMAIL_FROM="onboarding@resend.dev"
```

4. **Generar cliente Prisma y crear base de datos**
```bash
pnpm db:generate
pnpm db:push
```

5. **Ejecutar seed (opcional)**
```bash
pnpm db:seed -- tu@email.com
```

6. **Iniciar servidor de desarrollo**
```bash
pnpm dev
```

7. **Iniciar worker de importacion (en otra terminal)**
```bash
pnpm worker
```

La aplicacion estara disponible en `http://localhost:3000`

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Compila para produccion |
| `pnpm start` | Inicia servidor de produccion |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm format` | Formatea codigo con Prettier |
| `pnpm test` | Ejecuta tests en modo watch |
| `pnpm test:run` | Ejecuta tests una vez |
| `pnpm db:generate` | Genera cliente Prisma |
| `pnpm db:push` | Sincroniza schema con DB |
| `pnpm db:migrate` | Crea nueva migracion |
| `pnpm db:migrate:deploy` | Aplica migraciones en produccion |
| `pnpm db:seed` | Ejecuta seed de datos |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm worker` | Inicia worker de BullMQ |

## Estructura del Proyecto

```
finanzas-app/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (auth)/        # Paginas de autenticacion
│   │   ├── (app)/         # Paginas principales
│   │   └── api/           # Route handlers
│   ├── components/
│   │   ├── layout/        # Navegacion, header, sidebar
│   │   └── ui/            # Componentes shadcn/ui
│   ├── lib/
│   │   ├── validators/    # Schemas Zod
│   │   ├── auth.ts        # Configuracion NextAuth
│   │   ├── db.ts          # Cliente Prisma
│   │   ├── money.ts       # Utilidades de formato
│   │   ├── dates.ts       # Utilidades de fechas
│   │   ├── queue.ts       # Configuracion BullMQ
│   │   └── redis.ts       # Conexion Redis
│   ├── server/
│   │   ├── actions/       # Server actions
│   │   └── services/      # Logica de negocio
│   ├── types/             # Tipos TypeScript
│   └── workers/           # Procesadores BullMQ
└── ...
```

## Deploy en Railway

### 1. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea una cuenta
2. Crea un nuevo proyecto
3. Anade los siguientes servicios:
   - **PostgreSQL** (desde el marketplace)
   - **Redis** (desde el marketplace)

### 2. Configurar servicio web

1. Conecta tu repositorio de GitHub
2. Railway detectara automaticamente que es un proyecto Next.js
3. Configura las variables de entorno:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
NEXTAUTH_URL=https://tu-app.railway.app
NEXTAUTH_SECRET=generar-secreto-seguro
GOOGLE_CLIENT_ID=tu-client-id (opcional)
GOOGLE_CLIENT_SECRET=tu-client-secret (opcional)
EMAIL_FROM=noreply@tudominio.com
```

4. Configura el comando de build:
```
prisma generate && prisma migrate deploy && next build
```

### 3. Configurar worker (servicio separado)

1. Crea un nuevo servicio desde el mismo repo
2. Configura:
   - **Start Command**: `pnpm worker`
   - **Variables de entorno**: Las mismas que el servicio web

### 4. Verificar despliegue

Una vez desplegado:
1. Accede a tu URL de Railway
2. Registrate con tu email
3. Los datos de seed se crearan automaticamente al primer login

## Variables de Entorno

| Variable | Requerida | Descripcion |
|----------|-----------|-------------|
| `DATABASE_URL` | Si | URL de conexion PostgreSQL |
| `NEXTAUTH_URL` | Si | URL base de la aplicacion |
| `NEXTAUTH_SECRET` | Si | Secreto para encriptar sesiones |
| `REDIS_URL` | Si | URL de conexion Redis |
| `GOOGLE_CLIENT_ID` | No | ID de cliente Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Secreto de cliente Google OAuth |
| `EMAIL_FROM` | No | Email remitente para magic links |

## Siguientes Mejoras

- [ ] PWA (Progressive Web App) con Service Worker
- [ ] Escaneo de recibos con OCR
- [ ] Reglas automaticas de categorizacion
- [ ] Exportacion a PDF/Excel
- [ ] Metas de ahorro
- [ ] Graficos interactivos con Recharts
- [ ] Notificaciones push
- [ ] Multi-moneda con conversion
- [ ] Transacciones recurrentes
- [ ] Modo oscuro

## Licencia

MIT
