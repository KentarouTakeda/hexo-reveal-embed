"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('fs/promises', () => ({
    rm: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
}));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const hexo_1 = __importDefault(require("hexo"));
const reveal_processor_1 = require("../src/reveal.processor");
describe('reveal.processor', () => {
    let hexo;
    beforeEach(() => {
        hexo = new hexo_1.default('/test');
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('revealProcessorCallback', () => {
        describe('skip', () => {
            it('should do nothing', async () => {
                const file = {
                    type: 'skip',
                    params: { '1': 'foo' },
                };
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
            });
        });
        describe('delete', () => {
            it('should delete a file', async () => {
                const file = {
                    type: 'delete',
                    params: { '1': 'foo' },
                };
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
                expect(promises_1.default.rm).toHaveBeenCalledWith('/' + (0, path_1.join)('test', 'public', 'slide', 'foo.html'));
            });
        });
        describe('create / update', () => {
            it('should create the html containing markdown and config', async () => {
                const file = {
                    type: 'create',
                    params: { '1': 'path/to/slide' },
                };
                hexo.config.reveal = {
                    config: {
                        foo: 'bar',
                        baz: [42, 23],
                    },
                };
                file.read = jest.fn().mockResolvedValue('# This is a slide');
                promises_1.default.writeFile = jest.fn().mockImplementation(async (file, data) => {
                    expect(file).toEqual('/test/public/slide/path/to/slide.html');
                    expect(data).toContain('# This is a slide');
                    expect(data).toContain('...{"foo":"bar","baz":[42,23]},');
                });
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
                expect(file.read).toHaveBeenCalled();
                expect(promises_1.default.mkdir).toHaveBeenCalledWith('/test/public/slide/path/to', {
                    recursive: true,
                });
                expect(promises_1.default.writeFile).toHaveBeenCalled();
            });
            it('should create html even if config is not specified', async () => {
                const file = {
                    type: 'create',
                    params: { '1': 'path/to/slide' },
                };
                file.read = jest.fn().mockResolvedValue('# This is a slide');
                promises_1.default.writeFile = jest.fn().mockImplementation(async (file, data) => {
                    expect(data).toContain('...{},');
                });
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
                expect(promises_1.default.writeFile).toHaveBeenCalled();
            });
            it('should load plugins if specified', async () => {
                const file = {
                    type: 'create',
                    params: { '1': 'path/to/slide' },
                };
                hexo.config.reveal = {
                    plugins: ['RevealMarkdown', 'RevealHighlight', 'RevealNotes'],
                };
                file.read = jest.fn().mockResolvedValue('# This is a slide');
                promises_1.default.writeFile = jest.fn().mockImplementation(async (file, data) => {
                    expect(data).toContain('plugins: [RevealMarkdown, RevealHighlight, RevealNotes]');
                    expect(data).toContain('<script src="/reveal.js/plugin/notes/notes.js"></script>');
                    expect(data).toContain('<script src="/reveal.js/plugin/markdown/markdown.js"></script>');
                    expect(data).toContain('<script src="/reveal.js/plugin/highlight/highlight.js"></script>');
                });
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
                expect(promises_1.default.writeFile).toHaveBeenCalled();
            });
            it('should load only markdown plugin if not specified', async () => {
                const file = {
                    type: 'create',
                    params: { '1': 'path/to/slide' },
                };
                file.read = jest.fn().mockResolvedValue('# This is a slide');
                promises_1.default.writeFile = jest.fn().mockImplementation(async (file, data) => {
                    expect(data).toContain('plugins: [RevealMarkdown]');
                });
                await reveal_processor_1.revealProcessorCallback.bind(hexo)(file);
                expect(promises_1.default.writeFile).toHaveBeenCalled();
            });
            it('should throw an error if unknown plugin name is specified', async () => {
                const file = {
                    type: 'create',
                    params: { '1': 'path/to/slide' },
                };
                hexo.config.reveal = {
                    plugins: ['Foo'],
                };
                file.read = jest.fn().mockResolvedValue('# This is a slide');
                await expect(reveal_processor_1.revealProcessorCallback.bind(hexo)(file)).rejects.toThrow('Invalid plugin name: Foo');
            });
        });
    });
});
