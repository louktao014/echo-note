import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiService } from './gemini.service';
import { SpeechService } from './speech.service';
import { SupabaseModule } from './supabse/supabase.module';
import { TranscriptService } from './transcript.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, GeminiService, SpeechService, TranscriptService],
})
export class AppModule {}
