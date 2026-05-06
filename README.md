# SIMPUS Offline-First

Panduan ini menjelaskan cara menjalankan proyek ini di lokal, mulai dari database CouchDB, backend, sampai frontend.

## Ringkasan Arsitektur

- `frontend`: React + Vite
- `backend`: Node.js + Express
- `database`: CouchDB
- `sinkronisasi`: frontend menyimpan data ke PouchDB lokal browser lalu sync ke CouchDB

Port default:

- frontend: `5173`
- backend: `4000`
- CouchDB: `5984`

## Prasyarat

Pastikan lokal Anda sudah punya:

- Node.js 20+ dan npm
- Docker dan Docker Compose

Jika ingin menjalankan tanpa Docker untuk backend/frontend, Docker tetap disarankan minimal untuk CouchDB.

## Opsi 1: Jalankan Paling Cepat dengan Docker Compose

Cara ini paling cepat kalau ingin langsung melihat aplikasi hidup penuh.

### 1. Jalankan semua service

Dari root project:

```bash
docker compose up --build
```

Atau jika environment Anda memakai nama file `docker-compose.yaml` secara eksplisit:

```bash
docker compose -f docker-compose.yaml up --build
```

### 2. Akses aplikasi

- frontend: `http://localhost:5173`
- backend health check: `http://localhost:4000/api/health`
- CouchDB: `http://localhost:5984`

### 3. Stop service

```bash
docker compose down
```

Jika ingin ikut menghapus volume CouchDB:

```bash
docker compose down -v
```

## Opsi 2: Setup Lokal Manual

Opsi ini cocok kalau Anda ingin menjalankan frontend dan backend langsung dengan `npm`, lalu database CouchDB tetap memakai Docker.

## 1. Jalankan CouchDB

```bash
docker run -d \
  --name simpus-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:3
```

Verifikasi:

```bash
curl http://admin:password@127.0.0.1:5984/
```

Jika berhasil, CouchDB akan mengembalikan JSON dengan field seperti `couchdb`, `version`, dan `vendor`.

## 2. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Buat file environment dari template:

```bash
cp .env.example .env
```

Isi minimal `backend/.env`:

```env
PORT=4000
JWT_SECRET=simpus-offline-secret
CORS_ORIGIN=http://localhost:5173
COUCHDB_URL=http://admin:password@127.0.0.1:5984
COUCHDB_RECORDS_DB=simpus_records
COUCHDB_AUTH_DB=simpus_auth
```

Jalankan backend:

```bash
npm run dev
```

Verifikasi backend:

```bash
curl http://127.0.0.1:4000/api/health
```

Respons yang benar:

```json
{"status":"ok","timestamp":"...","database":"couchdb"}
```

## 3. Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file environment dari template:

```bash
cp .env.example .env
```

Isi minimal `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_REMOTE_DB_URL=
VITE_COUCHDB_URL=http://admin:password@127.0.0.1:5984
VITE_COUCHDB_DB_NAME=simpus_records
```

Jalankan frontend:

```bash
npm run dev
```

Buka:

```text
http://localhost:5173
```

## Akun Login Demo

User awal disediakan oleh backend saat start pertama:

- Admin
  - username: `admin`
  - password: `admin123`
- Perawat
  - username: `perawat`
  - password: `perawat123`

Sumber user demo ada di [backend/src/users.js](/home/rizky/Documents/simpus/backend/src/users.js).

## Verifikasi Koneksi End-to-End

Setelah semua hidup, cek:

### 1. Backend ke CouchDB

```bash
curl http://127.0.0.1:4000/api/health
```

Field `database` harus bernilai `couchdb`.

### 2. Frontend bisa menjangkau CouchDB

```bash
curl http://admin:password@127.0.0.1:5984/simpus_records
```

Jika database belum ada, backend akan membuatnya saat seed/sinkronisasi pertama.

### 3. Uji dari browser

1. Login sebagai `admin`
2. Tambah 1 pasien
3. Klik `Sinkronkan Sekarang`
4. Reload halaman
5. Pastikan data masih ada

## Struktur Menjalankan Lokal

Kalau dijalankan manual, gunakan 3 terminal:

### Terminal 1

```bash
docker start -a simpus-couchdb
```

### Terminal 2

```bash
cd backend
npm run dev
```

### Terminal 3

```bash
cd frontend
npm run dev
```

## Troubleshooting

### 1. Status `Backend Offline`

Cek:

```bash
curl http://127.0.0.1:4000/api/health
```

Jika gagal, backend belum hidup atau env backend salah.

### 2. Error `You are not authorized to access this db`

Biasanya username/password CouchDB di `COUCHDB_URL` atau `VITE_COUCHDB_URL` tidak cocok.

Cek:

```bash
curl http://admin:password@127.0.0.1:5984/
curl http://admin:password@127.0.0.1:5984/simpus_records
```

### 3. Data tidak muncul setelah reload

- klik `Sinkronkan Sekarang`
- cek console browser
- cek apakah CouchDB hidup
- cek apakah service worker/cache browser masih menyimpan state lama

### 4. Ingin reset database lokal browser

Hapus data site lewat DevTools browser:

- `Application`
- `Storage`
- `Clear site data`

### 5. Ingin reset CouchDB lokal

Jika memakai Docker Compose:

```bash
docker compose down -v
docker compose up --build
```

Jika memakai container manual:

```bash
docker rm -f simpus-couchdb
docker run -d \
  --name simpus-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:3
```

## Catatan

- Fitur offline penuh di browser paling stabil saat berjalan di `localhost` atau `https`.
- Untuk produksi/VPS, lihat panduan [deploy/VPS_SETUP.md](/home/rizky/Documents/simpus/deploy/VPS_SETUP.md).
