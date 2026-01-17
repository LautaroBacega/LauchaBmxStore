# Laucha BMX Store

Una tienda online completa para productos de BMX desarrollada con tecnologías modernas. Incluye sistema de autenticación, panel de administración, calculadora de envíos y gestión completa de productos.

## Características Principales

- **Catálogo de Productos**: Navegación por categorías, búsqueda avanzada y filtros
- **Sistema de Autenticación**: Registro, login, OAuth con Google, recuperación de contraseña
- **Panel de Administración**: CRUD completo de productos, gestión de imágenes, importación/exportación
- **Calculadora de Envíos**: Integración con API de Andreani para cálculo de costos por código postal
- **Diseño Responsivo**: Optimizado para móviles y escritorio
- **Gestión de Sesiones**: Tokens JWT con refresh automático
- **Almacenamiento en la Nube**: Firebase Storage para imágenes
- **UI Moderna**: Tailwind CSS con componentes Radix UI

## Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React para producción
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes de UI accesibles
- **React Hook Form + Zod** - Manejo y validación de formularios
- **Lucide React** - Iconografía
- **Vite** - Build tool alternativo para desarrollo

### Backend
- **Express.js** - Framework web para Node.js
- **MongoDB + Mongoose** - Base de datos NoSQL y ODM
- **JWT** - Autenticación basada en tokens
- **Firebase Admin** - Integración server-side con Firebase
- **Multer** - Manejo de archivos
- **Nodemailer** - Servicio de emails
- **Bcrypt** - Encriptación de contraseñas

### Servicios Externos
- **Firebase Storage** - Almacenamiento de imágenes
- **Andreani API** - Cálculo de envíos
- **Google OAuth** - Autenticación social

## Estructura del Proyecto

\`\`\`
├── app/                    # Next.js App Router
├── client/                 # Cliente Vite (alternativo)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # Servicios API
│   └── public/             # Archivos estáticos
├── api/                    # Backend Express
│   ├── controllers/        # Lógica de negocio
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas API
│   └── utils/             # Utilidades
└── components/            # Componentes Next.js
\`\`\`

## Configuración e Instalación

### Prerrequisitos
- Node.js 18+
- MongoDB
- Cuenta de Firebase
- Cuenta de Google Cloud (para OAuth)

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

\`\`\`env
# Base de datos
MONGO=mongodb://localhost:27017/laucha-bmx-store

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Email (Nodemailer)
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
SENDER_EMAIL=noreply@lauchaBmxstore.com

# URLs
FRONTEND_URL=http://localhost:5173
PORT=3000

# Administradores (emails separados por comas)
ADMIN_EMAILS=admin@lauchaBmxstore.com,admin2@lauchaBmxstore.com
\`\`\`

### Firebase Configuration

Crea `client/src/firebase.js`:

\`\`\`javascript
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "tu_api_key",
  authDomain: "tu_auth_domain",
  projectId: "tu_project_id",
  storageBucket: "tu_storage_bucket",
  messagingSenderId: "tu_sender_id",
  appId: "tu_app_id"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
\`\`\`

### Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone
cd laucha-bmx-store
\`\`\`

2. **Instalar dependencias del backend**
\`\`\`bash
cd api
npm install
\`\`\`

3. **Instalar dependencias del cliente**
\`\`\`bash
cd ../client
npm install
\`\`\`


### Ejecución en Desarrollo

1. **Iniciar MongoDB**
\`\`\`bash
mongod
\`\`\`

2. **Iniciar el backend**
\`\`\`bash
cd api
npm run dev
\`\`\`

3. **Iniciar el cliente (en otra terminal)**
\`\`\`bash
cd client
npm run dev
\`\`\`

4. **Acceder a la aplicación**
- Cliente: http://localhost:5173
- API: http://localhost:3000

## Funcionalidades Detalladas

### Catálogo de Productos
- Visualización en grid y lista
- Filtros por categoría, marca y precio
- Búsqueda en tiempo real
- Paginación automática
- Imágenes con placeholder automático

### Panel de Administración
- Gestión completa de productos (CRUD)
- Subida optimizada de imágenes a Firebase
- Importación/exportación de datos JSON
- Control de stock y precios
- Gestión de categorías y marcas

### Sistema de Envíos
- Calculadora integrada con Andreani
- Cálculo por código postal
- Estimación de tiempos de entrega
- Diferentes zonas de envío
- Precios actualizados automáticamente

### Autenticación Avanzada
- Registro con verificación por email
- Login tradicional y OAuth Google
- Recuperación de contraseña
- Tokens JWT con refresh automático
- Protección de rutas sensibles

## Despliegue

### Backend (Railway/Heroku)
1. Configurar variables de entorno
2. Conectar repositorio
3. Desplegar automáticamente

### Frontend (Netlify/Vercel)
1. Configurar build command: `npm run build`
2. Configurar redirects para SPA
3. Configurar variables de entorno

### Base de Datos (MongoDB Atlas)
1. Crear cluster en MongoDB Atlas
2. Configurar IP whitelist
3. Actualizar MONGO_URI en variables de entorno


## Contacto

- **Desarrollador**: Lautaro Bacega
- **Email**: lautibacega@gmail.com

