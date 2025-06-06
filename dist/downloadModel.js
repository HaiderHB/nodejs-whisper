#! /usr/bin/env node
"use strict";
// npx nodejs-whisper download
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
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const constants_1 = require("./constants");
const fs_1 = __importDefault(require("fs"));
shelljs_1.default.config.execPath = shelljs_1.default.which('node').stdout;
const askForModel = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (logger = console) {
    const answer = yield readline_sync_1.default.question(`\n[Nodejs-whisper] Enter model name (e.g. 'tiny.en') or 'cancel' to exit\n(ENTER for tiny.en): `);
    if (answer === 'cancel') {
        logger.log('[Nodejs-whisper] Exiting model downloader.\n');
        process.exit(0);
    }
    // User presses enter
    else if (answer === '') {
        logger.log('[Nodejs-whisper] Going with', constants_1.DEFAULT_MODEL);
        return constants_1.DEFAULT_MODEL;
    }
    else if (!constants_1.MODELS_LIST.includes(answer)) {
        logger.log('\n[Nodejs-whisper] FAIL: Name not found. Check your spelling OR quit wizard and use custom model.\n');
        return yield askForModel();
    }
    return answer;
});
const askIfUserWantToUseCuda = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (logger = console) {
    const answer = yield readline_sync_1.default.question(`\n[Nodejs-whisper] Do you want to use CUDA for compilation? (y/n)\n(ENTER for n): `);
    if (answer === 'y') {
        logger.log('[Nodejs-whisper] Using CUDA for compilation.');
        return true;
    }
    else {
        logger.log('[Nodejs-whisper] Not using CUDA for compilation.');
        return false;
    }
});
function downloadModel() {
    return __awaiter(this, arguments, void 0, function* (logger = console) {
        try {
            shelljs_1.default.cd(path_1.default.join(constants_1.WHISPER_CPP_PATH, 'models'));
            let anyModelExist = [];
            constants_1.MODELS_LIST.forEach(model => {
                if (!fs_1.default.existsSync(path_1.default.join(constants_1.WHISPER_CPP_PATH, 'models', constants_1.MODEL_OBJECT[model]))) {
                }
                else {
                    anyModelExist.push(model);
                }
            });
            if (anyModelExist.length > 0) {
                console.log('\n[Nodejs-whisper] Currently installed models:');
                anyModelExist.forEach(model => console.log(`- ${model}`));
                console.log('\n[Nodejs-whisper] You can install additional models from the list below.\n');
            }
            logger.log(`
| Model          | Disk   | RAM     |
|----------------|--------|---------|
| tiny           |  75 MB | ~390 MB |
| tiny.en        |  75 MB | ~390 MB |
| base           | 142 MB | ~500 MB |
| base.en        | 142 MB | ~500 MB |
| small          | 466 MB | ~1.0 GB |
| small.en       | 466 MB | ~1.0 GB |
| medium         | 1.5 GB | ~2.6 GB |
| medium.en      | 1.5 GB | ~2.6 GB |
| large-v1       | 2.9 GB | ~4.7 GB |
| large          | 2.9 GB | ~4.7 GB |
| large-v3-turbo | 1.5 GB | ~2.6 GB |
`);
            if (!shelljs_1.default.which('./download-ggml-model.sh')) {
                throw '[Nodejs-whisper] Error: Downloader not found.\n';
            }
            const modelName = yield askForModel();
            let scriptPath = './download-ggml-model.sh';
            if (process.platform === 'win32')
                scriptPath = 'download-ggml-model.cmd';
            shelljs_1.default.chmod('+x', scriptPath);
            shelljs_1.default.exec(`${scriptPath} ${modelName}`);
            logger.log('[Nodejs-whisper] Attempting to compile model...\n');
            shelljs_1.default.cd('../');
            const withCuda = yield askIfUserWantToUseCuda();
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
            shelljs_1.default.exec(compileCommand);
            process.exit(0);
        }
        catch (error) {
            logger.error('[Nodejs-whisper] Error Caught in downloadModel\n');
            logger.error(error);
            return error;
        }
    });
}
// run on npx nodejs-whisper download
downloadModel().catch(error => {
    console.error('Failed to download:', error);
    process.exit(1);
});
//# sourceMappingURL=downloadModel.js.map