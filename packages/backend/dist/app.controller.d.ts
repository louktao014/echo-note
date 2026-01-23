import { AppService } from './app.service';
import { SpeechService } from './speech.service';
import { GeminiService } from './gemini.service';
export declare class AppController {
    private readonly appService;
    private speechService;
    private geminiService;
    private readonly logger;
    constructor(appService: AppService, speechService: SpeechService, geminiService: GeminiService);
    getHello(): string;
    health(): {
        status: string;
        message: string;
        timestamp: Date;
    };
    speechToText(file: Express.Multer.File): Promise<{
        transcript: string;
    }>;
    generateMom(body: {
        chunks: string[];
    }): Promise<{
        mom: string;
    }>;
    uploadAudio(file: Express.Multer.File): Promise<{
        message: string;
        originalFile: string;
        processedFiles: string[];
    }>;
}
