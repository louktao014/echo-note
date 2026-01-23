import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { MOCK_RES_GERMINI } from './mock-data';

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

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * สรุปรายงานการประชุม (Minutes of Meeting)
   */
  async summarizeMeeting(transcript: string): Promise<{ mom: string }> {
    this.logger.log('Summarizing meeting transcript with Gemini');
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const prompt = `
        คุณคือผู้ช่วยสรุปรายงานการประชุม (Minutes of Meeting)

        กรุณาสรุปเนื้อหาจากบทถอดเสียงด้านล่าง
        โดยจัดรูปแบบดังนี้:

        1. สรุปเนื้อหาสำคัญ
        2. มติที่ประชุม
        3. สิ่งที่ต้องดำเนินการต่อ (Action Items)
        - งาน | ผู้รับผิดชอบ | Deadline
        4. ประเด็นอื่น ๆ

        หมายเหตุ:
        - หากช่วงใดของบทสนทนาไม่ชัดเจน ให้ระบุว่า [เสียงไม่ชัดเจน]
        - ใช้ภาษาไทยทางการ กระชับ และชัดเจน

        บทถอดเสียง:
        """
        ${transcript}
        """
      `;
      return MOCK_RES_GERMINI;
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
    } catch (error) {
      this.logger.error('Gemini summarize error', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * สรุปข้อความทั่วไป (ใช้ซ้ำได้)
   */
  async summarizeText(text: string): Promise<string> {
    this.logger.log('Summarizing text with Gemini');

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: `สรุปข้อความต่อไปนี้แบบกระชับ:\n\n${text}` }],
          },
        ],
        generationConfig: this.generationConfig,
      });

      return result.response.text().trim();
    } catch (error) {
      this.logger.error('Gemini summarizeText error', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
}
