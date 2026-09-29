# NYXAND

Portafolio personal de Andreh Callejas. Es un sitio estático desarrollado con HTML, CSS y JavaScript, enfocado en presentar experiencia, formación académica y proyectos de software.

## Descripción

El sitio utiliza una estética monocromática y una interfaz orientada a frontend. Incluye navegación por secciones, transiciones entre páginas, animaciones de entrada, cursor personalizado y una adaptación básica para dispositivos pequeños.

El contenido visible se limita a información y proyectos que cuentan con una referencia pública. Los enlaces de código apuntan directamente a sus repositorios correspondientes.

## Proyectos

- [mono-motion](https://github.com/AndrehhX/mono-motion): experimento de frontend editorial con React, TypeScript, GSAP y transiciones interactivas.
- [Student-Organizer-Web](https://github.com/AndrehhX/Student-Organizer-Web): proyecto grupal académico para organizar estudiantes, calificaciones, tareas y promedios. Incluye el flujo de inicio de sesión y la base del dashboard.
- [POO-Ejercicio-4-RentaMovil](https://github.com/AndrehhX/POO-Ejercicio-4-RentaMovil): ejercicio académico de herencia en Java con menú de consulta, cotización, alquiler y devolución de vehículos.

Aevora también aparece en el portafolio como proyecto en desarrollo: un launcher de escritorio construido con React, TypeScript, Tauri y Rust. La versión actual integra Steam para biblioteca, carátulas, noticias y lanzamiento; la conexión con Epic Games y GOG forma parte de la siguiente etapa. El código está disponible en https://github.com/AndrehhX/Aevora.

## Estructura

```text
index.html        Página principal
css/style.css     Estilos generales y responsive
js/main.js        Navegación, transiciones y animaciones
pages/about.html  Página independiente About me
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
