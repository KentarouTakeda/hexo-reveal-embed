import { revealTagCallback } from "../src/reveal.tag";

describe("reveal.tag", () => {
  describe("revealTagCallback", () => {
    it("TODO", () => {
      const html = revealTagCallback(["foo"], undefined);

      expect(html).toContain('<div class="hexo-reveal-embed">');
      expect(html).toContain('<iframe src="/slide/foo.html"');
      expect(html).toContain("</iframe>");
    });
  });
});
