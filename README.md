# Sistema de Gestión de Olimpíadas Científicas – Oh! Sansi 2025 (Frontend)

Este proyecto corresponde al **frontend del Sistema de Gestión de Olimpíadas Científicas Oh! Sansi 2025**, desarrollado con **Next.js** para proporcionar una interfaz moderna, responsiva y accesible a los diferentes roles del sistema.

La aplicación permite la interacción de **administradores, responsables de área y evaluadores**, así como la visualización pública de resultados, clasificaciones y medalleros.

---

## Tecnologías utilizadas

- **Next.js** – Framework React para aplicaciones web modernas
- **TypeScript** – Tipado estático para mayor robustez
- **React** – Biblioteca para construcción de interfaces
- **Tailwind CSS** – Estilización y diseño responsivo
- **PNPM / NPM** – Gestión de dependencias
- **Lucide Icons** – Iconografía del sistema

---

## Funcionalidades principales

- Autenticación y control de acceso por roles  
- Panel de administrador  
- Panel de responsable de área  
- Panel de evaluador  
- Gestión visual de olimpistas  
- Evaluación y registro de notas  
- Control y aprobación de fases  
- Visualización de resultados y medallero  
- Diseño responsivo para escritorio y dispositivos móviles  

---

## Estructura general

El proyecto utiliza el **App Router de Next.js**, organizando las vistas por rutas y módulos funcionales, separando claramente:

- Vistas públicas  
- Vistas privadas por rol  
- Componentes reutilizables  
- Servicios de comunicación con el backend  

---

## Requisitos previos

Antes de iniciar, asegúrate de tener instalado:

- Node.js 18 o superior  
- PNPM, NPM, Yarn o Bun  

---

## Instalación del proyecto

```bash
pnpm install
# o
npm install
Ejecución en entorno de desarrollo
bash
Copiar código
pnpm dev
# o
npm run dev
# o
yarn dev
# o
bun dev
La aplicación estará disponible en:

👉 http://localhost:3000

Desarrollo
Puedes comenzar a editar la aplicación modificando:

ts
Copiar código
app/page.tsx
Los cambios se reflejarán automáticamente en el navegador durante el desarrollo.

Optimización de fuentes
Este proyecto utiliza el sistema de optimización de fuentes de Next.js mediante:

next/font

Fuente Geist optimizada para aplicaciones web modernas

Despliegue
La forma más sencilla de desplegar esta aplicación es utilizando Vercel, plataforma oficial de Next.js.

👉 https://vercel.com

Para más información:

👉 https://nextjs.org/docs/app/building-your-application/deploying

Contexto académico
Este proyecto fue desarrollado como parte de la materia Taller de Ingeniería de Software, aplicando principios de:

Diseño de interfaces de usuario

Arquitectura frontend moderna

Separación de responsabilidades

Usabilidad y experiencia de usuario

Integración frontend–backend

Recursos
Documentación de Next.js: https://nextjs.org/docs

React: https://react.dev

Tailwind CSS: https://tailwindcss.com

Licencia
Este proyecto se distribuye bajo la licencia MIT.