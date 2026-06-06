import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
  Logger,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { SpeechService } from './speech.service';
import { AiAgentService } from './ai-agent.service';
import type {
  EnumAIAgent,
  EnumAIModel,
  ITranscript,
} from './model/transcript.model';
import { TranscriptService } from './transcript.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private speechService: SpeechService,
    private aiAgentService: AiAgentService,
    private transcriptService: TranscriptService,
  ) {}

  @Get('health')
  health() {
    this.logger.log('health');
    return this.appService.getHealth();
  }

  @Post('speech-to-text')
  @UseInterceptors(FileInterceptor('file'))
  async speechToText(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('speech-to-text');
    return this.speechService.transcribe(file);
  }

  @Post('generate-mom')
  async generateMom(
    @Body()
    body: {
      chunks: string[];
      selectedAI: { agent: EnumAIAgent; model: EnumAIModel };
    },
  ) {
    this.logger.log('generate-mom');
    const transcript = body.chunks.join('');
    const selectedAI = body.selectedAI;
    const result = await this.aiAgentService.summarizeMeeting(
      transcript,
      selectedAI,
    );
    return result;
  }

  @Post('save-transcript')
  async saveTranscript(@Body() body: ITranscript) {
    this.logger.log('save-transcript');
    const transcript = body;
    const result = this.transcriptService.saveTranscript(transcript);
    return result;
  }

  @Get('get-transcript')
  async getHistory() {
    this.logger.log('get-transcript');
    return this.transcriptService.getTranscripts();
  }

  @Delete('delete-transcript/:id')
  async deleteTranscript(@Param('id') id: string) {
    this.logger.log('delete-transcript');
    return this.transcriptService.deleteTranscript(id);
  }

  /**
   * Upload Audio File for Split video 10 sec and transcribe.
   */
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
        error,
      );
      throw new InternalServerErrorException('Audio processing failed.');
    }
  }

  @Post('convert-to-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = path
            .parse(file.originalname)
            .name.replace(/\s/g, '_');
          const extension = path.parse(file.originalname).ext;
          const newFileName = filename.replace(/\./g, '_');
          cb(null, `${newFileName}_${extension}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('file', file);
    const outputPath = await this.appService._convertMovToMp3(file.path);
    return {
      message: 'Converted successfully',
      output: outputPath,
    };
  }
}
