import styles from "./Privacy.module.css";
import { useEffect } from "react";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Your Company";
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "support@example.com";
const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_ADDRESS || "Your address";
const JURISDICTION = import.meta.env.VITE_JURISDICTION || "Your country/state";
const LAST_UPDATED = import.meta.env.VITE_PRIVACY_LAST_UPDATED || "2025-01-01";

export default function Privacy() {
  useEffect(() => {
    document.title = `Privacy Policy — ${COMPANY_NAME}`;
  }, []);

  return (
    <div className="layoutContainer">
      <div className={styles.page}>
        <h1>Privacy Policy</h1>
        <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>

        <p>
          This Privacy Policy describes how {COMPANY_NAME} (“we”, “us”, “our”) collects, uses, and
          protects your personal data when you use our website and services.
        </p>

        <h2>1. Data Controller</h2>
        <p>
          Data Controller: {COMPANY_NAME}<br />
          Address: {COMPANY_ADDRESS}<br />
          Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>

        <h2>2. What Data We Collect</h2>
        <ul>
          <li>Account data (name, email, password hash if you register with email).</li>
          <li>OAuth data when you sign in with Google (name, email; no access to your password).</li>
          <li>Order & billing data (items purchased, totals). Payments are processed by Square.</li>
          <li>Technical data (IP address, browser info, device, cookies/refresh tokens).</li>
          <li>Communications (messages sent via contact forms, support emails).</li>
        </ul>

        <h2>3. How We Use Data</h2>
        <ul>
          <li>To provide and maintain your account and our services.</li>
          <li>To process orders and deliver purchases.</li>
          <li>To secure sessions (access token + httpOnly refresh cookie).</li>
          <li>To send service emails (verification, receipts, important notices).</li>
          <li>To improve the website and detect/prevent fraud and abuse.</li>
        </ul>

        <h2>4. Legal Bases (GDPR)</h2>
        <ul>
          <li>Contract performance (account, orders, support).</li>
          <li>Legitimate interests (security, analytics, preventing abuse).</li>
          <li>Consent (newsletters/marketing, where applicable).</li>
          <li>Legal obligations (tax, accounting).</li>
        </ul>

        <h2>5. Cookies & Tokens</h2>
        <p>
          We use short-lived access tokens (in memory) and httpOnly refresh cookies to keep you
          signed in. Cookies may be configured with <code>SameSite</code> and <code>Secure</code> attributes depending on the environment.
        </p>

        <h2>6. Third-Party Services</h2>
        <ul>
          <li>
            <strong>Google Sign-In</strong>: We verify Google ID tokens to authenticate you. We do
            not receive your Google password.
          </li>
          <li>
            <strong>Square</strong>: Payments are processed by Square. We do not store full card
            numbers on our servers.
          </li>
          {/* додай інші інтеграції, якщо будуть */}
        </ul>

        <h2>7. Data Retention</h2>
        <p>
          We keep personal data only as long as necessary for the purposes described, or as required
          by law (e.g., accounting). You may request deletion where applicable.
        </p>

        <h2>8. Your Rights</h2>
        <p>
          Depending on your jurisdiction (e.g., GDPR/CCPA in {JURISDICTION}), you may have rights to access...
          delete, restrict or object to processing, data portability, and to withdraw consent.
          Contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>9. Children’s Privacy</h2>
        <p>
          Our services are not directed to children under the age required by applicable law. We do
          not knowingly collect data from children.
        </p>

        <h2>10. International Transfers</h2>
        <p>
          If data is transferred outside your country, we use appropriate safeguards as required by
          law.
        </p>

        <h2>11. Security</h2>
        <p>
          We implement technical and organizational measures to protect personal data. No method of
          transmission over the Internet is 100% secure.
        </p>

        <h2>12. Changes</h2>
        <p>
          We may update this Policy. We will post the new version with an updated date. Continued
          use constitutes acceptance of the updated Policy.
        </p>

        <h2>13. Contact</h2>
        <p>
          For privacy inquiries, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <p className={styles.note}>
          This page is for informational purposes and does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}
