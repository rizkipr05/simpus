# SIMPUS Offline-First

Sistem Informasi Manajemen Puskesmas berbasis offline-first dengan:

- Frontend: React + Vite + PWA + PouchDB/IndexedDB
- Backend: Node.js + Express
- Server database: CouchDB
- Sinkronisasi: replikasi dua arah PouchDB ↔ CouchDB

## Struktur

- `frontend`: aplikasi React untuk admin/perawat
- `backend`: API autentikasi, session, dan database sync endpoint

## Fitur utama

- Login pengguna
- Pendaftaran pasien offline
- Rekam medis offline
- Riwayat pemeriksaan pasien
- Sinkronisasi dua arah saat online
- Penanganan konflik dasar berbasis timestamp terbaru

## Menjalankan CouchDB

Contoh cepat dengan Docker:

```bash
docker run -d \
  --name simpus-couchdb \
  -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:3
```

CouchDB akan aktif di `http://127.0.0.1:5984`.

Pastikan CORS di CouchDB mengizinkan origin frontend jika frontend melakukan sinkronisasi langsung ke CouchDB.

## Menjalankan backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend aktif di `http://localhost:4000`.

Jika `COUCHDB_URL` diisi, backend akan memakai CouchDB untuk:

- database user/login (`simpus_auth`)
- database data pasien dan rekam medis (`simpus_records`)

Jika `COUCHDB_URL` kosong, backend fallback ke penyimpanan PouchDB lokal dan tetap membuka endpoint `/db`.

## Menjalankan frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend aktif di `http://localhost:5173`.

Frontend memakai:

- `PouchDB` lokal di browser (`IndexedDB`)
- replikasi ke CouchDB dari `VITE_COUCHDB_URL/VITE_COUCHDB_DB_NAME`
- fallback ke `VITE_REMOTE_DB_URL` bila ingin tetap sync ke endpoint Couch-compatible lain

## Akun demo

- Admin: `admin` / `admin123`
- Perawat: `perawat` / `perawat123`

## Catatan arsitektur

- Data aplikasi disimpan dulu ke PouchDB lokal browser.
- Saat online, frontend melakukan `sync()` ke database `simpus_records` di CouchDB.
- Backend juga membaca dan menulis dokumen ke CouchDB yang sama, sehingga API dan replikasi berbagi sumber data.
- Saat `COUCHDB_URL` tidak diisi, backend menyediakan endpoint CouchDB-compatible melalui `express-pouchdb` pada path `/db`.
- Konflik data ditangani dengan memilih dokumen dengan `updatedAt` paling baru.

## Build PWA

```bash
cd frontend
npm run build
```

Hasil build bisa di-host sebagai aplikasi web installable.
