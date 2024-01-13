import { revealTagCallback } from '../src/reveal.tag';

describe('reveal.tag', () => {
  describe('revealTagCallback', () => {
    it('should render iframe tag with `html` extension', () => {
      const html = revealTagCallback(['foo'], undefined);

      expect(html).toContain('<div class="hexo-reveal-embed">');
      expect(html).toContain('<iframe src="/slide/foo.html"');
      expect(html).toContain('</iframe>');
    });

    it('should render iframe tag with directory index', () => {
      const html = revealTagCallback(['foo/'], undefined);

      expect(html).toContain('<div class="hexo-reveal-embed">');
      expect(html).toContain('<iframe src="/slide/foo/"');
      expect(html).toContain('</iframe>');
    });
  });
});
