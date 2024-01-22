import { copyFile, mkdir, rm, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import parse from 'front-matter';
import type Hexo from 'hexo';
import { getMyVersion } from './get-my-version';

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
    if (file.params.ext !== 'md') {
      await mkdir(dirname(filename), { recursive: true });
      await copyFile(file.source, filename);
      return;
    }

    const page = await file.read({ encoding: 'utf-8' });
    const { body, attributes } = parse(page.toString());

    const plugins = parsePlugin(this.config.reveal?.plugins);

    await mkdir(dirname(filename), { recursive: true });
    await writeFile(
      filename,
      createHtml(
        getMyVersion(),
        body,
        { ...(this.config.reveal?.default ?? {}), ...(attributes ?? {}) },
        this.config,
        plugins,
      ),
    );

    return;
  }

  const _: never = file.type;
}

export const parsePlugin = (input: unknown) => {
  const parsed =
    typeof input === 'string' ? [input]
    : input == null ? []
    : input;

  if (!Array.isArray(parsed)) {
    throw new Error('`plugins` must be an array');
  }

  const plugins = getBundledPlugin(getMyVersion());

  const invalidName = parsed.find(
    (plugin) =>
      plugins.find((p) => p.name === plugin || isPlugin(plugin)) === undefined,
  );
  if (invalidName) {
    throw new Error(`Invalid plugin name: ${invalidName}`);
  }

  return [
    ...plugins.filter((v) => parsed.includes(v.name) || v.force),
    ...parsed.filter(isPlugin),
  ];
};

const getFilename = (hexo: Hexo, file: Hexo.Box.File) =>
  join(
    hexo.public_dir,
    'slide',
    file.params.name +
      '.' +
      (file.params.ext === 'md' ? 'html' : file.params.ext),
  );

type Plugin = {
  readonly force?: true;
  readonly name: string;
  readonly url: string;
};
const isPlugin = (v: unknown): v is Plugin =>
  v != null &&
  typeof v === 'object' &&
  typeof Reflect.get(v, 'name') === 'string' &&
  typeof Reflect.get(v, 'url') === 'string';

const getBundledPlugin = (version: string) =>
  [...Plugins].map((plugin) => ({
    ...plugin,
    url: plugin.url + `?v=${version}`,
  }));

const Plugins: readonly Plugin[] = [
  {
    force: true,
    name: 'RevealMarkdown',
    url: '/reveal.js/plugin/markdown/markdown.js',
  },
  { name: 'RevealHighlight', url: '/reveal.js/plugin/highlight/highlight.js' },
  { name: 'RevealSearch', url: '/reveal.js/plugin/math/math.js' },
  { name: 'RevealNotes', url: '/reveal.js/plugin/notes/notes.js' },
  { name: 'RevealMath', url: '/reveal.js/plugin/search/search.js' },
  { name: 'RevealZoom', url: '/reveal.js/plugin/zoom/zoom.js' },
];

const createHtml = (
  version: string,
  content: string,
  slideConfig: Record<string, unknown>,
  config: Hexo['config'],
  plugins: Plugin[],
) => `
<!doctype html>
<html lang="${config.language}">
  <head>
    <meta charset="utf-8">
    <meta name="googlebot" content="noindex,indexifembedded" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>${slideConfig.title || config.title || 'Hexo with reveal.js'}</title>

    <link rel="stylesheet" href="/reveal.js/dist/reset.css?v=${version}">
    <link rel="stylesheet" href="/reveal.js/dist/reveal.css?v=${version}">
    <link rel="stylesheet" href="/reveal.js/dist/theme/${
      slideConfig.theme || 'black'
    }.css?v=${version}">

    <!-- Theme used for syntax highlighted code -->
    <link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css?v=${version}">

    ${config.reveal?.css_urls?.map((url: unknown) => `<link rel="stylesheet" href="${url}">`).join('') || ''}

  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section data-markdown>
          <textarea data-template>

${content}

          </textarea>
        </section>
      </div>
    </div>

    <script src="/reveal.js/dist/reveal.js?v=${version}"></script>
    ${plugins.map((plugin) => `<script src="${plugin.url}"></script>`).join('')}
    ${config.reveal?.js_urls?.map((url: unknown) => `<script src="${url}"></script>`).join('') || ''}
    <script>
      Reveal.initialize({
        ...${JSON.stringify(config.reveal?.config || {})},
        plugins: [${plugins.map((plugin) => `${plugin.name}`).join(', ')}],
      });
    </script>
  </body>
</html>
`;
