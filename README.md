# 💎 Renelygems - Sistema de Gestión y Catálogo de Joyería

**Renelygems** es una empresa salvadoreña dedicada a la joyería artesanal con piedras preciosas, minerales, perlas y plata.  
Este proyecto busca desarrollar una aplicación web que automatice sus procesos internos y mejore la experiencia de venta y control de inventario.

---

## 💡 Introducción

Renelygems es una aplicación web diseñada para la gestión y visualización de un catálogo de joyería. El sistema permite administrar productos, registrar clientes y gestionar pedidos de manera sencilla y eficiente. Su objetivo principal es brindar una herramienta práctica y moderna para facilitar la organización del inventario y mejorar la experiencia de los usuarios al explorar las joyas disponibles.

La aplicación está construida utilizando tecnologías JavaScript Fullstack, con React para el frontend y se proyecta integrar un backend en Node.js junto a una base de datos SQL, garantizando un desarrollo escalable y mantenible.

---

## 🌟 Objetivo del Proyecto
Desarrollar un sistema web integral que permita:
- Gestionar el inventario de productos y materiales.
- Registrar y controlar pedidos de clientes.
- Visualizar un catálogo digital de joyas.
- Generar reportes de ventas e inventario.
- Facilitar la comunicación entre la empresa y sus clientes.

---

## 📚 Tecnologías y Herramientas

- **Frontend:** React + TypeScript + Vite  
- **Backend:** (pendiente / por implementar)  
- **Base de datos:** MySQL 
- **Control de versiones:** Git / GitHub
- **Despliegue en la nube:** publicación del proyecto mediante Vercel para pruebas y demostraciones en línea.
- **Otros:** herramientas de linting, configuración de Vite, etc.

---

## ✅ Avance Actual

Aquí indicas qué tanto has avanzado, por ejemplo:

- [x] Estructura inicial de proyecto frontend generada con Vite + React + TypeScript  
- [x] Configuración básica de ESLint / configuración del proyecto  
- [ ] Desarrollo de módulo de inventario  
- [ ] Conexión con backend / API  
- [ ] Implementación de módulos de clientes, pedidos, reportes

---

## 👥 Integrantes
- Emilia Eunice Meléndez Barreiro, MB211545
- William Ernesto Rodríguez Reyes, RR201800
- Melissa Vanina López Peña, LP223029
- Victor Amilcar Elías Peña, EP171613
- Rodrigo André Henríquez López, HL211477

---

## 📅 Próximos pasos
- Implementar módulo de inventario completo.
- Implementación del backend.
- Conectar frontend con el backend.
  
---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
