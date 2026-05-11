export interface ITranscript {
  id?: string;
  user_id: string;
  sub_ject: string;
  content: string;
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
  ThaiLLM = 'thaiLLM',
  Germini = 'germini',
}

export enum EnumAIModel {
  OPEN_THAI_GPT = 'OPEN_THAI_GPT',
  QWEN_3 = 'QWEN_3',
}
