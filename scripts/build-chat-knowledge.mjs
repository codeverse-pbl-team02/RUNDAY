import { build } from 'vite';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Bundle the canonical course catalog, then export only public text (no GPS tracks).
const result = await build({ root: fileURLToPath(new URL('../', import.meta.url)), configFile: false, logLevel: 'error', build: {
  ssr: 'src/chatbot/knowledge.ts', write: false, minify: false,
} });
const chunk = result.output.find(item => item.type === 'chunk' && item.isEntry);
const { knowledge } = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`);
await writeFile(new URL('../server/knowledge.json', import.meta.url), `${JSON.stringify(knowledge, null, 2)}\n`);
console.log(`Chat knowledge exported: ${knowledge.length} documents.`);
