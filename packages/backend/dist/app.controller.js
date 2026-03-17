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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const speech_service_1 = require("./speech.service");
const gemini_service_1 = require("./gemini.service");
const transcript_service_1 = require("./transcript.service");
let AppController = AppController_1 = class AppController {
    appService;
    speechService;
    geminiService;
    transcriptService;
    logger = new common_1.Logger(AppController_1.name);
    constructor(appService, speechService, geminiService, transcriptService) {
        this.appService = appService;
        this.speechService = speechService;
        this.geminiService = geminiService;
        this.transcriptService = transcriptService;
    }
    health() {
        this.logger.log('health');
        return this.appService.getHealth();
    }
    async speechToText(file) {
        this.logger.log('speech-to-text');
        return this.speechService.transcribe(file);
    }
    async generateMom(body) {
        this.logger.log('generate-mom');
        const transcript = body.chunks.join('');
        const result = await this.geminiService.summarizeMeeting(transcript);
        return result;
    }
    async saveTranscript(body) {
        this.logger.log('save-transcript');
        const transcript = body;
        const result = this.transcriptService.saveTranscript(transcript);
        return result;
    }
    async getHistory() {
        this.logger.log('get-transcript');
        return this.transcriptService.getTranscripts();
    }
    async deleteTranscript(id) {
        this.logger.log('delete-transcript');
        return this.transcriptService.deleteTranscript(id);
    }
    async uploadAudio(file) {
        this.logger.log(`Received file: ${file.originalname}, size: ${file.size} bytes`);
        if (!file) {
            throw new common_1.InternalServerErrorException('File upload failed');
        }
        try {
            const processedFiles = await this.appService.processAudio(file);
            this.logger.log('File processing completed successfully');
            return {
                message: 'File uploaded and processed successfully',
                originalFile: file.originalname,
                processedFiles,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process audio file: ${file.originalname}`, error.stack);
            throw new common_1.InternalServerErrorException('Audio processing failed.');
        }
    }
    async uploadFile(file) {
        this.logger.log('file', file);
        const outputPath = await this.appService._convertMovToMp3(file.path);
        return {
            message: 'Converted successfully',
            output: outputPath,
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('speech-to-text'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "speechToText", null);
__decorate([
    (0, common_1.Post)('generate-mom'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "generateMom", null);
__decorate([
    (0, common_1.Post)('save-transcript'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "saveTranscript", null);
__decorate([
    (0, common_1.Get)('get-transcript'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Delete)('delete-transcript/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "deleteTranscript", null);
__decorate([
    (0, common_1.Post)('upload-audio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const filename = path
                    .parse(file.originalname)
                    .name.replace(/\s/g, '_');
                const extension = path.parse(file.originalname).ext;
                cb(null, `${filename}_${Date.now()}${extension}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "uploadAudio", null);
__decorate([
    (0, common_1.Post)('convert-to-audio'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const filename = path
                    .parse(file.originalname)
                    .name.replace(/\s/g, '_');
                const extension = path.parse(file.originalname).ext;
                const newFileName = filename.replace(/\./g, '_');
                cb(null, `${newFileName}_${extension}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "uploadFile", null);
exports.AppController = AppController = AppController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        speech_service_1.SpeechService,
        gemini_service_1.GeminiService,
        transcript_service_1.TranscriptService])
], AppController);
//# sourceMappingURL=app.controller.js.map