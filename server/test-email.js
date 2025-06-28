import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { sendEmail } from "./services/emailService.js";

sendEmail("milkaegik@gmail.com", "SMTP Test", "<p>Hello from CLP</p>")
  .then(() => console.log("✅ Sent"))
  .catch(console.error);