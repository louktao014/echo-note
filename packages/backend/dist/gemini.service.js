"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const mock_data_1 = require("./mock-data");
let GeminiService = GeminiService_1 = class GeminiService {
    logger = new common_1.Logger(GeminiService_1.name);
    genAI;
    generationConfig = {
        temperature: 0.2,
        topP: 0.1,
        maxOutputTokens: 4096,
    };
    safetySettings = [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
    ];
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async summarizeMeeting(transcript) {
        this.logger.log('Summarizing meeting transcript with Gemini');
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
            });
            const prompt = `
        คุณคือผู้ช่วยสรุปรายงานการประชุม (Minutes of Meeting)

        กรุณาสรุปเนื้อหาจากบทถอดเสียงด้านล่าง
        โดยจัดรูปแบบดังนี้:

        1. สรุปเนื้อหาสำคัญ
        2. มติที่ประชุม
        3. สิ่งที่ต้องดำเนินการต่อ (Action Items)
        - งาน | ผู้รับผิดชอบ | Deadline
        4. ประเด็นอื่น ๆ

        หมายเหตุ:
        - หากช่วงใดของบทสนทนาไม่ชัดเจน ให้ระบุว่า [เสียงไม่ชัดเจน]
        - ใช้ภาษาไทยทางการ กระชับ และชัดเจน

        บทถอดเสียง:
        """
        ${transcript}
        """
      `;
            return mock_data_1.MOCK_RES_GERMINI;
            const result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: this.generationConfig,
                safetySettings: this.safetySettings,
            });
            this.logger.log('result', result.response.text());
            return { mom: result.response.text() };
        }
        catch (error) {
            this.logger.error('Gemini summarize error', error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }
    async summarizeText(text) {
        this.logger.log('Summarizing text with Gemini');
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
            });
            const result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `สรุปข้อความต่อไปนี้แบบกระชับ:\n\n${text}` }],
                    },
                ],
                generationConfig: this.generationConfig,
            });
            return result.response.text().trim();
        }
        catch (error) {
            this.logger.error('Gemini summarizeText error', error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map