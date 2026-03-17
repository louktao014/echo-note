"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
let AppService = AppService_1 = class AppService {
    logger = new common_1.Logger(AppService_1.name);
    getHealth() {
        return {
            status: 'ok',
            message: 'Server is running',
            timestamp: new Date(),
        };
    }
    async processAudio(file) {
        this.logger.log(`Processing audio file: ${file.originalname}`);
        const inputPath = file.path;
        const outputDir = path.join(path.dirname(inputPath), 'processed');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        try {
            const duration = await this.getAudioDuration(inputPath);
            this.logger.log(`Audio duration: ${duration} seconds`);
            if (duration <= 600) {
                this.logger.log('Audio is 10 minutes or less, no splitting needed.');
                const outputPath = path.join(outputDir, file.originalname);
                fs.renameSync(inputPath, outputPath);
                console.log('outputPath', [outputPath]);
                return [''];
            }
            else {
                this.logger.log('Audio is longer than 10 minutes, splitting into chunks.');
                const splt = await this.splitAudio(inputPath, duration, outputDir, file.originalname);
                console.log('splt', splt);
                return splt;
            }
        }
        catch (error) {
            this.logger.error('Error processing audio', error.stack);
            fs.unlinkSync(inputPath);
            throw new Error('Failed to process audio file.');
        }
    }
    getAudioDuration(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err || typeof metadata?.format?.duration === 'undefined') {
                    return reject(err || new Error('Could not determine audio duration.'));
                }
                resolve(metadata.format.duration);
            });
        });
    }
    async splitAudio(inputPath, duration, outputDir, originalName) {
        const segmentDuration = 600;
        const numSegments = Math.ceil(duration / segmentDuration);
        const outputPaths = [];
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        for (let i = 0; i < numSegments; i++) {
            const startTime = i * segmentDuration;
            const outputPath = path.join(outputDir, `${baseName}_part${i + 1}${ext}`);
            outputPaths.push(outputPath);
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .setStartTime(startTime)
                    .setDuration(segmentDuration)
                    .output(outputPath)
                    .on('end', () => {
                    this.logger.log(`Created segment: ${outputPath}`);
                    resolve();
                })
                    .on('error', (err) => {
                    this.logger.error(`Error creating segment ${i + 1}`, err.message);
                    reject(err);
                })
                    .run();
            });
        }
        fs.unlinkSync(inputPath);
        return outputPaths;
    }
    async convertMovToMp3(inputPath) {
        const absoluteInput = path.resolve(inputPath);
        const canConvert = await this.hasAudioStream(absoluteInput);
        if (!canConvert) {
            throw new common_1.BadRequestException('ไม่สามารถแปลงไฟล์ได้เนื่องจากวิดีโอนี้ไม่มีเสียง');
        }
        return new Promise((resolve, reject) => {
            const fileBasename = path.basename(absoluteInput, path.extname(absoluteInput));
            const sanitizedBasename = fileBasename.replace(/[^a-zA-Z0-9_-]/g, '_');
            const outputDir = path.resolve(path.dirname(absoluteInput), 'processed');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            const outputPath = path.resolve(outputDir, `${sanitizedBasename}.mp3`);
            this.logger.log('inputPath', absoluteInput);
            this.logger.log('outputDir', outputDir);
            this.logger.log('outputPath', outputPath);
            ffmpeg(absoluteInput)
                .inputFormat('mov')
                .outputFormat('mp3')
                .on('start', () => {
                console.log('Processing....');
            })
                .on('end', () => {
                console.log('Processing finished !');
                resolve(outputPath);
            })
                .on('error', (err) => {
                console.log('An error occurred: ' + err.message);
                reject(new common_1.InternalServerErrorException({
                    statusCode: 500,
                    message: 'การประมวลผลไฟล์เสียงล้มเหลวกลางคัน',
                    error: 'FFmpeg Process Error',
                    detail: err.message.includes('code 234')
                        ? 'กระบวนการถูกขัดจังหวะ (อาจเกิดจากพื้นที่เต็มหรือไฟล์เสียหาย)'
                        : err.message,
                }));
            })
                .save(outputPath);
        });
    }
    async hasAudioStream(inputPath) {
        return new Promise((resolve) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err)
                    return resolve(false);
                const hasAudio = metadata.streams.some((s) => s.codec_type === 'audio');
                resolve(hasAudio);
            });
        });
    }
    async _convertMovToMp3(inputPath) {
        const absoluteInput = path.resolve(inputPath);
        const hasAudio = await this.hasAudioStream(absoluteInput);
        if (!hasAudio) {
            throw new common_1.BadRequestException('ไม่สามารถแปลงไฟล์ได้เนื่องจากวิดีโอนี้ไม่มีเสียง');
        }
        const fileBasename = path.basename(absoluteInput, path.extname(absoluteInput));
        const sanitizedBasename = fileBasename.replace(/[^a-zA-Z0-9_-]/g, '_');
        const outputDir = path.resolve(path.dirname(absoluteInput), 'video');
        const outputPath = path.resolve(outputDir, `${sanitizedBasename}.mp3`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            ffmpeg(absoluteInput)
                .noVideo()
                .audioCodec('libmp3lame')
                .audioQuality(2)
                .on('start', () => {
                this.logger.log('Processing....');
            })
                .on('error', (err, stdout, stderr) => {
                this.logger.error(`FFmpeg Process Error: ${err.message}`);
                this.logger.error(`FFmpeg STDERR: ${stderr}`);
                reject(new common_1.InternalServerErrorException({
                    message: 'การแปลงไฟล์ล้มเหลวระหว่างดำเนินการ',
                    detail: err.message,
                    timestamp: new Date().toISOString(),
                }));
                fs.unlinkSync(inputPath);
            })
                .on('end', () => {
                resolve(outputPath);
                fs.unlinkSync(inputPath);
            })
                .save(outputPath);
        });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map