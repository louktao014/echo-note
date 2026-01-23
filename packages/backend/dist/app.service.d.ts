export declare class AppService {
    private readonly logger;
    getHello(): string;
    getHealth(): {
        status: string;
        message: string;
        timestamp: Date;
    };
    processAudio(file: Express.Multer.File): Promise<string[]>;
    private getAudioDuration;
    private splitAudio;
}
