import type Hexo from "hexo";
import { mkdir, rm, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { parse } from "hexo-front-matter";

export async function revealProcessorCallback(this: Hexo, file: Hexo.Box.File) {
  if (file.type === "skip") {
    return;
  }

  const filename = getFilename(this, file);

  if (file.type === "delete") {
    await rm(filename);

    return;
  }

  if (file.type === "update" || file.type === "create") {
    const page = await file.read({ encoding: "utf-8" });
    const content = parse(page.toString());

    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, createHtml(content, this.config));

    return;
  }

  const _: never = file.type;
}

const getFilename = (hexo: Hexo, file: Hexo.Box.File) =>
  join(hexo.public_dir, "slide", file.params[1] + ".html");

const createHtml = (content: any, config: Hexo['config']) => `
<!doctype html>
<html lang="${config.language}">
  <head>
    <meta charset="utf-8">
    <meta name="googlebot" content="noindex,indexifembedded" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>${content.title || config.title || 'Hexo with reveal.js'}</title>

    <link rel="stylesheet" href="/reveal.js/dist/reset.css">
    <link rel="stylesheet" href="/reveal.js/dist/reveal.css">
    <link rel="stylesheet" href="/reveal.js/dist/theme/${content.theme || 'black'}.css">

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
    <script src="/reveal.js/plugin/notes/notes.js"></script>
    <script src="/reveal.js/plugin/markdown/markdown.js"></script>
    <script src="/reveal.js/plugin/highlight/highlight.js"></script>
    <script>
     Reveal.initialize({
      ...${JSON.stringify(config.reveal || {})},
       plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ],
     });
    </script>
  </body>
</html>
`;
