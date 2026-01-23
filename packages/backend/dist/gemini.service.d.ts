export declare class GeminiService {
    private readonly logger;
    private genAI;
    private readonly generationConfig;
    private readonly safetySettings;
    constructor();
    summarizeMeeting(transcript: string): Promise<{
        mom: string;
    }>;
    summarizeText(text: string): Promise<string>;
}
