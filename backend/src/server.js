import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import ExpressPouchDB from "express-pouchdb";
import { createProxyMiddleware } from "http-proxy-middleware";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import { config } from "./config.js";
import { PouchDB } from "./db.js";
import { seedUsers } from "./seed.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    },
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));

if (config.useRemoteCouchdb) {
  const couchdbTarget = new URL(config.couchdbUrl);
  const proxyTarget = `${couchdbTarget.protocol}//${couchdbTarget.host}`;
  const proxyAuth =
    couchdbTarget.username || couchdbTarget.password
      ? `${decodeURIComponent(couchdbTarget.username)}:${decodeURIComponent(couchdbTarget.password)}`
      : undefined;

  app.use(
    "/couchdb",
    createProxyMiddleware({
      target: proxyTarget,
      auth: proxyAuth,
      changeOrigin: true,
      pathRewrite: {
        "^/couchdb": "",
      },
    })
  );
}

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: config.useRemoteCouchdb ? "couchdb" : "pouchdb-local",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
if (!config.useRemoteCouchdb) {
  app.use(
    "/db",
    ExpressPouchDB(PouchDB, {
      mode: "minimumForPouchDB",
    })
  );
}

app.use((error, _req, res, _next) => {
  if (error.status === 404) {
    return res.status(404).json({ message: "Data tidak ditemukan." });
  }

  console.error(error);
  return res.status(500).json({ message: "Terjadi kesalahan pada server." });
});

async function start() {
  await seedUsers();
  const server = app.listen(config.port, () => {
    console.log(`SIMPUS backend berjalan di http://localhost:${config.port}`);
    console.log(
      `Mode database: ${config.useRemoteCouchdb ? `CouchDB (${config.couchdbUrl})` : "PouchDB lokal"}`
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${config.port} sedang dipakai proses lain. Hentikan proses lama atau ganti nilai PORT di backend/.env.`
      );
      process.exit(1);
    }

    console.error("Gagal membuka port server", error);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error("Gagal menjalankan backend", error);
  process.exit(1);
});
