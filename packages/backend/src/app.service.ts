import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

  getHealth(): { status: string; message: string; timestamp: Date } {
    return {
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date(),
    };
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
        console.log('outputPath', [outputPath]);
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
        console.log('splt', splt);
        return splt;
      }
    } catch (error) {
      this.logger.error('Error processing audio', error.stack);
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
}
