import { verifySMTP, sendEmail } from "../services/emailService.js";

await verifySMTP();
await sendEmail("milkaegik@gmail.com", "Mailgun local test", "<b>ok</b>");

console.log("DONE");
