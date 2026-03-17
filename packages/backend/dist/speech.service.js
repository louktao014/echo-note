"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const app_controller_1 = require("./app.controller");
const mock_data_1 = require("./mock-data");
let SpeechService = class SpeechService {
    logger = new common_1.Logger(app_controller_1.AppController.name);
    async transcribe(file) {
        try {
            const formData = new form_data_1.default();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
            const response = await this.transcribeWithElevenLabs(formData, false);
            const result = {
                transcript: response?.data?.text,
            };
            return result;
        }
        catch (err) {
            console.error(err.response?.data || err.message);
            throw new common_1.InternalServerErrorException('Speech to text failed');
        }
    }
    async transcribeWithElevenLabs(formData, isTest = true) {
        this.logger.log('Process...');
        let response;
        if (isTest) {
            response = {
                data: mock_data_1.MOCK_RES_ELEVEN_LABS,
            };
        }
        else {
            formData.append('model_id', 'scribe_v1');
            response = await axios_1.default.post('https://api.elevenlabs.io/v1/speech-to-text', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                },
            });
        }
        this.logger.log('... Done ...');
        return response;
    }
};
exports.SpeechService = SpeechService;
exports.SpeechService = SpeechService = __decorate([
    (0, common_1.Injectable)()
], SpeechService);
//# sourceMappingURL=speech.service.js.map