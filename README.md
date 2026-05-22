# StudyFlow AI

StudyFlow AI adalah web app academic task manager untuk mahasiswa. Aplikasi ini membantu mengelola mata kuliah, tugas, deadline, jadwal kuliah, progress, checklist, notes, dan rekomendasi belajar berbasis AI.

Project ini dibuat sebagai portfolio full-stack modern dengan Next.js App Router, Supabase, dan Google Gemini API. Aplikasi dapat dijalankan lokal dan dideploy ke Vercel.

## Catatan MVP

StudyFlow AI adalah web app only. MVP ini tidak mencakup native mobile app, React Native, Expo, PWA, push notification, OCR, reminder otomatis, import Google Calendar, atau import jadwal otomatis.

## Fitur Utama

- Authentication: register, login, logout, dan protected route.
- Dashboard dinamis dari data Supabase.
- Statistik tugas: total, selesai, in progress, overdue, deadline hari ini, deadline minggu ini, dan overall progress.
- Upcoming deadlines dan recent tasks.
- CRUD mata kuliah.
- CRUD jadwal kuliah manual.
- CRUD tugas akademik.
- Filter tugas: all, today, this week, overdue, completed.
- Search tugas berdasarkan judul.
- Detail tugas dengan status, progress, checklist, notes, dan study plan.
- Checklist per tugas dengan progress tracking.
- Notes per tugas.
- Deadline badge: Due Today, Due Tomorrow, Due This Week, Overdue.
- Light mode dan dark mode.
- Responsive layout untuk desktop dan mobile browser.

## Fitur AI

Semua fitur AI memanggil Gemini dari server-side API routes. `GEMINI_API_KEY` tidak pernah dipakai langsung di frontend.

- AI Task Breakdown: membuat checklist dari detail tugas.
- AI Study Plan Generator: membuat rencana belajar bertahap sebelum deadline.
- AI Priority Assistant: mengurutkan tugas aktif berdasarkan urgency dan importance.
- AI Notes Summarizer: merangkum notes menjadi summary, important points, dan suggested next actions.

## Tech Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Supabase Database dan Authentication.
- Supabase Row Level Security.
- Google Gemini API dengan official SDK `@google/genai`.
- lucide-react.
- Vercel.

## Struktur Folder

```txt
app/
  (main)/
    ai/priority/
    courses/
    dashboard/
    schedule/
    settings/
    tasks/
      [id]/
  api/ai/
    breakdown/
    priority/
    study-plan/
    summarize-notes/
  login/
  register/

components/
  ai/
  auth/
  courses/
  dashboard/
  layout/
  schedule/
  tasks/
  theme/
  ui/

lib/
  deadline.ts
  gemini.ts
  supabase.ts
  utils.ts

database/
  schema.sql

docs/
  screenshots/

README.md
PANDUAN_SETUP.md
PANDUAN_CUSTOMISASI.md
.env.example
```

## Screenshot

Simpan screenshot portfolio di folder `docs/screenshots/`.

Rekomendasi screenshot:

- Dashboard.
- Courses atau Mata Kuliah.
- Tasks.
- Task Detail dengan checklist dan notes.
- Modal AI Task Breakdown.
- AI Priority Assistant.
- Tampilan mobile browser.

Contoh penulisan:

```md
![Dashboard StudyFlow AI](docs/screenshots/dashboard.png)
```

## Cara Install

Install dependency:

```bash
npm install
```

Salin file environment:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Jangan menaruh API key asli di `.env.example`, README, screenshot, atau file source code.

## Cara Menjalankan Lokal

Jalankan development server:

```bash
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Jika environment variable baru ditambahkan atau diubah, hentikan server lalu jalankan ulang `npm run dev`.

## Database Supabase

Jalankan file berikut di Supabase SQL Editor:

```txt
database/schema.sql
```

Schema akan membuat tabel:

- `profiles`
- `courses`
- `schedule_sessions`
- `tasks`
- `task_checklists`
- `task_notes`
- `study_plans`
- `study_plan_items`
- `ai_suggestions`

Schema juga mengaktifkan Row Level Security agar user hanya bisa mengakses data miliknya sendiri.

## Cara Deploy ke Vercel

1. Push project ke GitHub.
2. Login ke Vercel.
3. Klik Add New Project.
4. Import repository StudyFlow AI.
5. Pastikan framework terdeteksi sebagai Next.js.
6. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
7. Klik Deploy.
8. Setelah deploy selesai, test register, login, dashboard, CRUD, dan fitur AI.

Jika environment variable di Vercel diubah setelah deploy, lakukan redeploy agar nilai baru dipakai.

## Future Improvements

Fitur berikut hanya rencana lanjutan, bukan bagian MVP:

- PWA support.
- Add to Home Screen.
- Browser notification reminder.
- Task deadline reminder.
- Class schedule reminder.
- Google Calendar integration.
- Import jadwal dari CSV.
- Import jadwal dari PDF atau screenshot menggunakan OCR/AI.
- Export data tugas ke CSV.
- Analytics produktivitas belajar.

## Keamanan

- `.env.local` wajib masuk `.gitignore`.
- `.env.example` hanya berisi placeholder.
- Jangan hardcode Supabase key atau Gemini key.
- `GEMINI_API_KEY` hanya dibaca di server-side API routes.
- Aktifkan RLS di Supabase.
- Query data user harus dibatasi dengan `user_id` dan `auth.uid()`.

## Referensi Resmi

- Supabase Row Level Security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Vercel Environment Variables: <https://vercel.com/docs/projects/environment-variables>
- Gemini API Key: <https://ai.google.dev/gemini-api/docs/api-key>
