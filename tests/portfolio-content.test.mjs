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
assert.match(style, /\.work-in-progress\s*\{[\s\S]*?background:\s*var\(--white\)/i);
assert.match(style, /@keyframes\s+wip/i, 'NEXUS debe tener una animación propia');

console.log('portfolio-content: ok');
