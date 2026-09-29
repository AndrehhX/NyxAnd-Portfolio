import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const projectsSection = index.match(/<section[^>]+id="projects"[\s\S]*?<\/section>/i)?.[0];
const workSection = index.match(/<section[^>]+id="work-in-progress"[\s\S]*?<\/section>/i)?.[0];

assert.ok(workSection, 'NEXUS debe tener una sección independiente');
assert.match(workSection, /NEXUS/i);
assert.match(workSection, /WORK IN PROGRESS/i);
assert.match(workSection, /Steam/i);
assert.match(workSection, /Epic Games/i);
assert.match(workSection, /GOG/i);
assert.doesNotMatch(workSection, /href=/i, 'NEXUS no debe fingir un demo o repositorio');
assert.ok(projectsSection, 'El grid de proyectos debe seguir existiendo');
assert.doesNotMatch(projectsSection, /NEXUS/i, 'NEXUS no debe verse como un proyecto terminado');

console.log('portfolio-content: ok');
