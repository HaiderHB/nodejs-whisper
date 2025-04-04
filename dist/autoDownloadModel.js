"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = autoDownloadModel;
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("./constants");
shelljs_1.default.config.execPath = shelljs_1.default.which('node').stdout;
function autoDownloadModel() {
    return __awaiter(this, arguments, void 0, function* (logger = console, autoDownloadModelName, withCuda = false) {
        const projectDir = process.cwd();
        if (!autoDownloadModelName) {
            throw new Error('[Nodejs-whisper] Error: Model name must be provided.');
        }
        if (!constants_1.MODELS_LIST.includes(autoDownloadModelName)) {
            throw new Error('[Nodejs-whisper] Error: Provide a valid model name');
        }
        try {
            const modelDirectory = path_1.default.join(constants_1.WHISPER_CPP_PATH, 'models');
            shelljs_1.default.cd(modelDirectory);
            const modelAlreadyExist = fs_1.default.existsSync(path_1.default.join(modelDirectory, constants_1.MODEL_OBJECT[autoDownloadModelName]));
            if (modelAlreadyExist) {
                logger.debug(`[Nodejs-whisper] ${autoDownloadModelName} already exist. Skipping download.`);
                return 'Models already exist. Skipping download.';
            }
            logger.debug(`[Nodejs-whisper] Auto-download Model: ${autoDownloadModelName}`);
            let scriptPath = './download-ggml-model.sh';
            if (process.platform === 'win32') {
                scriptPath = 'download-ggml-model.cmd';
            }
            shelljs_1.default.chmod('+x', scriptPath);
            const result = shelljs_1.default.exec(`${scriptPath} ${autoDownloadModelName}`);
            if (result.code !== 0) {
                throw new Error(`[Nodejs-whisper] Failed to download model: ${result.stderr}`);
            }
            logger.debug('[Nodejs-whisper] Attempting to compile model...');
            shelljs_1.default.cd('../');
            let compileCommand;
            if (process.platform === 'win32') {
                // Try mingw32-make first
                if (shelljs_1.default.which('mingw32-make')) {
                    compileCommand = withCuda ? 'WHISPER_CUDA=1 mingw32-make -j' : 'mingw32-make -j';
                }
                else if (shelljs_1.default.which('make')) {
                    compileCommand = withCuda ? 'WHISPER_CUDA=1 make -j' : 'make -j';
                }
                else {
                    throw new Error('[Nodejs-whisper] Neither mingw32-make nor make found. Please install MinGW-w64 or MSYS2.');
                }
            }
            else {
                compileCommand = withCuda ? 'WHISPER_CUDA=1 make -j' : 'make -j';
            }
            const compileResult = shelljs_1.default.exec(compileCommand);
            if (compileResult.code !== 0) {
                throw new Error(`[Nodejs-whisper] Failed to compile model: ${compileResult.stderr}`);
            }
            return 'Model downloaded and compiled successfully';
        }
        catch (error) {
            logger.error('[Nodejs-whisper] Error caught in autoDownloadModel:', error);
            shelljs_1.default.cd(projectDir);
            throw error;
        }
    });
}
//# sourceMappingURL=autoDownloadModel.js.map