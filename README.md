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

4. Embed the slide in a blog post.

   Embed slides in your post with the following tag:

   ```nunjucks
   {% reveal "path/to/file" %}
   ```

   Specify the path to the slide in `path/to/file`. In the above example, the slide created in `source/_slides/path/to/file.md` and published to `/slide/path/to/file.html` will be embedded. It will be rendered as follows.

   ```html
   <div class="hexo-reveal-embed">
     <iframe
       src="/slide/path/to/file.html"
       allowfullscreen
       loading="lazy"
     >
     </iframe>
   </div>
   ```

5. Adjust the design

   This plugin does not make any design adjustments so that you can set the design as you like.

   Use the `.hexo-reveal-embed` class set in the embedded tag and freely set the css. For example, the following css would display the entire width of the parent element and set the aspect ratio to 16:9.

   ```css
   .hexo-reveal-embed {
     width: 100%;
     height: 0;
     padding-top: 56.25%; /* 16:9 ratio (9/16 = 0.5625) */
     position: relative;
   }
   
   .hexo-reveal-embed iframe {
     width: 100%;
     height: 100%;
     position: absolute;
     top: 0;
   }
   ```

### Front-matter

Front-matter allows you to configure the following settings for each slide.

* `title`
  The title of the slide page. This will be displayed in the browser tab.
* `theme` 
  You can specify the name of the theme provided by reveal.js. You can check the list [here](https://revealjs.com/themes/).

### Configuration

You can configure the behavior of reveal.js from your blog's `_config.yml`. For example, to enable URL Fragment and Browser History for a slide in full screen view:

````yaml
reveal:
   config:
     hash: true
     history: false
````

The `reveal.config` settings written above will be passed to reveal.js as is. A list of reveal.js settings can be found [here](https://revealjs.com/config/).

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
