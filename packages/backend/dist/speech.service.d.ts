import { AxiosResponse } from 'axios';
import FormData from 'form-data';
export declare class SpeechService {
    private readonly logger;
    transcribe(file: Express.Multer.File): Promise<{
        transcript: string;
    }>;
    transcribeWithElevenLabs(formData: FormData, isTest?: boolean): Promise<AxiosResponse<{
        text: string;
    }>>;
}
