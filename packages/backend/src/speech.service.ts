import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import { AppController } from './app.controller';
import { MOCK_RES_ELEVEN_LABS } from './mock-data';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(AppController.name);
  async transcribe(file: Express.Multer.File) {
    try {
      const formData = new FormData();

      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await this.transcribeWithElevenLabs(formData, false);

      const result = {
        transcript: response?.data?.text,
      };
      return result;
    } catch (err) {
      console.error(err.response?.data || err.message);
      throw new InternalServerErrorException('Speech to text failed');
    }
  }

  async transcribeWithElevenLabs(
    formData: FormData,
    isTest: boolean = true,
  ): Promise<AxiosResponse<{ text: string }>> {
    this.logger.log('Process...');
    let response: AxiosResponse<{ text: string }>;
    if (isTest) {
      response = {
        data: MOCK_RES_ELEVEN_LABS,
      } as AxiosResponse<{ text: string }>;
    } else {
      // model ที่ ElevenLabs แนะนำ
      formData.append('model_id', 'scribe_v1');
      response = await axios.post<{ text: string }>(
        'https://api.elevenlabs.io/v1/speech-to-text',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
        },
      );
    }
    this.logger.log('... Done ...');
    return response;
  }
}
