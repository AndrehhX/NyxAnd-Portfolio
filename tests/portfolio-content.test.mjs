import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const nexusCard = index.match(/<article[^>]+data-project="nexus"[\s\S]*?<\/article>/i)?.[0];

assert.ok(nexusCard, 'NEXUS debe tener una tarjeta propia en el portafolio');
assert.match(nexusCard, /NEXUS/i);
assert.match(nexusCard, /IN DEVELOPMENT/i);
assert.match(nexusCard, /Steam/i);
assert.match(nexusCard, /Epic Games/i);
assert.match(nexusCard, /GOG/i);
assert.doesNotMatch(nexusCard, /href=/i, 'NEXUS no debe fingir un demo o repositorio');

console.log('portfolio-content: ok');
