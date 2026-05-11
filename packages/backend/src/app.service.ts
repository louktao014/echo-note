import { HttpService } from '@nestjs/axios/dist/http.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';

// Use require for CommonJS modules
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');

// Set the binary paths for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) {}

  async getHealth(): Promise<{
    backend_healthy: {
      status: string;
      message: string;
      timestamp: string;
    };
    supabase_healthy: {
      status: string;
      message: string;
      timestamp: string;
    };
  }> {
    try {
      const res = await this.checkSupabaseHealth();

      const supabaseHealthy =
        res?.status === 'healthy' || res?.name === 'GoTrue';

      return {
        backend_healthy: {
          status: 'healthy',
          message: 'Backend is healthy',
          timestamp: new Date().toISOString(),
        },

        supabase_healthy: {
          status: supabaseHealthy ? 'healthy' : 'unhealthy',
          message: supabaseHealthy
            ? 'Supabase is healthy'
            : 'Supabase is unhealthy',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      throw new InternalServerErrorException({
        message: 'Supabase health check failed',
        detail: err?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async checkSupabaseHealth() {
    const url = 'https://tlquyifvsxzeflfboimh.supabase.co/auth/v1/health';
    const headers = {
      apikey: `${process.env.SUPABASE_ANON_KEY}`,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers,
        }),
      );
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      throw error;
    }
  }

  async processAudio(file: Express.Multer.File): Promise<string[]> {
    this.logger.log(`Processing audio file: ${file.originalname}`);
    const inputPath = file.path;
    const outputDir = path.join(path.dirname(inputPath), 'processed');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      const duration = await this.getAudioDuration(inputPath);
      this.logger.log(`Audio duration: ${duration} seconds`);

      if (duration <= 600) {
        this.logger.log('Audio is 10 minutes or less, no splitting needed.');
        const outputPath = path.join(outputDir, file.originalname);
        fs.renameSync(inputPath, outputPath);
        this.logger.log('outputPath', [outputPath]);
        return [''];
      } else {
        this.logger.log(
          'Audio is longer than 10 minutes, splitting into chunks.',
        );
        const splt = await this.splitAudio(
          inputPath,
          duration,
          outputDir,
          file.originalname,
        );
        this.logger.log('splt', splt);
        return splt;
      }
    } catch (error) {
      this.logger.error('Error processing audio', error);
      fs.unlinkSync(inputPath);
      throw new Error('Failed to process audio file.');
    }
  }

  private getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
        if (err || typeof metadata?.format?.duration === 'undefined') {
          return reject(
            err || new Error('Could not determine audio duration.'),
          );
        }
        resolve(metadata.format.duration);
      });
    });
  }

  private async splitAudio(
    inputPath: string,
    duration: number,
    outputDir: string,
    originalName: string,
  ): Promise<string[]> {
    const segmentDuration = 600; // 10 minutes
    const numSegments = Math.ceil(duration / segmentDuration);
    const outputPaths: string[] = [];
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    for (let i = 0; i < numSegments; i++) {
      const startTime = i * segmentDuration;
      const outputPath = path.join(outputDir, `${baseName}_part${i + 1}${ext}`);
      outputPaths.push(outputPath);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(startTime)
          .setDuration(segmentDuration)
          .output(outputPath)
          .on('end', () => {
            this.logger.log(`Created segment: ${outputPath}`);
            resolve();
          })
          .on('error', (err: any) => {
            this.logger.error(`Error creating segment ${i + 1}`, err.message);
            reject(err);
          })
          .run();
      });
    }

    fs.unlinkSync(inputPath);

    return outputPaths;
  }

  async convertMovToMp3(inputPath: string): Promise<string> {
    const absoluteInput = path.resolve(inputPath);
    const canConvert = await this.hasAudioStream(absoluteInput);
    if (!canConvert) {
      throw new BadRequestException(
        'ไม่สามารถแปลงไฟล์ได้เนื่องจากวิดีโอนี้ไม่มีเสียง',
      );
    }
    return new Promise((resolve, reject) => {
      const fileBasename = path.basename(
        absoluteInput,
        path.extname(absoluteInput),
      );
      const sanitizedBasename = fileBasename.replace(/[^a-zA-Z0-9_-]/g, '_');

      const outputDir = path.resolve(path.dirname(absoluteInput), 'processed');

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.resolve(outputDir, `${sanitizedBasename}.mp3`);

      this.logger.log('inputPath', absoluteInput);
      this.logger.log('outputDir', outputDir);
      this.logger.log('outputPath', outputPath);

      ffmpeg(absoluteInput)
        // .noVideo()
        // .audioCodec('libmp3lame')
        // .audioQuality(2)
        .inputFormat('mov')
        .outputFormat('mp3')
        .on('start', () => {
          console.log('Processing....');
        })
        .on('end', () => {
          console.log('Processing finished !');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.log('An error occurred: ' + err.message);
          reject(
            new InternalServerErrorException({
              statusCode: 500,
              message: 'การประมวลผลไฟล์เสียงล้มเหลวกลางคัน',
              error: 'FFmpeg Process Error',
              detail: err.message.includes('code 234')
                ? 'กระบวนการถูกขัดจังหวะ (อาจเกิดจากพื้นที่เต็มหรือไฟล์เสียหาย)'
                : err.message,
            }),
          );
        })
        .save(outputPath);
    });
  }

  private async hasAudioStream(inputPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) return resolve(false);
        const hasAudio = metadata.streams.some((s) => s.codec_type === 'audio');
        resolve(hasAudio);
      });
    });
  }
  async _convertMovToMp3(inputPath: string): Promise<string> {
    const absoluteInput = path.resolve(inputPath);

    // เช็ค Audio เบื้องต้น (ตามที่เราคุยกันก่อนหน้า)
    const hasAudio = await this.hasAudioStream(absoluteInput);
    if (!hasAudio) {
      throw new BadRequestException(
        'ไม่สามารถแปลงไฟล์ได้เนื่องจากวิดีโอนี้ไม่มีเสียง',
      );
    }

    // เตรียม Paths
    const fileBasename = path.basename(
      absoluteInput,
      path.extname(absoluteInput),
    );
    const sanitizedBasename = fileBasename.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outputDir = path.resolve(path.dirname(absoluteInput), 'video');
    const outputPath = path.resolve(outputDir, `${sanitizedBasename}.mp3`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ffmpeg(absoluteInput)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioQuality(2)
        .on('start', () => {
          this.logger.log('Processing....');
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`FFmpeg Process Error: ${err.message}`);
          this.logger.error(`FFmpeg STDERR: ${stderr}`);
          reject(
            new InternalServerErrorException({
              message: 'การแปลงไฟล์ล้มเหลวระหว่างดำเนินการ',
              detail: err.message,
              timestamp: new Date().toISOString(),
            }),
          );
          fs.unlinkSync(inputPath);
        })
        .on('end', () => {
          resolve(outputPath);
          fs.unlinkSync(inputPath);
        })
        .save(outputPath);
    });
  }
}
