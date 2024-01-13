import { mkdir, rm, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import type Hexo from 'hexo';
import { parse } from 'hexo-front-matter';

export async function revealProcessorCallback(this: Hexo, file: Hexo.Box.File) {
  if (file.type === 'skip') {
    return;
  }

  const filename = getFilename(this, file);

  if (file.type === 'delete') {
    await rm(filename);

    return;
  }

  if (file.type === 'update' || file.type === 'create') {
    const page = await file.read({ encoding: 'utf-8' });
    const content = parse(page.toString());
    const plugins = parsePlugin(this.config.reveal?.plugins);

    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, createHtml(content, this.config, plugins));

    return;
  }

  const _: never = file.type;
}

export const parsePlugin = (plugins: unknown) => {
  const parsed =
    typeof plugins === 'string' ? [plugins]
    : plugins == null ? []
    : plugins;

  if (!Array.isArray(parsed)) {
    throw new Error('`plugins` must be an array');
  }

  const invalidName = parsed.find(
    (plugin) => Plugins.find((p) => p.name === plugin) === undefined,
  );
  if (invalidName) {
    throw new Error(`Invalid plugin name: ${invalidName}`);
  }

  return Plugins.filter((v) => parsed.includes(v.name) || v.force);
};

const getFilename = (hexo: Hexo, file: Hexo.Box.File) =>
  join(
    hexo.public_dir,
    'slide',
    file.params.name + (file.params.ext === 'md' ? '.html' : file.params.ext),
  );

type Plugin = {
  readonly force: boolean;
  readonly name: string;
  readonly path: string;
};

const Plugins: readonly Plugin[] = [
  { force: true, name: 'RevealMarkdown', path: 'markdown/markdown.js' },
  { force: false, name: 'RevealHighlight', path: 'highlight/highlight.js' },
  { force: false, name: 'RevealSearch', path: 'math/math.js' },
  { force: false, name: 'RevealNotes', path: 'notes/notes.js' },
  { force: false, name: 'RevealMath', path: 'search/search.js' },
  { force: false, name: 'RevealZoom', path: 'zoom/zoom.js' },
];

const createHtml = (
  content: Record<string, unknown> & { _content: string },
  config: Hexo['config'],
  plugins: Plugin[],
) => `
<!doctype html>
<html lang="${config.language}">
  <head>
    <meta charset="utf-8">
    <meta name="googlebot" content="noindex,indexifembedded" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>${content.title || config.title || 'Hexo with reveal.js'}</title>

    <link rel="stylesheet" href="/reveal.js/dist/reset.css">
    <link rel="stylesheet" href="/reveal.js/dist/reveal.css">
    <link rel="stylesheet" href="/reveal.js/dist/theme/${
      content.theme || 'black'
    }.css">

    <!-- Theme used for syntax highlighted code -->
    <link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css">
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section data-markdown>
          <textarea data-template>

${content._content}

          </textarea>
        </section>
      </div>
    </div>

    <script src="/reveal.js/dist/reveal.js"></script>
    ${plugins
      .map(
        (plugin) => `<script src="/reveal.js/plugin/${plugin.path}"></script>`,
      )
      .join('')}
    <script>
      Reveal.initialize({
        ...${JSON.stringify(config.reveal?.config || {})},
        plugins: [${plugins.map((plugin) => `${plugin.name}`).join(', ')}],
      });
    </script>
  </body>
</html>
`;
