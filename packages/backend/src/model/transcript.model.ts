export interface ITranscript {
  user_id: string;
  sub_ject: string;
  content: string;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export enum EnumAIAgent {
  THAI_LLM = 'ThaiLLM',
  GERMINI = 'Germini',
  OPEN_ROUTER = 'OpenRouter',
}

export enum EnumAIModel {
  OPEN_THAI_GPT = 'OPEN_THAI_GPT',
  QWEN_3 = 'QWEN_3',
}

export const AI_MODEL: Record<string, string> = {
  [EnumAIModel.OPEN_THAI_GPT]: 'openthaigpt-thaillm-8b-instruct-v7.2',
  [EnumAIModel.QWEN_3]: 'pathumma-thaillm-qwen3-8b-think-3.0.0',
};
