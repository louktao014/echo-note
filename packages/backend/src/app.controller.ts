import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
  Logger,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { SpeechService } from './speech.service';
import { GeminiService } from './gemini.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private speechService: SpeechService,
    private geminiService: GeminiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return this.appService.getHealth();
  }

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('file'))
  async speechToText(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('speech-to-text');
    return this.speechService.transcribe(file);
  }

  @Post('generate-mom')
  async generateMom(@Body() body: { chunks: string[] }) {
    const transcript = body.chunks.join('');
    const result = await this.geminiService.summarizeMeeting(transcript);
    this.logger.log('result', result);
    return result;
  }

  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = path
            .parse(file.originalname)
            .name.replace(/\s/g, '_');
          const extension = path.parse(file.originalname).ext;
          cb(null, `${filename}_${Date.now()}${extension}`);
        },
      }),
    }),
  )
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(
      `Received file: ${file.originalname}, size: ${file.size} bytes`,
    );
    if (!file) {
      throw new InternalServerErrorException('File upload failed');
    }

    try {
      const processedFiles = await this.appService.processAudio(file);
      this.logger.log('File processing completed successfully');
      return {
        message: 'File uploaded and processed successfully',
        originalFile: file.originalname,
        processedFiles,
      };
    } catch (error) {
      this.logger.error(
        `Failed to process audio file: ${file.originalname}`,
        error.stack,
      );
      throw new InternalServerErrorException('Audio processing failed.');
    }
  }
}
