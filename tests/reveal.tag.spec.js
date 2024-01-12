"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reveal_tag_1 = require("../src/reveal.tag");
describe('reveal.tag', () => {
    describe('revealTagCallback', () => {
        it('TODO', () => {
            const html = (0, reveal_tag_1.revealTagCallback)(['foo'], undefined);
            expect(html).toContain('<div class="hexo-reveal-embed">');
            expect(html).toContain('<iframe src="/slide/foo.html"');
            expect(html).toContain('</iframe>');
        });
    });
});
