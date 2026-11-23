# TaskFlow

TaskFlow es una aplicación web responsive para gestionar tareas desde el navegador. Permite crear, consultar, completar y eliminar tareas. Los datos se guardan en `localStorage`, por lo que permanecen disponibles al recargar la página en el mismo navegador.

Este repositorio es un proyecto académico que demuestra un flujo de integración y despliegue continuos con GitHub Actions y GitHub Pages.

## Funcionalidades

- Crear tareas con validación de texto.
- Marcar tareas como completadas o pendientes.
- Eliminar tareas individualmente.
- Filtrar por todas, pendientes o completadas.
- Persistir el estado en `localStorage`.
- Interfaz accesible y adaptable a dispositivos móviles y de escritorio.

## Arquitectura

```text
.
├── index.html             # Estructura de la interfaz
├── src/
│   ├── app.js             # Renderizado y eventos del navegador
│   └── tasks.js           # Reglas de negocio y persistencia
├── styles.css             # Diseño responsive
├── tests/tasks.test.js    # Pruebas unitarias con node:test
├── scripts/
│   ├── setup.sh           # Preparación reproducible del proyecto
│   ├── build.sh           # Wrapper POSIX de compilación
│   └── build.js           # Generación multiplataforma de dist/
└── .github/workflows/
    └── deploy.yml         # CI y despliegue a GitHub Pages
```

`src/tasks.js` no depende del DOM. Expone sus funciones tanto mediante CommonJS para las pruebas de Node.js como mediante `window.TaskFlowTasks` para la interfaz. `src/app.js` se ocupa únicamente de conectar esas reglas con el DOM y `localStorage`.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Bash para ejecutar `scripts/setup.sh` o `scripts/build.sh` directamente (Git Bash, WSL, Linux o macOS). `npm run build` funciona solo con Node.js.

## Instalación

```bash
./scripts/setup.sh
```

El script ejecuta `npm ci`, crea el directorio de salida con `npm run build` y no requiere credenciales.

También se puede instalar manualmente:

```bash
npm ci
```

## Pruebas

```bash
npm test
```

Las pruebas usan el ejecutor integrado `node:test`; no se instalan frameworks externos. Cubren la creación, validación, actualización, eliminación y persistencia de tareas.

## Compilación

```bash
npm run build
```

El comando recrea `dist/` y copia allí los recursos estáticos listos para publicar. Las rutas son relativas, por lo que la aplicación funciona bajo la ruta de proyecto de GitHub Pages `/task-cicd/`.

Para revisar el resultado localmente se puede servir la carpeta generada con cualquier servidor estático, por ejemplo:

```bash
npx serve dist
```

## CI/CD y despliegue

El workflow `.github/workflows/deploy.yml` se ejecuta en cada `push` y `pull_request`:

1. Instala exactamente las versiones del lockfile mediante `npm ci`.
2. Ejecuta `npm test`.
3. Genera `dist/` con `npm run build`.
4. En un `push` a `main`, y solo si las validaciones finalizan correctamente, publica el artefacto mediante las acciones oficiales de GitHub Pages.

El job de despliegue usa permisos mínimos (`pages: write` e `id-token: write`) y el entorno protegido `github-pages`. Antes del primer despliegue, el repositorio debe tener **Settings → Pages → Source** configurado como **GitHub Actions**. El workflow no incluye tokens ni credenciales; utiliza el token efímero proporcionado por GitHub Actions.

El estado real del sitio debe comprobarse en la ejecución del workflow y en la sección **Environments** del repositorio. La existencia de esta configuración por sí sola no garantiza que GitHub Pages ya esté publicado.

## Licencia

Proyecto creado con fines académicos.
