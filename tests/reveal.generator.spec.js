"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('fs', () => ({
    createReadStream: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
    realpathSync: jest.fn().mockReturnValue('/test'),
}));
jest.mock('glob', () => ({
    globSync: jest.fn(),
}));
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const reveal_generator_1 = require("../src/reveal.generator");
describe('reveal.generator', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should generate glob of specified file', () => {
        glob_1.default.globSync = jest.fn().mockReturnValue(['/test/foo', '/test/bar/baz']);
        const result = (0, reveal_generator_1.revealGeneratorCallback)();
        result.map((item) => item.data());
        expect(fs_1.default.realpathSync).toHaveBeenCalled();
        expect(fs_1.default.createReadStream).toHaveBeenCalledWith('/test/foo');
        expect(fs_1.default.createReadStream).toHaveBeenCalledWith('/test/bar/baz');
    });
});
