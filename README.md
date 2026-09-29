# NYXAND

Portafolio personal de Andreh Callejas. Es un sitio estático desarrollado con HTML, CSS y JavaScript, enfocado en presentar experiencia, formación académica y proyectos de software.

## Descripción

El sitio utiliza una estética monocromática y una interfaz orientada a frontend. Incluye navegación por secciones, transiciones entre páginas, animaciones de entrada, cursor personalizado y una adaptación básica para dispositivos pequeños.

El contenido visible se limita a información y proyectos que cuentan con una referencia pública. Los enlaces de código apuntan directamente a sus repositorios correspondientes.

## Proyectos

- [mono-motion](https://github.com/AndrehhX/mono-motion): experimento de frontend editorial con React, TypeScript, GSAP y transiciones interactivas.
- [Student-Organizer-Web](https://github.com/AndrehhX/Student-Organizer-Web): proyecto grupal académico para organizar estudiantes, calificaciones, tareas y promedios. Incluye el flujo de inicio de sesión y la base del dashboard.
- [POO-Ejercicio-4-RentaMovil](https://github.com/AndrehhX/POO-Ejercicio-4-RentaMovil): ejercicio académico de herencia en Java con menú de consulta, cotización, alquiler y devolución de vehículos.

El índice de repositorios está disponible en [`pages/codigo.html`](pages/codigo.html).

## Estructura

```text
index.html        Página principal
css/style.css     Estilos generales y responsive
css/pages.css     Estilos de páginas internas
js/main.js        Navegación, transiciones y animaciones
pages/codigo.html Índice de repositorios públicos
CV/               Currículum enlazado desde el sitio
```

## Ejecución local

No requiere un proceso de compilación. Puede abrirse directamente desde `index.html` o servirse con un servidor local:

```powershell
python -m http.server 4173
```

Después, abre `http://localhost:4173` en el navegador.

## Estado

El portafolio se mantiene como una presentación estática. Las capturas y demostraciones adicionales se incorporarán únicamente cuando exista material real para documentar cada proyecto.
