# Hexo Reveal Embed

This [Hexo](https://hexo.io/) plugin allows you to display slides created with [reveal.js](https://revealjs.com/) on your blog. Both embedded display and full screen display are possible.

## Requirements

- Hexo 6 or later
- Node.js 18.0 or later

## Installation

```bash
npm install hexo-reveal-embed
```

## How To Use

1. Create your slides with reveal.js.

   Create a reveal.js slide in markdown format under the `source/_slides/` directory. You can see how to create slides using markdown with reveal.js [here](https://revealjs.com/markdown/).

   You can write front-matter at the beginning of markdown. Use this to set the slide page title and slide theme.

2. Generate slide pages.

   As usual, when you run `hexo generate` or `hexo server`, a slide page will be created under the `/<public_dir>/slide/` directory.

3. View slides full screen.

   When you access the URL under `/slide/` in your browser, the slide you created will be displayed in full screen.

4. Embed slides in a blog post.

   *TBD*

### Front-matter

Front-matter allows you to configure the following settings for each slide.

* `title`
  The title of the slide page. This will be displayed in the browser tab.
* `theme` 
  You can specify the name of the theme provided by reveal.js. You can check the list [here](https://revealjs.com/themes/).

## Contributing and Development

```bash
# Clone this repository and move to the directory:
git clone https://github.com/KentarouTakeda/hexo-reveal-embed.git
cd hexo-reveal-embed

# Install dependencies:
npm install

# Run tests:
npm test
```

## License

Hexo Reveal Embed is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
