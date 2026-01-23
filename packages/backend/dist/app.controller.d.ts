import { AppService } from './app.service';
import { SpeechService } from './speech.service';
import { GeminiService } from './gemini.service';
import type { ITranscript } from './model/transcript.mode';
import { TranscriptService } from './transcript.service';
export declare class AppController {
    private readonly appService;
    private speechService;
    private geminiService;
    private transcriptService;
    private readonly logger;
    constructor(appService: AppService, speechService: SpeechService, geminiService: GeminiService, transcriptService: TranscriptService);
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
    saveTranscript(body: ITranscript): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    getHistory(): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<any[]>>;
    deleteTranscript(id: string): Promise<import("@supabase/postgrest-js").PostgrestSingleResponse<null>>;
    uploadAudio(file: Express.Multer.File): Promise<{
        message: string;
        originalFile: string;
        processedFiles: string[];
    }>;
}
