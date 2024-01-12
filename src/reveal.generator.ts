import { createReadStream, existsSync, realpathSync } from 'fs';
import { cwd } from 'process';
import { globSync } from 'glob';

export const revealGeneratorCallback = () => {
  const dirs = [
    __dirname + '/../node_modules/reveal.js',
    cwd() + '/node_modules/reveal.js',
  ];

  const dir = dirs.find((dir) => existsSync(dir));

  if (!dir) {
    throw new Error('reveal.js not found');
  }

  const baseDir = realpathSync(dir);

  return [
    ...globSync(baseDir + '/dist/**/*', { nodir: true }),
    ...globSync(baseDir + '/plugin/**/*', { nodir: true }),
  ].map((file) => ({
    data: () => createReadStream(file),
    path: 'reveal.js/' + file.slice(baseDir.length + 1),
  }));
};
