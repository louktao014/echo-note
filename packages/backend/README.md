# EchoNote Backend

NestJS backend สำหรับระบบ EchoNote ทำหน้าที่:

- รับไฟล์เสียง/วิดีโอและประมวลผลไฟล์
- ถอดเสียงผ่าน ElevenLabs
- สร้าง MoM ด้วย AI (Gemini, OpenRouter, ThaiLLM)
- จัดการข้อมูล transcript ผ่าน Supabase

## Tech Stack

- NestJS 11
- TypeScript
- Multer + fluent-ffmpeg
- Supabase SDK
- Axios / Nest HttpModule

## Getting Started

1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้างไฟล์ `.env` ในโฟลเดอร์นี้ (`packages/backend/.env`)

```env
PORT=3000
FRONT_END_PORT=9999

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
```

3. รันแบบพัฒนา

```bash
npm run start:dev
```

Backend จะเปิดที่ `http://localhost:3000` และตั้ง global prefix เป็น `/api`

## Scripts

```bash
npm run build
npm run start
npm run start:dev
npm run start:prod
npm run lint
npm run test
npm run test:e2e
npm run test:cov
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Health

- `GET /health`
  - ตรวจสุขภาพ backend และ Supabase

### Speech / Audio

- `POST /speech-to-text`
  - form-data: `file`
  - ส่งไฟล์ไปถอดเสียงด้วย ElevenLabs

- `POST /upload-audio`
  - form-data: `audio`
  - อัปโหลดไฟล์เสียงและแยกช่วงไฟล์ (กรณีไฟล์ยาวเกิน 10 นาที)

- `POST /convert-to-audio`
  - form-data: `file`
  - แปลงวิดีโอเป็น MP3

### MoM

- `POST /generate-mom`

```json
{
  "chunks": ["transcript text..."],
  "selectedAI": {
    "agent": "OpenRouter",
    "model": "Qwen3"
  }
}
```

### Transcript CRUD

- `POST /save-transcript`
- `GET /get-transcript`
- `DELETE /delete-transcript/:id`

## Environment Variables

- `PORT` พอร์ตที่ backend ใช้งาน
- `FRONT_END_PORT` พอร์ต frontend สำหรับ CORS
- `SUPABASE_URL` URL ของ Supabase project
- `SUPABASE_ANON_KEY` Anon key ของ Supabase
- `GEMINI_API_KEY` จำเป็นต่อการเริ่มระบบ AI service
- `OPENROUTER_API_KEY` ใช้เมื่อเรียก OpenRouter
- `ELEVENLABS_API_KEY` ใช้กับ endpoint ถอดเสียง

## Notes

- ค่า token ของ ThaiLLM ในโค้ดปัจจุบันยังถูกกำหนดแบบ hardcoded แนะนำให้ย้ายเป็น environment variable ก่อน deploy.
- โฟลเดอร์อัปโหลดจะอยู่ภายใต้ `uploads/` และไฟล์ที่ประมวลผลแล้วจะอยู่ใน `uploads/processed`.
