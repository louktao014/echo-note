export declare class AppService {
    private readonly logger;
    getHealth(): {
        status: string;
        message: string;
        timestamp: Date;
    };
    processAudio(file: Express.Multer.File): Promise<string[]>;
    private getAudioDuration;
    private splitAudio;
    convertMovToMp3(inputPath: string): Promise<string>;
    private hasAudioStream;
    _convertMovToMp3(inputPath: string): Promise<string>;
}
