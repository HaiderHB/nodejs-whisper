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
exports.whisperShell = whisperShell;
exports.executeCppCommand = executeCppCommand;
const shelljs_1 = __importDefault(require("shelljs"));
const constants_1 = require("./constants");
shelljs_1.default.config.execPath = shelljs_1.default.which('node').stdout;
const projectDir = process.cwd();
const defaultShellOptions = {
    silent: false,
    async: true,
};
function handleError(error, logger = console) {
    logger.error('[Nodejs-whisper] Error:', error.message);
    shelljs_1.default.cd(projectDir);
    throw error;
}
function whisperShell(command_1) {
    return __awaiter(this, arguments, void 0, function* (command, options = defaultShellOptions, logger = console) {
        return new Promise((resolve, reject) => {
            shelljs_1.default.exec(command, options, (code, stdout, stderr) => {
                logger.debug('code---', code);
                logger.debug('stdout---', stdout);
                logger.debug('stderr---', stderr);
                if (code === 0) {
                    if (stdout.includes('error:')) {
                        reject(new Error('Error in whisper.cpp:\n' + stdout));
                        return;
                    }
                    logger.debug('[Nodejs-whisper] Transcribing Done!');
                    resolve(stdout);
                }
                else {
                    reject(new Error(stderr));
                }
            });
        }).catch((error) => {
            handleError(error);
            return Promise.reject(error);
        });
    });
}
function executeCppCommand(command_1) {
    return __awaiter(this, arguments, void 0, function* (command, logger = console, withCuda) {
        try {
            shelljs_1.default.cd(constants_1.WHISPER_CPP_PATH);
            if (!shelljs_1.default.which(constants_1.WHISPER_CPP_MAIN_PATH.replace(/\\/g, '/'))) {
                logger.debug('[Nodejs-whisper] whisper.cpp not initialized.');
                const makeCommand = withCuda ? 'WHISPER_CUDA=1 make -j' : 'make -j';
                shelljs_1.default.exec(makeCommand);
                if (!shelljs_1.default.which(constants_1.WHISPER_CPP_MAIN_PATH.replace(/\\/g, '/'))) {
                    throw new Error("[Nodejs-whisper] 'make' command failed. Please run 'make' command in /whisper.cpp directory.");
                }
                logger.log("[Nodejs-whisper] 'make' command successful.");
            }
            return yield whisperShell(command, defaultShellOptions, logger);
        }
        catch (error) {
            handleError(error);
        }
    });
}
//# sourceMappingURL=whisper.js.map