jest.mock('fs/promises', () => ({
  rm: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  copyFile: jest.fn(),
}));

import fs from 'fs/promises';
import Hexo from 'hexo';
import { getMyVersion } from '../src/get-my-version';
import { revealProcessorCallback } from '../src/reveal.processor';

describe('reveal.processor', () => {
  let hexo: Hexo;
  let version: string;

  const file = {
    type: 'create',
    params: { name: 'path/to/slide', ext: 'md' },
  } as Hexo.Box.File;

  const markdown = '# This is a slide';
  const frontMatter = [
    '---',
    'title: Foo Title',
    'theme: barTheme',
    '---',
    '',
  ].join('\n');

  beforeEach(() => {
    hexo = new Hexo('/test');
    version = getMyVersion();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('revealProcessorCallback', () => {
    describe('skip', () => {
      it('should do nothing', async () => {
        await revealProcessorCallback.bind(hexo)({ ...file, type: 'skip' });
      });
    });

    describe('delete', () => {
      it('should delete a file', async () => {
        await revealProcessorCallback.bind(hexo)({ ...file, type: 'delete' });

        expect(fs.rm).toHaveBeenCalledWith(
          '/test/public/slide/path/to/slide.html',
        );
      });
    });

    describe('create / update', () => {
      it('should create the html containing markdown and config, not containing front-matter', async () => {
        hexo.config.reveal = {
          config: {
            foo: 'bar',
            baz: [42, 23],
          },
        };

        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(file).toEqual('/test/public/slide/path/to/slide.html');

          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/dist/reset.css?v=${version}">`,
          );
          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/dist/reveal.css?v=${version}">`,
          );
          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/dist/theme/black.css?v=${version}">`,
          );
          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/plugin/highlight/monokai.css?v=${version}">`,
          );
          expect(data).toContain(
            `<script src="/reveal.js/dist/reveal.js?v=${version}"></script>`,
          );

          expect(data).toContain(markdown);
          expect(data).not.toContain(frontMatter);
          expect(data).toContain('...{"foo":"bar","baz":[42,23]},');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(file.read).toHaveBeenCalled();
        expect(fs.mkdir).toHaveBeenCalledWith('/test/public/slide/path/to', {
          recursive: true,
        });
        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should create html even if config is not specified', async () => {
        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('...{},');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load plugins if specified', async () => {
        hexo.config.reveal = {
          plugins: ['RevealMarkdown', 'RevealHighlight', 'RevealNotes'],
        };

        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain(
            'plugins: [RevealMarkdown, RevealHighlight, RevealNotes]',
          );
          expect(data).toContain(
            `<script src="/reveal.js/plugin/notes/notes.js?v=${version}"></script>`,
          );
          expect(data).toContain(
            `<script src="/reveal.js/plugin/markdown/markdown.js?v=${version}"></script>`,
          );
          expect(data).toContain(
            `<script src="/reveal.js/plugin/highlight/highlight.js?v=${version}"></script>`,
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load only markdown plugin if not specified', async () => {
        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('plugins: [RevealMarkdown]');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load external plugin if specified', async () => {
        hexo.config.reveal = {
          plugins: [{ name: 'FooPlugin', url: 'https://example.com/foo.js' }],
        };

        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain(
            '<script src="https://example.com/foo.js"></script>',
          );
          expect(data).toContain('plugins: [RevealMarkdown, FooPlugin]');
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load external css if specified', async () => {
        hexo.config.reveal = {
          css_urls: ['https://example.com/foo.css'],
        };

        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain(
            '<link rel="stylesheet" href="https://example.com/foo.css">',
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should load external js if specified', async () => {
        hexo.config.reveal = {
          js_urls: ['https://example.com/foo.js'],
        };

        file.read = jest.fn().mockResolvedValue(markdown);
        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain(
            '<script src="https://example.com/foo.js"></script>',
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should not process anything other than md files', async () => {
        const file = {
          type: 'create',
          source: '/foo.png',
          params: { name: 'foo', ext: 'png' },
        } as Hexo.Box.File;
        file.read = jest.fn().mockResolvedValue('BINARY FILE');

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).not.toHaveBeenCalled();
        expect(fs.copyFile).toHaveBeenCalledWith(
          '/foo.png',
          '/test/public/slide/foo.png',
        );
      });

      it('should throw an error if unknown plugin name is specified', async () => {
        hexo.config.reveal = {
          plugins: ['Foo'],
        };

        file.read = jest.fn().mockResolvedValue(markdown);

        await expect(revealProcessorCallback.bind(hexo)(file)).rejects.toThrow(
          'Invalid plugin name: Foo',
        );
      });

      it('should be configured with front-matter preferentially', async () => {
        file.read = jest.fn().mockResolvedValue(frontMatter + markdown);

        hexo.config.reveal = {
          default: { title: 'Hoge Title', theme: 'fugaTheme' },
        };

        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('<title>Foo Title</title>');
          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/dist/theme/barTheme.css?v=${version}">`,
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });

      it('should be configured with default config', async () => {
        file.read = jest.fn().mockResolvedValue(markdown);

        hexo.config.reveal = {
          default: { title: 'Hoge Title', theme: 'fugaTheme' },
        };

        fs.writeFile = jest.fn().mockImplementation(async (file, data) => {
          expect(data).toContain('<title>Hoge Title</title>');
          expect(data).toContain(
            `<link rel="stylesheet" href="/reveal.js/dist/theme/fugaTheme.css?v=${version}">`,
          );
        });

        await revealProcessorCallback.bind(hexo)(file);

        expect(fs.writeFile).toHaveBeenCalled();
      });
    });
  });
});
