export interface ITranscript {
  id?: string;
  user_id: string;
  sub_ject: string;
  content: string;
  aiAgent: EnumAIAgent;
  created_at: string;
  updated_at: string;
}

export interface IConfirmTranscriptParams {
  action: string;
  subject: string;
  content: string;
  selectedAI: {
    agent: EnumAIAgent;
    model: EnumAIModel;
  };
}

export enum EnumAIAgent {
  THAI_LLM = 'ThaiLLM',
  GERMINI = 'Germini',
  OPEN_ROUTER = 'OpenRouter',
  MANUAL = 'Manual',
}

export enum EnumAIModel {
  OPEN_THAI_GPT = 'OpenThaiGPT',
  QWEN_3 = 'Qwen3',
}
