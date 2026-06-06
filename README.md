# EchoNote

EchoNote คือแอปสำหรับอัปโหลดเสียง/วิดีโอจากการประชุม แล้วช่วย:

- แปลงเสียงเป็นข้อความ (Speech-to-Text)
- สร้างสรุปการประชุม (MoM: Minutes of Meeting) ด้วย AI
- บันทึก/ดู/ลบประวัติ transcript ผ่าน Supabase

สแตกที่ใช้:

- Frontend: Angular 21 (Standalone + Signals)
- Backend: NestJS 11
- AI: Gemini, OpenRouter, ThaiLLM
- Storage/DB: Supabase

## Architecture

- Frontend รันที่ `http://localhost:9999` (เมื่อใช้ `npm start` ที่ root)
- Backend รันที่ `http://localhost:3000`
- ทุก endpoint ของ backend อยู่ภายใต้ prefix `/api`
- Frontend เรียก backend ผ่าน Angular proxy (`/api -> localhost:3000`)

## Prerequisites

- Node.js 20+
- npm 10+
- อินเทอร์เน็ตสำหรับเรียก AI/Supabase APIs

## Quick Start

1. ติดตั้ง dependencies

```bash
npm install
npm install --prefix packages/backend
```

2. สร้างไฟล์ `packages/backend/.env`

```env
PORT=3000
FRONT_END_PORT=9999

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_API_KEY
```

3. รันทั้ง frontend + backend พร้อมกัน

```bash
npm start
```

4. เปิดใช้งานที่

- Frontend: `http://localhost:9999`
- Backend health: `http://localhost:3000/api/health`

## Scripts

### Root

```bash
npm start           # run frontend + backend พร้อมกัน
npm run start:frontend
npm run start:backend
npm run build
npm run test
```

### Backend

```bash
npm run start:dev --prefix packages/backend
npm run test --prefix packages/backend
npm run test:e2e --prefix packages/backend
npm run lint --prefix packages/backend
```

## API Overview

Base URL (direct): `http://localhost:3000/api`

- `GET /health`
  - ตรวจสอบสถานะ backend และ Supabase
- `POST /speech-to-text`
  - form-data key: `file`
  - ส่งไฟล์เสียงไปถอดข้อความผ่าน ElevenLabs
- `POST /upload-audio`
  - form-data key: `audio`
  - อัปโหลดไฟล์เสียง แล้วแบ่งไฟล์เป็นช่วง (ถ้าเกิน 10 นาที)
- `POST /convert-to-audio`
  - form-data key: `file`
  - แปลงไฟล์วิดีโอเป็น MP3
- `POST /generate-mom`
  - body: `{ chunks: string[], selectedAI: { agent, model } }`
- `POST /save-transcript`
  - บันทึก transcript ลง Supabase
- `GET /get-transcript`
  - ดึงรายการ transcript ทั้งหมด
- `DELETE /delete-transcript/:id`
  - ลบ transcript ตาม id

## Environment Variables

- `PORT` ค่า port ของ backend (default 3000)
- `FRONT_END_PORT` ใช้กำหนด CORS origin ของ frontend
- `SUPABASE_URL` URL ของโปรเจกต์ Supabase
- `SUPABASE_ANON_KEY` anon key ของ Supabase
- `GEMINI_API_KEY` จำเป็นต่อการเริ่ม backend (AiAgentService)
- `OPENROUTER_API_KEY` จำเป็นเมื่อเลือก agent เป็น OpenRouter
- `ELEVENLABS_API_KEY` จำเป็นสำหรับ speech-to-text

## Typical User Flow

1. อัปโหลดไฟล์เสียง/วิดีโอ
2. ถอดเสียงเป็น transcript
3. แก้ไข transcript และเลือก AI agent/model
4. สร้าง MoM
5. บันทึก transcript แล้วดูย้อนหลังใน History

## Troubleshooting

- CORS error
  - ตรวจค่า `FRONT_END_PORT` ให้ตรงกับพอร์ต frontend ที่ใช้งานจริง
- เรียก `/api/*` ไม่ได้
  - ตรวจว่า backend รันอยู่ที่พอร์ต 3000 และ Angular proxy ทำงาน
- สร้าง MoM ไม่ได้ตั้งแต่เริ่มระบบ
  - ตรวจว่าตั้งค่า `GEMINI_API_KEY` แล้ว (service นี้ถูกสร้างตอนบูต)
- ถอดเสียงไม่ได้
  - ตรวจ `ELEVENLABS_API_KEY`
- บันทึก transcript ไม่ได้
  - ตรวจ `SUPABASE_URL` และ `SUPABASE_ANON_KEY`

## Notes

- ในโค้ดปัจจุบัน มีการตั้งค่า token สำหรับ ThaiLLM แบบ hardcoded ใน backend ซึ่งควรย้ายไปเป็น environment variable ก่อนใช้งานจริงใน production.
