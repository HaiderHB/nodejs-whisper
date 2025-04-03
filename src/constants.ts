import path from 'path'
import * as fs from 'fs'

export const MODELS_LIST = [
	'tiny',
	'tiny.en',
	'base',
	'base.en',
	'small',
	'small.en',
	'medium',
	'medium.en',
	'large-v1',
	'large',
	'large-v3-turbo',
]

export const MODELS = [
	'ggml-tiny.en.bin',
	'ggml-tiny.bin',
	'ggml-base.en.bin',
	'ggml-base.bin',
	'ggml-small.en.bin',
	'ggml-small.bin',
	'ggml-medium.en.bin',
	'ggml-medium.bin',
	'ggml-large-v1.bin',
	'ggml-large.bin',
	'ggml-large-v3-turbo.bin',
]

export const MODEL_OBJECT = {
	tiny: 'ggml-tiny.bin',
	'tiny.en': 'ggml-tiny.en.bin',
	base: 'ggml-base.bin',
	'base.en': 'ggml-base.en.bin',
	small: 'ggml-small.bin',
	'small.en': 'ggml-small.en.bin',
	medium: 'ggml-medium.bin',
	'medium.en': 'ggml-medium.en.bin',
	'large-v1': 'ggml-large-v1.bin',
	large: 'ggml-large.bin',
	'large-v3-turbo': 'ggml-large-v3-turbo.bin',
}

export const DEFAULT_MODEL = 'tiny.en'

export const WHISPER_CPP_PATH = (() => {
	// First try using the standard path
	const standardPath = path.join(__dirname, '..', 'cpp', 'whisper.cpp');
	if (fs.existsSync(standardPath)) {
		return standardPath;
	}

	// If that fails, try to find the package within node_modules
	// This is particularly useful for Electron apps bundled with webpack
	const modulePath = path.join(process.cwd(), 'node_modules', 'nodejs-whisper', 'cpp', 'whisper.cpp');
	if (fs.existsSync(modulePath)) {
		return modulePath;
	}

	// If running from within node_modules directory
	const currentDir = process.cwd();
	if (currentDir.includes('node_modules/nodejs-whisper')) {
		return path.join(currentDir, 'cpp', 'whisper.cpp');
	}

	// Fallback to the standard path even if it might not exist
	console.warn('Warning: Could not determine nodejs-whisper package location.');
	return standardPath;
})();
export const WHISPER_CPP_MAIN_PATH =
	process.platform === 'win32' ? 'build\\bin\\whisper-cli.exe' : './build/bin/whisper-cli'