# Deploy SIMPUS ke VPS

Panduan ini mengasumsikan:

- OS VPS: Ubuntu 22.04/24.04
- Domain frontend: `simpus.domainanda.com`
- Backend Node.js berjalan di port `4000`
- CouchDB berjalan lokal di VPS pada port `5984`
- Nginx dipakai sebagai reverse proxy

## 1. Struktur folder di VPS

```bash
/var/www/simpus
├── backend
└── frontend
```

## 2. Install dependensi server

```bash
sudo apt update
sudo apt install -y nginx curl
```

Install Node.js LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. Install CouchDB

Anda bisa menjalankannya dengan Docker atau instalasi native. Jika memakai Docker:

```bash
docker run -d \
  --name simpus-couchdb \
  -p 127.0.0.1:5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:3
```

Binding ke `127.0.0.1` lebih aman daripada membuka port publik.

## 4. Upload source code ke VPS

Salin proyek ke:

```bash
/var/www/simpus
```

Contoh:

```bash
scp -r simpus user@ip-vps:/var/www/
```

## 5. Konfigurasi backend

Masuk ke folder backend lalu buat file `.env` dari template:

```bash
cd /var/www/simpus/backend
cp /var/www/simpus/deploy/backend.env.production.example .env
npm install
```

Sesuaikan isi `.env`:

```env
PORT=4000
JWT_SECRET=ganti-dengan-secret-yang-kuat
CORS_ORIGIN=https://simpus.domainanda.com,https://www.simpus.domainanda.com
COUCHDB_URL=http://admin:password@127.0.0.1:5984
COUCHDB_RECORDS_DB=simpus_records
COUCHDB_AUTH_DB=simpus_auth
```

## 6. Konfigurasi frontend

Masuk ke folder frontend:

```bash
cd /var/www/simpus/frontend
cp /var/www/simpus/deploy/frontend.env.production.example .env
npm install
```

Sesuaikan isi `.env`:

```env
VITE_API_BASE_URL=https://simpus.domainanda.com/api
VITE_REMOTE_DB_URL=
VITE_COUCHDB_URL=https://simpus.domainanda.com/couchdb
VITE_COUCHDB_DB_NAME=simpus_records
```

Build frontend:

```bash
npm run build
```

## 7. Jalankan backend dengan systemd

Salin service file:

```bash
sudo cp /var/www/simpus/deploy/simpus-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable simpus-backend
sudo systemctl start simpus-backend
sudo systemctl status simpus-backend
```

Jika user service bukan `www-data`, ubah field `User=` pada file service.

## 8. Konfigurasi Nginx

Salin konfigurasi:

```bash
sudo cp /var/www/simpus/deploy/nginx-simpus.conf /etc/nginx/sites-available/simpus
sudo ln -s /etc/nginx/sites-available/simpus /etc/nginx/sites-enabled/simpus
sudo nginx -t
sudo systemctl reload nginx
```

Ubah `server_name` dan path folder bila berbeda.

## 9. Pasang SSL

Jika domain sudah mengarah ke VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d simpus.domainanda.com -d www.simpus.domainanda.com
```

## 10. Verifikasi

Cek backend:

```bash
curl http://127.0.0.1:4000/api/health
```

Cek dari browser:

- `https://simpus.domainanda.com`
- `https://simpus.domainanda.com/api/health`

## 11. Catatan penting

- Saat frontend sync langsung ke CouchDB, endpoint `/couchdb/` harus bisa diakses dari browser.
- Jika nanti Anda ingin menyembunyikan CouchDB sepenuhnya dari browser, arsitektur sinkronisasi perlu diubah.
- Password demo `admin123` dan `perawat123` sebaiknya diganti sebelum produksi.
