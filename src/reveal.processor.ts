import type Hexo from "hexo";
import { mkdir, rm, writeFile } from "fs/promises";
import { join, dirname } from "path";

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
    const body = await file.read({ encoding: "utf-8" });
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, createHtml(body.toString(), this.config));

    return;
  }

  const _: never = file.type;
}

const getFilename = (hexo: Hexo, file: Hexo.Box.File) =>
  join(hexo.public_dir, "slide", file.params[1] + ".html");

const createHtml = (markdown: string, config: Hexo['config']) => `
<!doctype html>
<html lang="${config.language}">
  <head>
    <meta charset="utf-8">
    <meta name="googlebot" content="noindex,indexifembedded" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <title>reveal.js</title> <!-- TODO title-->

    <!-- TODO css-->
    <link rel="stylesheet" href="/reveal.js/dist/reset.css">
    <link rel="stylesheet" href="/reveal.js/dist/reveal.css">
    <link rel="stylesheet" href="/reveal.js/dist/theme/black.css">

    <!-- Theme used for syntax highlighted code -->
    <link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css">
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <section data-markdown>
          <textarea data-template>

${markdown}

          </textarea>
        </section>
      </div>
    </div>

    <script src="/reveal.js/dist/reveal.js"></script>
    <script src="/reveal.js/plugin/notes/notes.js"></script>
    <script src="/reveal.js/plugin/markdown/markdown.js"></script>
    <script src="/reveal.js/plugin/highlight/highlight.js"></script>
    <script>
      // More info about initialization & config:
      // - https://revealjs.com/initialization/
      // - https://revealjs.com/config/
      Reveal.initialize({
        hash: true,

        // Learn about plugins: https://revealjs.com/plugins/
        plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
      });
    </script>
  </body>
</html>
`;
