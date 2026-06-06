import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiAgentService } from './ai-agent.service';
import { SpeechService } from './speech.service';
import { SupabaseModule } from './supabse/supabase.module';
import { TranscriptService } from './transcript.service';
import { HttpModule } from '@nestjs/axios/dist/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
    SupabaseModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, AiAgentService, SpeechService, TranscriptService],
})
export class AppModule {}
