import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { _prompt, MOCK_RES_GERMINI } from './mock-data';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AI_MODEL, EnumAIAgent, EnumAIModel } from './model/transcript.mode';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  private readonly generationConfig = {
    temperature: 0.2,
    topP: 0.1,
    maxOutputTokens: 4096,
  };

  private readonly safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  constructor(private readonly httpService: HttpService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async summarizeMeeting(
    transcript: string,
    selectedAI: { agent: EnumAIAgent; model: EnumAIModel },
  ): Promise<{ mom: string }> {
    try {
      const isTest = false;
      const isUserThaiLLM = selectedAI.agent === EnumAIAgent.ThaiLLM;
      if (isTest) {
        return MOCK_RES_GERMINI;
      } else {
        this.logger.log(
          `Summarizing meeting transcript with >> { agent: ${selectedAI.agent} , model: ${selectedAI.model} }`,
        );
        if (isUserThaiLLM) {
          return this.thaiLLM(transcript, selectedAI.model);
        } else {
          return this.germini(transcript);
        }
      }
    } catch (error: any) {
      this.logger.error('Gemini summarize error', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  async thaiLLM(
    transcript: string,
    modelSelected: EnumAIModel = EnumAIModel.QWEN_3,
  ) {
    /**
     * @this New (OpenAI-compatible) — recommended
     * @constant {const url = 'http://thaillm.or.th/api/v1/chat/completions'}
     * @this Legacy (path-based) — still supported
     * @constant {const url_legacy = 'http://thaillm.or.th/api/openthaigpt/v1/chat/completions';}
     */
    const url = 'http://thaillm.or.th/api/v1/chat/completions';
    const model = AI_MODEL[modelSelected];
    console.info('\x1b[7;31;40m[DEBUGGER] ->> model\x1b[0m', model);
    // throw new Error(`Invalid model selected: ${modelSelected}`);
    if (!model) {
      throw new Error(`Invalid model selected: ${modelSelected}`);
    }
    const payload = {
      model: model,
      messages: [{ role: 'user', content: transcript }],
      max_tokens: 2048,
      temperature: 0.3,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer 5o8HZFNVCgibJBhdFyXIlg1OWIp5V7hw',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );
      return { mom: response.data.choices[0].message.content };
    } catch (error: any) {
      this.logger.error('AI ThaiLLM API Error:', error.message);
      throw new Error(`AI ThaiLLM API Error: ${error.message}`);
    }
  }

  async germini(transcript: string) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = _prompt(transcript);

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
    });
    this.logger.log('result', result.response.text());
    return { mom: result.response.text() };
  }
}
