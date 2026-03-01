# Form Builder Application (Next.js + Supabase) 🚀

Aplikasi **Form Builder** fullstack yang memungkinkan pengguna membuat formulir, membagikannya, dan mengumpulkan respons secara *real-time*. Dilengkapi dengan sistem autentikasi kustom, validasi data yang ketat, dan dokumentasi API otomatis.

## ✨ Fitur Utama

* **Authentication**: Login & Register dengan validasi unik (Username & Email tidak boleh kembar). Menggunakan JWT (JSON Web Token).
* **Form Management**: Membuat, mengedit, menghapus, dan mengubah status formulir (Draft/Published/Closed).
* **Drag & Drop Interface**: Menyusun urutan pertanyaan dengan mudah menggunakan `dnd-kit`.
* **Question Types**: Mendukung Short Answer, Multiple Choice, Checkbox, dan Dropdown.
* **Response Analytics**: Melihat daftar responden (Nama & Email) beserta jawaban mereka.
* **API Documentation**: Dokumentasi REST API lengkap menggunakan Swagger UI.
* **Security**: Proteksi endpoint API, validasi input (Zod), dan Secure Cookies.
* **UI/UX**: Desain responsif dengan Dark Mode support (Shadcn UI).

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript
* **Database**: Supabase (PostgreSQL)
* **Styling**: Tailwind CSS, Shadcn UI
* **Auth**: Custom Auth (Jose + Bcrypt + Cookies)
* **Validation**: Zod & React Hook Form
* **Docs**: Next-Swagger-Doc

---

## ⚙️ Prasyarat (Prerequisites)

Sebelum memulai, pastikan Anda telah menginstal:
1.  **Node.js** (Versi 18 atau lebih baru).
2.  **Akun Supabase** (untuk database).

---

## 🗄️ Setup Database (Supabase)

Aplikasi ini membutuhkan struktur tabel tertentu agar dapat berjalan.

1.  Buka file `src/migrations/001-auth-profiles.sql` yang ada di dalam repository ini.
2.  Salin seluruh kode SQL yang ada di dalam file tersebut.
3.  Buka dashboard **Supabase** Anda, masuk ke menu **SQL Editor**.
4.  Tempel (Paste) kode tersebut dan klik **Run**.

Query tersebut akan otomatis membuat tabel `users`, `forms`, `questions`, `submissions`, `answers`, serta mengatur relasi dan enum yang dibutuhkan.

---

## 🚀 Instalasi & Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di lokal:

### 1. Clone Repository
```bash
git clone https://github.com/DerNiks/oprec-ristek.git
cd oprec-ristek
npm install --legacy-peer-deps
```

### 2. ENV
Buat file .env di root folder project. Anda bisa menyalin format dari file env.example.

### 3. Run
```bash
npm run dev
```
Buka http://localhost:3000 di browser Anda.

### 4. Dokumentasi API
Pastikan server berjalan.
Buka URL: http://localhost:3000/api-doc

