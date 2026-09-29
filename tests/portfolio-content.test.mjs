import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const style = await readFile(new URL('../css/style.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');
const projectsSection = index.match(/<section[^>]+id="projects"[\s\S]*?<\/section>/i)?.[0];
const workSection = index.match(/<section[^>]+id="work-in-progress"[\s\S]*?<\/section>/i)?.[0];

assert.match(index, /class="hero-identity-card"/i, 'El hero debe tener una tarjeta de identidad NYXAND');
assert.match(index, /id="profilePortrait"/i, 'El hero debe reservar un hook para el retrato personal');
assert.match(index, /Retrato pendiente|identity slot|portrait slot/i, 'El hero debe tener un fallback honesto si no hay retrato');
assert.match(main, /initHeroMotion\(prefersReducedMotion\)/, 'La entrada del hero debe tener un único inicializador');
assert.ok(workSection, 'NEXUS debe tener una sección independiente');
assert.match(workSection, /NEXUS/i);
assert.match(workSection, /WORK IN PROGRESS/i);
assert.match(workSection, /Steam/i);
assert.match(workSection, /Epic Games/i);
assert.match(workSection, /GOG/i);
assert.doesNotMatch(workSection, /href=/i, 'NEXUS no debe fingir un demo o repositorio');
assert.ok(projectsSection, 'El grid de proyectos debe seguir existiendo');
assert.doesNotMatch(projectsSection, /NEXUS/i, 'NEXUS no debe verse como un proyecto terminado');
assert.equal((projectsSection.match(/class="project-proof"/g) || []).length, 3, 'Cada proyecto terminado debe explicar qué demuestra');
assert.match(index, /id="live-status"/i, 'Debe existir el módulo de estado NYXAND');
assert.match(index, /id="localTime"/i, 'El estado debe mostrar la hora local');
assert.match(index, /id="pageTime"/i, 'El estado debe mostrar el tiempo en la página');
assert.match(index, /id="githubActivity"/i, 'El estado debe reservar la actividad de GitHub');
assert.match(index, /Offline|sin conexión|no disponible/i, 'El estado debe tener un fallback entendible');
assert.match(main, /api\.github\.com\/users\/AndrehhX\/events/i, 'El estado debe usar la actividad pública de GitHub');
assert.doesNotMatch(main, /Bearer\s+|github[_-]?token/i, 'La actividad pública no debe requerir secretos');
assert.match(index, /id="nyxand-terminal"/i, 'Debe existir la terminal visual de NYXAND');
assert.match(index, /id="terminalInput"/i, 'La terminal debe tener una entrada de teclado');
assert.match(index, /id="terminalOutput"[^>]+aria-live="polite"/i, 'La salida de terminal debe ser accesible');
for (const command of ['help', 'about', 'projects', 'stack', 'status', 'contact', 'clear']) {
  assert.match(main, new RegExp(`['"]${command}['"]`, 'i'), `La terminal debe reconocer ${command}`);
}
assert.match(main, /initTerminal\(\)/, 'La terminal debe tener un inicializador propio');
assert.doesNotMatch(main, /child_process|window\.open\(['"]shell|eval\(/i, 'La terminal no debe ejecutar comandos reales');
assert.match(index, /id="nyxand-lab"/i, 'Debe existir el laboratorio de NYXAND');
assert.match(index, /id="labEditor"/i, 'El laboratorio debe tener un editor');
assert.match(index, /id="labPreview"[^>]+sandbox/i, 'La vista previa debe estar aislada en un iframe sandbox');
assert.doesNotMatch(index, /allow-scripts/i, 'El laboratorio no debe habilitar scripts en la vista previa');
assert.match(index, /id="labRun"/i, 'El laboratorio debe tener un control de ejecución');
assert.match(index, /id="labReset"/i, 'El laboratorio debe poder restaurar su ejemplo');
assert.match(index, /data-starter=/i, 'El laboratorio debe incluir ejemplos intercambiables');
assert.match(main, /initLaboratory\(\)/, 'El laboratorio debe tener un inicializador propio');
assert.match(style, /\.work-in-progress\s*\{[\s\S]*?background:\s*var\(--white\)/i);
assert.match(style, /@keyframes\s+wip/i, 'NEXUS debe tener una animación propia');

console.log('portfolio-content: ok');
