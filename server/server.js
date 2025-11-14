// server.js
import dotenv from "dotenv";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import connectDB, { sequelize } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Порти
const PORT = Number(process.env.PORT || 5000);  // фолбек
const PORT_HTTPS = Number(process.env.PORT_HTTPS || process.env.PORT || 8443);

// Шляхи до сертифікатів
const KEY_PATH_DEFAULT  = path.join(__dirname, "api_cowboylogic_net.key");
const CERT_PATH_DEFAULT = path.join(__dirname, "api_cowboylogic_net.crt");
const KEY_PATH  = process.env.SSL_KEY_PATH  || KEY_PATH_DEFAULT;
const CERT_PATH = process.env.SSL_CERT_PATH || CERT_PATH_DEFAULT;

function createHttpsServer() {
  const key  = fs.readFileSync(KEY_PATH);
  const cert = fs.readFileSync(CERT_PATH);
  return https.createServer({ key, cert }, app);
}

async function start() {
  try {
    // DB init
    await connectDB();
    if (process.env.MIGRATE_WITH_SYNC === "1") {
      await sequelize.sync();
    }

    // Спробуємо HTTPS
    try {
      const httpsServer = createHttpsServer();
      httpsServer.listen(PORT_HTTPS, () => {
        console.log(`🔒 HTTPS backend running on port ${PORT_HTTPS}`);
      });
    } catch (e) {
      console.warn(`⚠️  HTTPS disabled (cert/key not found or unreadable): ${e.message}`);
      // Фолбек на HTTP
      http.createServer(app).listen(PORT, () => {
        console.log(`🟡 HTTP backend running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
