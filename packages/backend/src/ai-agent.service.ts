import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import {
  _prompt,
  _prompt_summary,
  MOCK_RES_GERMINI,
} from './mock_data/mock-data';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AI_MODEL, EnumAIAgent, EnumAIModel } from './model/transcript.model';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
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
      if (isTest) {
        return MOCK_RES_GERMINI;
      } else {
        return this.getAgent(selectedAI, transcript);
      }
    } catch (error: any) {
      this.logger.error('Gemini summarize error', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
  getAgent(
    selectedAI: { agent: EnumAIAgent; model: EnumAIModel },
    transcript: string,
  ): Promise<{ mom: string }> {
    this.logger.log(
      `Summarizing meeting transcript with >> { agent: ${selectedAI.agent} , model: ${selectedAI.model} }`,
    );
    switch (selectedAI.agent) {
      case EnumAIAgent.THAI_LLM:
        return this.thaiLLM(transcript, selectedAI.model);
      case EnumAIAgent.OPEN_ROUTER:
        return this.openRouter(transcript);
      case EnumAIAgent.GERMINI:
        return this.germini(transcript);
      default:
        throw new Error(`Unknown agent: ${selectedAI.agent}`);
    }
  }

  async thaiLLM(
    transcript: string,
    modelSelected: EnumAIModel = EnumAIModel.QWEN_3,
  ): Promise<{ mom: string }> {
    /**
     * @this New (OpenAI-compatible) — recommended
     * @constant {const url = 'http://thaillm.or.th/api/v1/chat/completions'}
     * @this Legacy (path-based) — still supported
     * @constant {const url_legacy = 'http://thaillm.or.th/api/openthaigpt/v1/chat/completions';}
     */
    const url = 'http://thaillm.or.th/api/v1/chat/completions';
    const model = AI_MODEL[modelSelected];
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

  async openRouter(transcript: string): Promise<{ mom: string }> {
    const baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    const model = 'nvidia/nemotron-3-super-120b-a12b:free';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    };
    const prompt = _prompt_summary(transcript);
    const payload = {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      reasoning: { enabled: true },
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(baseURL, payload, { headers }),
      );
      return { mom: response.data.choices[0].message.content };
    } catch (error: any) {
      this.logger.error('OpenRouter API Error:', error.message);
      throw this.handleError(error);
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

  handleError(error: any) {
    const status = error.response?.status;
    switch (status) {
      case 401:
        throw new UnauthorizedException(
          'OpenRouter API Error: Invalid API key',
        );
      case 404:
        throw new NotFoundException('OpenRouter API Error: Model not found');
      case 429:
        throw new BadRequestException(
          'OpenRouter API Error: Rate limit exceeded',
        );
      default:
        throw new InternalServerErrorException(
          error.response?.data || error.message,
        );
    }
  }
}
